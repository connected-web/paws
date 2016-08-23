const find = require('promise-path').find;
const run = require('promise-path').run;

console.log('Start PAWS in multiconfig mode');

var count = 0;

run(`pm2 status`)
  .then(() => {
    return find('products/*.json');
  })
  .then((configs) => {
    return configs.map((path) => {
      const config = require(`./${path}`);
      count++;
      const name = `PAWS-${config.name}`;
      return `pm2 start paws.js --name=${name} -- ./${path}`;
    });
  })
  .then((commands) => {
    const promises = commands.map((command) => {
      console.log(`Running ${command}`);
      return run(command);
    });

    return Promise.all(promises)
      .then((results) => {
        results.forEach((result) => {
          console.log(result.stdout);
          if (result.stderr) {
            console.error(result.stderr);
          }
        });
      });
  })
  .catch((ex) => {
    console.error('Caught exception', ex, ex.stack);
  });
