var events = require('events');
var util = require('util');
var url = require('url');
var WebSocket = require('ws');
var WebSocketStream = require('websocket-stream');
var dnode = require('@capriza/dnode');
var WSMux = require('./wsmux');

function _noop() {}

/**
 * FederationServer
 * @param bus
 * @param options
 * @constructor
 */
function FederationServer(bus, options) {
  events.EventEmitter.call(this);
  this.bus = bus;
  this.logger = bus.logger.withTag(bus.id + ':fedserver');
  this._options(options);
}

util.inherits(FederationServer, events.EventEmitter);

/**
 * Setup FederationServer options
 * @param options options to set
 * @private
 */
FederationServer.prototype._options = function(options) {
  this.options = util._extend({}, options);
  this.options.secret = this.options.secret || 'notsosecret';
  this.options.path = this.options.path || '/';
};

/**
 * Start the federation server
 */
FederationServer.prototype.listen = function() {
  if (this.listening) {
    return;
  }
  if (this.options.server) {
    var _this = this;
    var verifyClient = this.options.secret;
    if (typeof verifyClient !== 'function') {
      verifyClient = this._verifyClient.bind(this);
    }
    this.wss = new WebSocket.Server({server: this.options.server, verifyClient: verifyClient, path: this.options.path});

    var _onWssConnection = function(ws) {
      _this._onConnection(ws);
    };

    var _onWssListening = function() {
      _this.logger.isDebug() && _this.logger.debug('websocket server is listening');
      _this.listening = true;
      _this.emit('listening');
    };

    var _onWssError = function(err) {
      _this.logger.isDebug() && _this.logger.debug('error on websocket server: ' + JSON.stringify(err));
      _this.emit('error', err);
    };

    var _onWssShutdown = function() {
      _this.wss.removeListener('connection', _onWssConnection);
      _onWssConnection = undefined;
      _this.wss.removeListener('listening', _onWssListening);
      _onWssListening = undefined;
      _this.wss.removeListener('error', _onWssError);
      _onWssError = undefined;
      _this.wss.removeListener('shutdown', _onWssShutdown);
      _onWssShutdown = undefined;
      _this.wss.close();
      _this.wss = null;
    };

    this.wss.on('connection', _onWssConnection);
    this.wss.on('listening', _onWssListening);
    this.wss.on('error', _onWssError);
    this.wss.on('shutdown', _onWssShutdown);
  }
};

/**
 * Close the federation server
 */
FederationServer.prototype.close = function() {
  if (!this.listening) {
    return;
  }
  this.listening = false;
  this.wss.emit('shutdown');
};

/**
 * Handle a new connection
 * @param ws the new connection
 * @private
 */
FederationServer.prototype._onConnection = function(ws) {
  this.logger.isDebug() && this.logger.debug('new federate client connection');
  var _this = this;

  var onWsClose = function(code) {
    shutdown('websocket closed: ' + code);
  };

  var onWsError = function(err) {
    shutdown('error on websocket: ' + JSON.stringify(err));
  };

  var onChannel = function(channel) {
    _this._onChannel(channel);
  };

  var shutdown = function(msg) {
    _this.logger.isDebug() && _this.logger.debug(msg);
    wsmux.removeListener('close', onWsClose);
    onWsClose = undefined;
    wsmux.removeListener('error', onWsError);
    onWsError = undefined;
    wsmux.removeListener('channel', onChannel);
    onChannel = undefined;
    wsmux.close();
    shutdown = undefined;
    wsmux = undefined;
  };

  var wsmux = new WSMux(ws, {mask: false});
  wsmux.on('close', onWsClose);
  wsmux.on('error', onWsError);
  wsmux.on('channel', onChannel);

};

/**
 * Handle a new channel
 * @param channel the new channel
 * @private
 */
FederationServer.prototype._onChannel = function(channel) {
  var object;
  var d;

  var _this = this;
  var onChannelMessage = function(msg) {
    _this.logger.isDebug() && _this.logger.debug('received message: ' + msg);
    try {
      msg = JSON.parse(msg);
    } catch (e) {
      _this.emit('error', 'error parsing incoming channel message ' + msg + ': ' + e.message);
      return;
    }
    if (!_this.bus[msg.type]) {
      _this.emit('error', 'received unknown message type in incoming channel message: ' + JSON.stringify(msg));
      return;
    }
    object = _this.bus[msg.type].apply(_this.bus, msg.args);
    d = _this._federate(object, msg.methods, channel);
  };

  var onChannelClose = function() {
    shutdown('federate client connection closed');
  };

  var onChannelError = function(err) {
    shutdown('federate client error: ' + JSON.stringify(err));
  };

  var shutdown = function(msg) {
    _this.logger.isDebug() && _this.logger.debug('['+(object?object.id:'uninitialized')+'] ' + msg);
    channel.removeListener('message', onChannelMessage);
    onChannelMessage = undefined;
    channel.removeListener('close', onChannelClose);
    onChannelClose = undefined;
    channel.removeListener('error', onChannelError);
    onChannelError = undefined;
    shutdown = undefined;
    channel = undefined;
    object && object.detach && object.detach();
    object && object.unpersist && object.unpersist();
    d.end();
    d._federationStream.unpipe();
    delete d._federationStream;
    d = undefined;
  };
  channel.once('message', onChannelMessage);
  channel.on('close', onChannelClose);
  channel.on('error', onChannelError);
};

/**
 * Hookup all the needed methods of the object to be served remotely
 * @param object
 * @param methods
 * @param channel
 * @private
 */
FederationServer.prototype._federate = function(object, methods, channel) {

  this.logger.isDebug() && this.logger.debug('creating federated object ' + object.id);

  var federatable = {};
  methods.forEach(function(method) {
    federatable[method] = function(args) {
      // the arguments arrive as a hash, so make them into an array
      var _args = Object.keys(args).map(function(k) {return args[k]});
      // invoke the real object method
      object[method].apply(object, _args);
    }
  });

  // setup dnode to receive the methods of the object
  var d = dnode(federatable, {weak: false});

  // tell the client that we are ready
  channel.send('ready');

  // start streaming rpc
  var channelStream = WebSocketStream(channel);
  channelStream.on('error', _noop);
  channelStream.pipe(d).pipe(channelStream);
  d._federationStream = channelStream;
  return d;
};

FederationServer.prototype._endFederation = function(msg, object, d) {

};

/**
 * Accept or reject a connecting web socket. the connecting web socket must contain a valid secret query param
 * @param info
 * @returns {*|boolean}
 * @private
 */
FederationServer.prototype._verifyClient = function(info) {
  var parsed = url.parse(info.req.url, true);
  return parsed.query && (parsed.query.secret === this.options.secret);
};

module.exports = exports = FederationServer;
