const find = require('promise-path').find;

var endpoint = function() {}

var server = false;

endpoint.route = '/api/paws/products';
endpoint.cacheDuration = '5 seconds';
endpoint.description = 'Lists out products created by day';

endpoint.configure = function(config) {
  server = config.server;
}

endpoint.render = function(req, res) {
  var data = {};

  var product = req.params.product;

  find(`${process.cwd()}/screenshots/**/report.json`)
    .then((files) => {
      const index = {};
      files.filter((filepath) => {
        var matches = filepath.match(/screenshots\/([A-z]+)\/(\d\d\d\d-\d\d-\d\d)\/report.json/);
        var product = matches[1];
        if (index[product]) {
          return false;
        }
        index[product] = true;
        return true;
      });

      const products = Object.keys(index);

      res.jsonp({
        products
      });
    })
    .catch((ex) => {
      res.jsonp({
        message: 'Unable to find reports',
        error: ex,
        stack: ex.stack
      });
    });
}

module.exports = endpoint;
