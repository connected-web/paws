const read = require('promise-path').read;

var endpoint = function() {}

var server = false;

endpoint.route = '/api/paws/report/:product/:date';
endpoint.cacheDuration = '5 seconds';
endpoint.description = 'Returns a specific report by day';

endpoint.configure = function(config) {
  server = config.server;
}

endpoint.render = function(req, res) {

  const date = req.params.date;
  const product = req.params.product;

  if (product && date) {
    const reportPath = `${process.cwd()}/screenshots/${product}/${date}/report.json`;
    read(reportPath, 'utf8')
      .then((data) => {
        return JSON.parse(data);
      })
      .then((report) => {
        const latest = report.renderedImagePaths[report.renderedImagePaths.length - 1];
        res.jsonp({
          report,
          latest
        });
      })
      .catch((ex) => {
        res.jsonp({
          error: ex,
          stack: ex.stack,
          message: 'Unable to read or parse report data'
        });
      });
  } else {
    res.jsonp({
      error: true,
      message: 'Unknown product and date',
      product,
      date
    });
  }
}

module.exports = endpoint;
