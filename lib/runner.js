var renderPath = require('./renderPath');
var homePath = [];

function run(config, url, outputPath) {

  console.log(': Url', url);
  console.log(': Output', outputPath);

  var modes = [];
  if (config.output.savePDF) {
    modes.push('pdf');
  }
  if (config.output.savePNG) {
    modes.push('png');
  }

  function renderNext() {

    if (modes.length > 0) {
      var entry = {};
      entry.url = url;
      entry.path = outputPath + '.' + modes.shift();
      entry.pending = true;
      entry.error = null;

      renderPath(entry, config, renderNext);
    } else {
      done();
    }
  }

  function done() {
    console.log('Finished rendering', url, outputPath);
    phantom.exit();
  }

  renderNext();
}

module.exports = {
  run: function (args) {
    try {
      run.apply(this, arguments);
    } catch (ex) {
      console.error(ex, ex.stack);
    }
  }
};
