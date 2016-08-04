const run = require('promise-path').run;

run(`phantomjs phantom-harness.js`)
  .then((result) => {
    console.log('Result', result.stdout, result.stderr);
  })
  .catch((ex) => {
    console.error(ex, ex.stack);
  });
