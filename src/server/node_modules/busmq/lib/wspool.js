var events = require('events');
var util = require('util');
var logger = require('./logger');
var WSMux = require('./wsmux');

/**
 * A pool of websockets that keeps a minimum of open websockets to a list of bus federation servers
 * @param bus the bus owning this pool
 * @param options additional options
 * @constructor
 */
function WSPool(bus, options) {
  events.EventEmitter.call(this);
  this.setMaxListeners(0);
  this.bus = bus;
  this.logger = bus.logger.withTag(bus.id+':wspool');
  this.closed = false;
  this.pool = {};
  this.notificationChannels = {};

  this.options = options || {};
  this.options.secret = this.options.secret || 'notsosecret';

  if (!this.options.poolSize || this.options.poolSize <= 0) {
    this.options.poolSize = 10;
  }

  this.options.replaceDelay = this.options.replaceDelay || 5000;
  this.options.urls = this.options.urls || [];

  this._setupPool();
}

util.inherits(WSPool, events.EventEmitter);

/**
 * Setup the pool of websockets for all the federation urls
 * @private
 */
WSPool.prototype._setupPool = function() {
  var _this = this;
  this.logger.isDebug() && this.logger.debug('setting up ' + this.options.poolSize + ' websockets per pool for urls: ' + JSON.stringify(this.options.urls));
  this.options.urls.forEach(function(url) {
    _this.pool[url] = [];
    for (var i = 0; i < _this.options.poolSize; ++i) {
      _this._add(url);
    }
  });
};

WSPool.prototype._createNotificationsChannel = function(url) {
  var _this = this;
  var fedPubsub = this.bus.federate(this.bus.pubsub(this.bus.notificationsChannel), url);
  fedPubsub.once('ready', function(pubsub) {
    pubsub.on('message', function(message) {
      try {
        message = JSON.parse(message);
      } catch(e) {
        _this.logger.error('received unparseable notification message from ' + url + ': ' + message);
        return;
      }
      _this.emit('notification', message, url);
    });
    pubsub.on('error', function(err) {
      _this.logger.error('error on notifications channel from ' + url + ': ' + err);
    });
    pubsub.once('subscribed', function() {
      // we are now federating to the target url
      _this.emit('federating', url);
    });
    pubsub.subscribe();
  });
  fedPubsub.on('error', function(err) {
    _this.logger.error('error on federation of notifications channel from ' + url + ': ' + err);
  });
  fedPubsub.on('unauthorized', function() {
    _this.logger.error('unauthorized federation of notifications channel to ' + url);
  });
  fedPubsub.on('close', function() {
    delete _this.notificationChannels[url];
  });
  return fedPubsub;
};

/**
 * Add a new websocket to the pool
 * @param url the url to open the websocket to
 * @private
 */
WSPool.prototype._add = function(url) {
  if (this.closed) {
    return;
  }

  if (!this.pool[url]) {
    this.logger.isDebug() && this.logger.debug('cannot add websocket to ' + url + ': url is not recognized');
    return;
  }

  var _this = this;
  this.logger.isDebug() && this.logger.debug('opening websocket to ' + url);
  var wsmux = new WSMux(url, this.options);
  this.pool[url].push(wsmux);

  var onOpen = function() {
    _this.logger.isDebug() && _this.logger.debug('websocket to ' + url + ' added to pool');
    // if this is the first access to this url, create the notifications channel
    if (!_this.notificationChannels[url]) {
      _this.notificationChannels[url] = _this._createNotificationsChannel(url);
    }
  };

  var onClose = function() {
    _this.logger.isDebug() && _this.logger.debug('websocket to ' + url + ' closed');
  };

  var onError = function(error) {
    _this.logger.isDebug() && _this.logger.debug('websocket to ' + url + ' error: ' + JSON.stringify(error));
  };

  var onReopen = function() {
    _this.logger.isDebug() && _this.logger.debug('websocket to ' + url + ' is reopened');
  };

  var onFatal = function(error) {
    _this.logger.isDebug() && _this.logger.debug('websocket to ' + url + ' fatal error (placing url in error state): ' + JSON.stringify(error));
    _this.pool[url] = error;
  };

  var onShutdown = function() {
    wsmux.removeListener('open', onOpen);
    onOpen = undefined;
    wsmux.removeListener('close', onClose);
    onClose = undefined;
    wsmux.removeListener('error', onError);
    onError = undefined;
    wsmux.removeListener('fatal', onFatal);
    onFatal = undefined;
    wsmux.removeListener('reopen', onReopen);
    onReopen = undefined;
    wsmux.removeListener('shutdown', onShutdown);
    onShutdown = undefined;
    wsmux.close();
    wsmux = undefined;
  };

  wsmux.on('open', onOpen);
  wsmux.on('close', onClose);
  wsmux.on('error', onError);
  wsmux.on('fatal', onFatal);
  wsmux.on('reopen', onReopen);
  wsmux.on('shutdown', onShutdown);

};

/**
 * Get a websocket channel from the pool for the specified url, a new channel on a random websocket will be created.
 * @param url the url to get the websocket for. if none is available right now it will be retrieved once one is available.
 * @param cb receives the websocket channel
 */
WSPool.prototype.get = function(url, cb) {
  // the url is not supported
  if (!this.pool[url]) {
    process.nextTick(function() {
      cb && cb('url ' + url + ' is not recognized');
    });
    return;
  }

  var _this = this;

  // the url is in error state
  if (typeof this.pool[url] === 'string') {
    process.nextTick(function() {
      cb && cb(_this.pool[url]);
    });
    return;
  }

  // create a new channel over a websocket from the pool selected in round-robin
  var wsmux = _this.pool[url].shift();
  var channel = wsmux.channel();
  _this.pool[url].push(wsmux);
  cb && cb(null, channel);
};

/**
 * Close the pool and disconnect all open websockets
 */
WSPool.prototype.close = function() {
  this.closed = true;
  var _this = this;

  Object.keys(this.notificationChannels).forEach(function(url) {
    _this.notificationChannels[url].close();
  });
  this.notificationChannels = {};

  Object.keys(this.pool).forEach(function(url) {
    if (typeof _this.pool[url] !== 'string') {
      _this.pool[url].forEach(function(wsmux) {
        wsmux.emit('shutdown');
      });
    }
  });
  this.pool = {};
};

exports = module.exports = WSPool;