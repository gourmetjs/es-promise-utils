"use strict";

var fs = require("fs");
var npath = require("path");
var mkdirp = require("mkdirp");
var promisify = require("./promisify");

var renameP = promisify(fs.rename);

// Creates a writable file stream and returns a promise that is fulfilled when
// the writing is finished and the file is closed.
// - `callback(ws)` is invoked when the stream is ready for writing.
// - Automatically creates the intermediate directories *ONLY* if a first trial
//   of creating the file fails for the efficiency.
// - Writes to a temporary file ("{path}.saving") and renames when done.
//
// Options in addition to `fs.createWriteStream` are:
//  - useOriginalPath: Don't use a temporary path. (Default: false)
//  - dontMakeDirs: Don't make a intermediate directories. (Default: false)
//  - mkdirMode: See `fs.mkdir()`. (Default: 0777)
//  - thisObj: `this` object for the callback.
//
// Because this function renames the file after the writing is complete,
// you should not depend on "finish" event of the stream for detecting the
// end of a whole writing task. Use the returned promise instead.
module.exports = function createWriteStream(path, callback, options) {
  var orgPath = path;

  options = options || {};

  return new Promise(function(resolve, reject) {
    function createStream() {
      var ws = fs.createWriteStream(path, options);
      ws.once("open", function() {
        this.once("finish", resolve).once("error", reject);
        try {
          callback.call(options.thisObj, this);
        } catch (err) {
          this.removeAllListeners();
          this.end();
          reject(err);
        }
      });
      return ws;
    }

    if (!options.useOriginalPath)
      path = orgPath + ".saving";

    createStream().once("error", function(err) {
      if (!options.dontMakeDirs && err && err.code === "ENOENT") {
        var mode = options.mkdirMode || 0x1ff;
        mkdirp(npath.dirname(path), mode, function(err) {
          if (!err) {
            createStream(path, options).once("error", reject);
          } else {
            reject(err);
          }
        });
      } else {
        reject(err);
      }
    });
  }).then(function() {
    if (!options.useOriginalPath)
      return renameP(path, orgPath);
  });
};
