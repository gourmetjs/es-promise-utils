"use strict";

module.exports = function isPromise(obj) {
  return obj && typeof obj === "object" && typeof obj.then === "function";
};
