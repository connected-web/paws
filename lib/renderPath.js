var render = require('./render');

function renderPath(entry, config, next) {

  var page = require('webpage').create();
  var path = [];

  page.viewportSize = config.output.viewport.size;
  console.log('Set viewport size to', JSON.stringify(config.output.viewport.size, null, 2));

  page.onConsoleMessage = function (msg) {
    console.log(msg);
  };

  console.log('Open', entry.url);

  page.open(entry.url, function () {
    try {
      console.log('Opening path ' + entry.url + ' : ' + entry.imagePath);
      render(page, entry, config, next);
    } catch (ex) {
      console.error(ex, ex.stack);
      next();
    }
  });

  console.log('Processing Entry', JSON.stringify(entry, null, 2));
}

module.exports = renderPath;
