console.log('PAWS');

try {
  var config = require('./paws.json');
  var runner = require('./lib/runner');

  console.log('Config', JSON.stringify(config, null, 2));

  console.log('Running...');

  runner.run(config);

} catch (ex) {
  console.error(ex, ex.stack);
}
