var system = require('system');
var args = system.args;

console.log('PAWS PhantomJS Harness');

try {
  var config = require('./paws.json');
  var runner = require('./lib/runner');

  // console.log('Config', JSON.stringify(config, null, 2));

  // console.log('Running...');

  var pathString = args[1] || '';
  var path = pathString.split(',');
  var counter = parseInt(args[2]) || 0;

  runner.run(config, path, counter);

} catch (ex) {
  console.error(ex, ex.stack);
}
