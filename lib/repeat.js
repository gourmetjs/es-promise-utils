"use strict";

var isPromise = require("./isPromise");

// Runs an asynchronous loop in series - the callback will not be called
// until the promise returned by previous call is resolved.
//
// The callback is called without arguments.
// Callback returns:
//  - promise = to wait an asynch job - resolved value false finishes the loop.
//  - false to finish the loop
//  - Others (including `undefined`) to proceed to a next round of the loop
module.exports = function repeat(callback) {
  return new Promise(function(resolve, reject) {
    function proceed() {
      var res;
      try {
        res = callback.call(null);
      } catch (err) {
        return reject(err);
      }
      if (isPromise(res)) {
        res.then(function(value) {
          if (value === false)
            resolve();
          else
            next();
        }, reject);
      } else {
        if (res === false)
          resolve();
        else
          next();
      }
    }

    function next() {
      setImmediate(proceed);
    }

    next();
  });
};
