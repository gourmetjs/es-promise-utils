"use strict";

var isPromise = require("./isPromise");

function Queue(options) {
  options = options || {};

  this._options = options;
  this._clear();

  if (options.data)
    this._waiting = this._waiting.concat(options.data);

  this._isEnding = options.autoEnd;
}

Queue.prototype.run = function(handler) {
  var self = this;
  self._handler = handler;
  return new Promise(function(resolve, reject) {
    self._resolve = resolve;
    self._reject = reject;
    self._digest();
  });
};

Queue.prototype.put = function(data) {
  this._waiting.push(data);
  this._digest();
};

Queue.prototype.end = function() {
  this._isEnding = true;
};

Queue.prototype._digest = function() {
  var handler = this._handler;

  if (handler) {
    var waiting = this._waiting;
    var pending = this._pending;
    var max = this._options.concurrency || 32;

    while (waiting.length && pending.length < max) {
      var data = waiting.shift();
      var res = handler.call(this._options.thisObj, data);
      if (isPromise(res)) {
        res.then(this._complete.bind(this, res), this._error.bind(this, res));
        pending.push(res);
      }
    }

    if (this._isEnding && !pending.length && !waiting.length) {
      this._clear();
      this._resolve();
    }
  }
};

Queue.prototype._complete = function(pr) {
  if (this._handler) {
    var pending = this._pending;
    var idx = pending.indexOf(pr);

    if (idx !== -1)
      pending.splice(idx, 1);

    this._digest();
  }
};

Queue.prototype._error = function(pr, err) {
  if (this._handler) {
    this._clear();
    this._reject(err);
  }
};

Queue.prototype._clear = function() {
  this._handler = null;
  this._waiting = [];
  this._pending = [];
};

module.exports = Queue;
