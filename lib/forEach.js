"use strict";

// This module is based on `repeat()`
var repeat = require("./repeat");

// Iterates through an array asynchronously in series - the callback will not
// be called until the promise returned by previous call is resolved.
//
// The callback is called with arguments (item, idx, arr).
// Callback returns:
//  - promise = to wait an asynch job - resolved value false finishes the loop.
//  - false to finish the loop
//  - Others (including `undefined`) to proceed to a next round of the loop
module.exports = function forEach(arr, callback) {
  var isComplete = false;
  var idx = 0;
  return repeat(function() {
    if (idx >= arr.length) {
      isComplete = true;
      return false;
    }
    var res = callback.call(null, arr[idx], idx, arr);
    idx++;
    return res;
  }).then(function() {
    return isComplete;
  });
};
