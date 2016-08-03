var renderPath = require('./renderPath');

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

  function nextPath() {
    counter++;
    if (paths.length > 0) {
      var path = paths.shift();

      var keyPath = path.map(function(keyName) {
        return keyName;
      });

      var entry = {};
      entry.path = path;
      entry.keyPath = keyPath.join(',');
      entry.fileName = config.screenshots.prefix.replace('{#}', zp(counter)) + entry.keyPath;
      entry.imagePath = config.screenshots.path + '/' + entry.fileName + '.png';
      entry.pending = true;
      entry.error = null;
      entry.counter = counter;

      entries.push(entry);

      renderPath(entry, config, nextPath);
    } else {
      console.log('Finished', 'Followed', entries.length, 'paths');
      phantom.exit();
    }
  }

  nextPath();
}

function zp(number) {
  return (number < 10) ? '0' + number : number;
}

module.exports = {
  run: function(config) {
    try {
      run(config);
    } catch (ex) {
      console.error(ex, ex.stack);
    }
  }
};
