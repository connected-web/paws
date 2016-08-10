const find = require('promise-path').find;

var endpoint = function() {}

var server = false;

endpoint.route = '/api/paws/reports/:product';
endpoint.cacheDuration = '5 seconds';
endpoint.description = 'Lists out reports created by day';

endpoint.configure = function(config) {
  server = config.server;
}

endpoint.render = function(req, res) {
  var data = {};

  var product = req.params.product;

  find(`${process.cwd()}/screenshots/${product}/**/report.json`)
    .then((files) => {
      const dates = files.map((filepath) => {
        return filepath.match(/.*(\d\d\d\d-\d\d-\d\d)\/report.json/)[1];
      });

      const reports = dates.map((date) => {
        return {
          report: `/api/paws/report/${product}/${date}`,
          date,
          product
        };
      });

      res.jsonp({
        reports
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
