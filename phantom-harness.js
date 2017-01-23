var system = require('system');
var args = system.args;

console.log('PAWS PhantomJS Harness');

try {
  var runner = require('./lib/runner');

  // console.log('Config', JSON.stringify(config, null, 2));
  // console.log('Running...');

  var pawsConfig = require(args[1] || 'paws.json');
  var url = args[2] || '';
  var outputPath = args[3] || 'false';

  runner.run(pawsConfig, url, outputPath);

} catch (ex) {
  console.error(ex, ex.stack);
}
