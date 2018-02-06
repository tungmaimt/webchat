var events = require("events");
var util = require("util");
var crypto = require("crypto");
var Queue = require("./queue");

function _noop() {}

/**
 * Creates a new service endpoint utilizing message queues
 * @param bus
 * @param name the service name
 * @constructor
 */
function Service(bus, name) {
  events.EventEmitter.call(this);
  this.bus = bus;
  this.name = name;
  this.logger = bus.logger.withTag(name);
  this.type = "service";
  this.id = "service:" + name;
  this.replyTo = this.id + ":replyTo:" + crypto.randomBytes(8).toString("hex");
  this.pendingReplies = {};
  this.requesters = {};
  this.inflight = 0;
}

util.inherits(Service, events.EventEmitter);

/**
 * Connect to the service queue and setup listeners
 * @param {*} options 
 * @param {*} cb 
 * @private
 */
Service.prototype._connect = function(options, cb) {
  var _this = this;
  this.options = util._extend({ reqTimeout: 1000 }, options);

  // force unreliable message delivery since multiple service providers could be
  // serving the endpoint, and reliable delivery is not well defined when there are multiple
  // consumers on a single queue
  this.options.reliable = false;
  this.options.remove = true;
  this.options.max = -1;
  this.qService = new Queue(this.bus, this.id);

  var detachedCount = 1;
  var _detached = function() {
    if (--detachedCount === 0) {
      _this.emit("disconnect");
      _attached = undefined;
      _detached = undefined;
    }
  };

  var onServiceError = function(err) {
    if (_this.qService) {
      _this.emit("error", err);
    }
  };

  var onServiceAttached = function() {
    if (_this.qService && !_this.qReplyTo) {
      cb && cb();
      cb = null;
    }
  };

  var onServiceMessage = function(msg, id) {
    if (_this.qService) {
      _this._handleRequest(msg, id);
    }
  };

  var onServiceConsuming = function(state) {
    state && _this.emit("serving");
  };

  var onServiceDetached = function() {
    // register an empty error listener so errors don't throw exceptions
    _this.qService.on("error", _noop);
    _this.qService.removeListener("error", onServiceError);
    onServiceError = undefined;
    _this.qService.removeListener("attached", onServiceAttached);
    onServiceAttached = undefined;
    _this.qService.removeListener("message", onServiceMessage);
    onServiceMessage = undefined;
    _this.qService.removeListener("detached", onServiceDetached);
    onServiceDetached = undefined;
    _this.qService.removeListener("consuming", onServiceConsuming);
    onServiceConsuming = undefined;
    _this.qService = null;
    _detached();
  };

  this.qService.on("error", onServiceError);
  this.qService.on("message", onServiceMessage);
  this.qService.on("attached", onServiceAttached);
  this.qService.on("detached", onServiceDetached);
  this.qService.on("consuming", onServiceConsuming);
  this.qService.attach(this.options);

  if (this.qReplyTo) {
    ++detachedCount;
    var onReplyToError = function(err) {
      if (_this.qReplyTo) {
        _this.emit("error", err);
      }
    };

    var onReplyToAttached = function() {
      if (_this.qReplyTo) {
        cb && cb();
        cb = null;
      }
    };

    var onReplyToMessage = function(msg, id) {
      if (_this.qReplyTo) {
        _this._handleReply(msg, id);
      }
    };

    var onReplyToConsuming = function(state) {
      state && _this.emit("connected", state);
    };

    var onReplyToDetached = function() {
      // register an empty error listener so errors don't throw exceptions
      _this.qReplyTo.on("error", _noop);
      _this.qReplyTo.removeListener("error", onReplyToError);
      onReplyToError = undefined;
      _this.qReplyTo.removeListener("attached", onReplyToAttached);
      onReplyToAttached = undefined;
      _this.qReplyTo.removeListener("message", onReplyToMessage);
      onReplyToMessage = undefined;
      _this.qReplyTo.removeListener("detached", onReplyToDetached);
      onReplyToDetached = undefined;
      _this.qReplyTo.removeListener("consuming", onReplyToConsuming);
      onReplyToConsuming = undefined;
      _this.qReplyTo = null;
      _detached();
    };

    this.qReplyTo.on("error", onReplyToError);
    this.qReplyTo.on("message", onReplyToMessage);
    this.qReplyTo.on("attached", onReplyToAttached);
    this.qReplyTo.on("detached", onReplyToDetached);
    this.qReplyTo.on("consuming", onReplyToConsuming);
    this.qReplyTo.attach(this.options);
  }
};

