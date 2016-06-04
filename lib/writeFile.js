"use strict";

var createWriteStream = require("./createWriteStream");

module.exports = function writeFile(path, data, options) {
  return createWriteStream(path, function(ws) {
    ws.write(data);
    ws.end();
  }, options);
};
