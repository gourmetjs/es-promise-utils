"use strict";

var stream = require("stream");
var isPromise = require("./isPromise");

module.exports = function transform(handler, flush, options) {
  if (typeof flush === "object") {
    options = flush;
    flush = null;
  }

  var ts = new stream.Transform(options);

  ts._transform = function(chunk, encoding, callback) {
    var res = handler(chunk);
    if (isPromise(res)) {
      res.then(function() {
        callback();
      }, function(err) {
        callback(err);
      });
    } else {
      callback();
    }
  };

  if (flush)
    ts._flush = flush;

  return ts;
};
