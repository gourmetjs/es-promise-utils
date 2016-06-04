"use strict";

module.exports = function isPromise(obj) {
  return obj instanceof Promise;
};
