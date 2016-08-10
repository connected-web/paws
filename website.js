const express = require('express');
const monitor = require('product-monitor');

/*
 Run node website.js, or npm run website to start this script.
 */
monitor({
  "serverPort": 8080,
  "productInformation": {
    "title": "PAWS Viewer",
  },
  "userContentPath": "website"
}, (instance) => {
  instance.server.use('/screenshots', express.static(__dirname + '/screenshots'));
  instance.listen();
});
