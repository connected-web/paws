function run(config) {
  var entries = [];
  var counter = 0;

  var page = require('webpage').create();
  page.viewportSize = config.screenshots.viewport.size;
  console.log('Set viewport size to', JSON.stringify(config.screenshots.viewport.size, null, 2));

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
      page.sendEvent('keydown', keyCode, null, null, 0);
      page.sendEvent('keyup', keyCode, null, null, 0);
      console.log('Sending key event', keyCode);

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
      console.log('Rendering ' + keyPath + ' : ' + fileName);

      setTimeout(function() {
        try {
          page.render(imagePath);
        } catch (ex) {
          entry.error = ex;
        }
        entry.pending = false;
        entry.counter = counter;
        next();
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