/**
 * Listens for requests to the service. Whever a new message arrives designated to the service,
 * a 'request' event will be emitted.
 * Events:
 *   serving - emitted when the service will start receiving requests
 * @param options message consumption options (same as Queue#consume)
 */
Service.prototype.serve = function(options, cb) {
  if (this.isServing()) {
    this.emit("error", "already serving");
    return;
  }

  if (this.isConnected()) {
    this.emit("error", "already connected");
    return;
  }

  if (typeof options === "function") {
    cb = options;
    options = undefined;
  }

  var _this = this;
  this._connect(options, function() {
    cb && _this.once("serving", function() {
      cb();
    });
    _this.qService.consume(options);
  });
};

/**
 * Connect to the service as a service consumer.
 * Events:
 * connected - connected to the service. after this event requests can be sent to the service
 * @param options message consumption options (same as Queue#consume)
 */
Service.prototype.connect = function(options, cb) {
  if (this.isServing()) {
    this.emit("error", "already serving");
    return;
  }

  if (this.isConnected()) {
    this.emit("error", "already connected");
    return;
  }

  if (typeof options === "function") {
    cb = options;
    options = undefined;
  }

  this.qReplyTo = new Queue(this.bus, this.replyTo);
  var _this = this;
  this._connect(options, function() {
    cb && _this.once("connected", function() {
      cb();
    });
    _this.qReplyTo.consume(options);
  });
};

/**
 * 
 */
Service.prototype.disconnected = function() {
  return !this.isConnected() && !this.isServing();
};

/**
 * returns whether we have been asked to disconnect but haven't done so yet
 */
Service.prototype.disconnecting = function() {
  return !!this.graceTimer;
};

/**
 * shutdown the connection to the service and cleanup
 */
Service.prototype._shutdown = function(force) {
  // if we are not forced to shutdown,
  // and we either have requests in flight or disconnect was not called
  // then we can ignore the shutdown
  if (!force && (!this.disconnecting() || this.inflight > 0)) {
    return;
  }

  clearTimeout(this.graceTimer);
  this.graceTimer = undefined;
  this.qService && this.qService.detach();
  this.qReplyTo && this.qReplyTo.detach();

  // clear the requesters cache
  var _this = this;
  Object.keys(this.requesters).forEach(function(replyTo) {
    _this.requesters[replyTo].q.detach();
    clearTimeout(_this.requesters[replyTo].timer);
  });

  this.requesters = {};
  this.pendingReplies = {};
};

/**
 * Disconnect from the service. Used both by a service provider and service consumer
 * @param gracePeriod number of milliseconds to wait for all in-flight requests to be handled. if undefined or negative,
 * the disconnect will not be graceful. default is 0.
 */
Service.prototype.disconnect = function(gracePeriod) {
  if (this.disconnected()) {
    return;
  }

  // regardless of grace period, stop listening for new requests
  this.qService && this.qService.stop();

  gracePeriod = Math.max(gracePeriod || 0, 0);
  var _this = this;
  this.graceTimer = setTimeout(function() {
    _this._shutdown(true);
  }, gracePeriod);
  this._shutdown();
};

/**
 * Returns whether we are serving requests
 */
Service.prototype.isServing = function() {
  return this.qService && this.qService.isConsuming();
};

/**
 * Returns whether we are connected to the service for sending requests
 */
Service.prototype.isConnected = function() {
  return !!this.qReplyTo;
};

/**
 * Send a request to the service. Service#connect must have been called before sending requests
 * @param request the request to send. can be either a string or an object.
 * @param options options for the request:
 *  'reqTimeout' - milliseconds to wait for a response. On timeout, the reply cb will be invoked with an error
 * @param cb invoked with '(err, reply)'. ommiting the cb indicates that no reply is necessary.
 */
