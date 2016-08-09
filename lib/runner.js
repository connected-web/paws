var renderPath = require('./renderPath');
var homePath = [];

function run(config, path, counter, screenshot) {

  path = path || [];
  counter = counter || 0;

  console.log(': Path', path);
  console.log(': Counter', counter);

  function followPath() {

    var keyPath = path.map(function(keyName) {
      return keyName;
    });

    var entry = {};
    entry.path = path;
    entry.keyPath = keyPath.join(',');
    entry.imagePath = screenshot;
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
  run: function(config, path, counter, screenshot) {
    try {
      run(config, path, counter, screenshot);
    } catch (ex) {
      console.error(ex, ex.stack);
    }
  }
};
