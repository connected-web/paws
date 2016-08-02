var browser = require('./browser');

function run(config) {
  var entries = [];
  var counter = 0;

  var paths = [];
  var keys = config.navigation.keys;
  keys.map(function(keyName) {
    var path = [keyName];
    paths.push(path);
    keys.map(function(k2) {
      var newPath = [].concat(path, [k2]);
      paths.push(newPath);
    });
  });

  function renderPath(path) {
    var entry = {};

    var page = require('webpage').create();
    page.viewportSize = config.screenshots.viewport.size;
    console.log('Set viewport size to', JSON.stringify(config.screenshots.viewport.size, null, 2));

    page.onConsoleMessage = function(msg) {
      console.log(msg);
    }

    page.open(config.startUrl, function() {
      var keyPath = path.map(function(keyName) {
        return keyName;
      });

      var keyName = path[0];

      var fileName = config.screenshots.prefix.replace('{#}', zp(counter)) + keyPath;
      var imagePath = config.screenshots.path + '/' + fileName + '.png';

      entry.keyPath = keyPath.join(',');
      entry.fileName = fileName;
      entry.imagePath = imagePath;
      entry.pending = true;
      entry.error = null;

      entries.push(entry);
      console.log('Following path ' + keyPath + ' : ' + fileName);
      nextKey();
    });

    function nextKey() {
      if (path.length > 0) {
        sendKey();
      } else {
        render();
      }
    }

    function sendKey() {
      console.log('Sending key');
      var keyName = path.shift();
      var keyCode = config.navigation.keyMap[keyName];
      setTimeout(function() {
        browser.sendKey(page, keyCode);
        console.log('Key sent', keyCode);
        nextKey();
      }, config.navigation.wait.timeInSeconds * 1000);
    }

    function render() {
      console.log('Capturing image');
      setTimeout(function() {
        try {
          page.render(entry.imagePath);
        } catch (ex) {
          entry.error = ex;
        }
        entry.pending = false;
        entry.counter = counter;
        console.log('Image captured', entry.imagePath);
        next();
      }, config.navigation.wait.timeInSeconds * 1000);
    }
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
