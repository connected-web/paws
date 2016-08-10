/*
 Run node website.js, or npm run website to start this script.
 */
var monitor = require('product-monitor');
var server = monitor({
  "serverPort": 8080,
  "productInformation": {
    "title": "PAWS Viewer",
  },
  "userContentPath": "website"
});
