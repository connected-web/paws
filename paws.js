const run = require('promise-path').run;

var counter = 0;
var paths = [
  [],
  ['Enter'],
  ['Up', 'Enter']
];

function chooseNextPath() {
  counter++;
  if (paths.length > 0) {
    var path = paths.shift();
    renderPath(path, chooseNextPath);
  } else {
    console.log('No more paths to render');
  }
}

function renderPath(path, next) {
  const pathString = path.join(',');

  return run(`phantomjs phantom-harness.js ${pathString} ${counter}`)
    .then((result) => {
      console.log('Result', result.stdout, result.stderr);
      next();
    })
    .catch((ex) => {
      console.error(ex, ex.stack);
      next();
    });
}

chooseNextPath();
