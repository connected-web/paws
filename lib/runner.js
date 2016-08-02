var browser = require('./browser');

function run(config) {
  var entries = [];
  var counter = 0;

  var page = require('webpage').create();
  page.viewportSize = config.screenshots.viewport.size;
  console.log('Set viewport size to', JSON.stringify(config.screenshots.viewport.size, null, 2));

  page.onConsoleMessage = function(msg) {
    console.log(msg);
  }

  var paths = [];
  var keys = config.navigation.keys;
  keys.map(function(keyName) {
    paths.push([keyName]);
  });

  function renderPath(path) {
    page.open(config.startUrl, function() {
      var keyPath = path.map(function(keyName) {
        return keyName;
      });

      var keyName = path[0];
      var keyCode = config.navigation.keyMap[keyName] || page.event.key[keyName];

      var fileName = config.screenshots.prefix.replace('{#}', zp(counter)) + keyPath;
      var imagePath = config.screenshots.path + '/' + fileName + '.png';

      var entry = {
        keyPath: keyPath.join(','),
        fileName: fileName,
        imagePath: imagePath,
        pending: true,
        error: null
      };
      entries.push(entry);
      console.log('Following path ' + keyPath + ' : ' + fileName);

      setTimeout(function() {
        console.log('Sending key');
        browser.sendKey(page, keyCode);

        setTimeout(function() {
          console.log('Capturing image');
          try {
            page.render(imagePath);
          } catch (ex) {
            entry.error = ex;
          }
          entry.pending = false;
          entry.counter = counter;
          next();
        }, config.navigation.wait.timeInSeconds * 1000);

      }, config.navigation.wait.timeInSeconds * 1000);

    });
  }

  function next() {
    counter++;
    if (paths.length > 0) {
      var path = paths.shift();
      renderPath(path);
    } else {
      phantom.exit();
    }
  }

  next();
}

function zp(number) {
  return (number < 10) ? '0' + number : number;
}

module.exports = {
  run: run
};
