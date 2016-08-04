var renderPath = require('./renderPath');
var homePath = [];

function run(config, path, counter) {
  counter = counter || 0;
  path = path || homePath;

  function followPath() {
    counter++;

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

    renderPath(entry, config, done);
  }

  function done() {
    console.log('Finished', path);
    phantom.exit();
  }

  followPath();
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
