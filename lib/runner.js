var renderPath = require('./renderPath');
var homePath = [];

function run(config, keyPath, imagePath) {

  keyPath = keyPath || [];

  console.log(': Key Path', keyPath);

  function followPath() {

    var entry = {};
    entry.keyPath = keyPath;
    entry.pathString = keyPath.join(',');
    entry.imagePath = imagePath;
    entry.pending = true;
    entry.error = null;

    renderPath(entry, config, done);
  }

  function done() {
    console.log('Finished', keyPath);
    phantom.exit();
  }

  followPath();
}

module.exports = {
  run: function(args) {
    try {
      run.apply(this, arguments);
    } catch (ex) {
      console.error(ex, ex.stack);
    }
  }
};
