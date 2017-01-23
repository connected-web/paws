const find = require('promise-path').find;
const today = require('./lib/today')
const paws = require('./paws');

Promise.accept(console.log('Start PAWS'))
  .then(() => {
    return find('products/*.json');
  })
  .then((paths) => {
    return paths.map((path) => {
      const options = require(`./${path}`);
      options.source = path;
      return options;
    });
  })
  .then((configs) => {
    return configs.map((config) => {
      return paws.monitor(config);
    });
  })
  .catch((ex) => {
    console.error('Caught exception', ex, ex.stack);
  });

const currentDay = today();

function checkDay() {
  if (currentDay !== today()) {
    console.log('Day has changed, exiting service to force restart');
    process.exit(0);
  } else {
    const fiveMinutesInMs = 5 * 60 * 1000;
    setTimeout(checkDay, fiveMinutesInMs);
  }
}

checkDay();