Service.prototype.request = function(message, options, cb) {
  if (!this.isConnected()) {
    return;
  }

  if (typeof options === "function") {
    cb = options;
    options = {};
  }

  options = options || {};

  var _this = this;
  var reqId = this.qService.pushed();
  var replyTo = undefined;
  var reqTimeout = options.reqTimeout || this.options.reqTimeout;
  if (cb) {
    ++this.inflight;
    replyTo = this.replyTo;
    this.pendingReplies[reqId] = {
      cb: cb,
      timeout: setTimeout(function() {
        _this._handleReply({
          reqId: reqId,
          err: "timeout"
        });
      }, reqTimeout)
    };
  }
  return this.qService.push({ data: message, replyTo: replyTo, reqId: reqId, expires: Date.now() + reqTimeout });
};

/**
 * Mark a requester as still alive so we keep it in the cache for another hour
 * @param {*} replyTo the address of the requester
 */
Service.prototype._touchRequester = function(replyTo) {
  var _this = this;
  var requester = this.requesters[replyTo];
  if (!requester) {
    return;
  }

  clearTimeout(requester.timer);
  requester.timer = setTimeout(function() {
    // if the timer fires, it means this specific requester hasn't made any request in the
    // last hour, so we clean it out of the cache
    requester.q.detach();
    _this.requesters[replyTo] = undefined;
  }, 60 * 60 * 1000); // 1 hour
};

/**
 * Handle an incoming request
 * @param request the incoming request
 * @param id id of the received message
 * @private
 */
Service.prototype._handleRequest = function(request, id) {
  var _this = this;
  try {
    request = JSON.parse(request);
    // if the incoming request is not an object, silently discard it
    if (typeof request !== "object") {
      return;
    }

    // check if the request ttl has expired, and if so, silently discard it.
    // (the requester will also receive a timeout error)
    if (Date.now() > request.expires) {
      return;
    }

    // mark that we are handling an additional request
    ++this.inflight;

    // the request handling is done, it's possible we need to shutdown
    var _reply = undefined;
    var _done = function() {
      --_this.inflight;
      _this._shutdown(); // if we have not been asked to disconnect, this will do nothing
      _done = undefined;
      _reply = undefined;
    };

    // if the requster is expecting a reply
    if (request.replyTo) {
      // we may have the requestor reply queue already cached
      var requester = this.requesters[request.replyTo];
      if (!requester) {
        // we don't have it cached
        requester = {
          q: new Queue(this.bus, request.replyTo)
        };
        // attach to the requester queue for the duration of the cache
        requester.q.attach();
        this.requesters[request.replyTo] = requester;
      }

      // mark this requester as still alive
      this._touchRequester(request.replyTo);

      // sends the reply back to the requester
      _reply = function(err, reply) {
        requester.q.push({ err: err, reply: reply, reqId: request.reqId });
        requester = undefined;
        _done();
      };
      _reply.replyTo = request.replyTo;
    } else {
      // we don't need to send a reply
      _reply = _done;
    }
    this.emit("request", request.data, _reply);
  } catch (e) {
    this.logger.warning("failed to handle incoming request: " + e.message);
  }
};

/**
 * Handle a reply
 * @param reply the reply from the service
 * @param id id of the received message
 * @private
 */
Service.prototype._handleReply = function(reply, id) {
  // lookup the request id that this reply is for
  try {
    if (typeof reply === "string") {
      reply = JSON.parse(reply);
    }

    // if we can't find the corresponding request, silently discard the reply
    var data = this.pendingReplies[reply.reqId];
    if (!data) {
      return;
    }
    delete this.pendingReplies[reply.reqId];
    // disable the timeout
    clearTimeout(data.timeout);
    // invoke the callback
    data.cb.call(null, reply.err, reply.reply);
    --this.inflight;
    this._shutdown(); // if we have not been asked to disconnect, this will do nothing
  } catch (e) {
    this.logger.warning("failed to handle incoming reply: " + e.message);
  }
};

/**
 * Convert all eligible methods into promise based methods instead of callback based methods
 */
Service.prototype.promisify = function() {
  return this.bus.promisify(this, ["serve", "connect", "request"]);
};

/**
 * Tells the federation object which methods save state that need to be restored upon
 * reconnecting over a dropped websocket connection
 * @private
 */
Service.prototype._federationState = function() {
  return [{ save: "connect", unsave: "disconnect" }];
};

exports = module.exports = Service;
