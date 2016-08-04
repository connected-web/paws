var sendKey = require('./sendKey');
var render = require('./render');

function renderPath(entry, config, next) {

  var page = require('webpage').create();
  var path = [].concat(entry.path); // copy the path for manipulation

  page.viewportSize = config.screenshots.viewport.size;
  console.log('Set viewport size to', JSON.stringify(config.screenshots.viewport.size, null, 2));

  page.onConsoleMessage = function(msg) {
    console.log(msg);
  };

  console.log('Open', config.startUrl);

  function nextKey() {
    if (path.length > 0) {
      var keyName = path.shift();
      sendKey(page, keyName, config, nextKey);
    } else {
      render(page, entry, config, next);
    }
  }

  page.open(config.startUrl, function() {
    try {
      console.log('Following path ' + entry.keyPath + ' : ' + entry.fileName);
      nextKey();
    } catch (ex) {
      console.error(ex, ex.stack);
    }
  });

  console.log('Processing Entry', JSON.stringify(entry, null, 2));
}

module.exports = renderPath;
