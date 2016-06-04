"use strict";

module.exports = function evaluate(func) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(func(resolve, reject));
    } catch (err) {
      reject(err);
    }
  });
};
