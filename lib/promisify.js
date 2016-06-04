"use strict";

module.exports = function promisify(func, thisObj) {
  return function promisified() {
    var args = Array.prototype.slice.call(arguments, 0);
    return new Promise(function(resolve, reject) {
      args.push(function(err, res) {
        if (err)
          reject(err);
        else
          resolve(res);
      });
      func.apply(thisObj, args);
    });
  };
};
