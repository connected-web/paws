const run = require('promise-path').run;
const imageDiff = require('image-diff');
const options = require('./paws.json');

var counter = 0;
var imagePath, previousImagePath;
var paths = [
  [],
  ['Enter'],
  ['Enter', 'Up'],
  ['Left', 'Enter'],
  ['Left', 'Left'],
  ['Left', 'Right', 'Left'],
  ['Left', 'Right', 'Left', 'Up']
];

function zp(number) {
  return (number < 10) ? '0' + number : number;
}

function chooseNextPath() {
  counter++;
  if (paths.length > 0) {
    var path = paths.shift();

    previousImagePath = imagePath;
    imagePath = `${options.screenshots.path}/${options.screenshots.prefix}${path.join(',')}.png`
      .replace('{#}', zp(counter));

    return renderPath(path, function() {
      if (path.length < 1) {
        return chooseNextPath();
      }
      return compareImages(path, chooseNextPath);
    });
  } else {
    console.log('No more paths to render');
  }
}

function compareImages(instructionPath, next) {

  const path1 = [].concat(instructionPath);
  path1.pop(); // remove last item
  const path2 = [].concat(instructionPath);

  console.log('Path 1', path1);
  console.log('Path 2', path2);

  const imagePath1 = previousImagePath;
  const imagePath2 = imagePath;

  const diffImagePath = `${__dirname}/${options.diffs.path}/${options.diffs.prefix}${instructionPath.join(',')}.png`
    .replace('{#}', zp(counter));

  const diffOptions = {
    actualImage: imagePath1,
    expectedImage: imagePath2,
    diffImage: diffImagePath,
  };

  imageDiff.getFullResult(diffOptions, function(err, result) {
    // result = {total: 46340.2, difference: 0.707107}
    if (err) {
      return console.error('Image Diff Error', err);
    }
    console.log('Image Diff Result', result);
    console.log('Percentage', result.percentage * 100 + '%');

    next();
  });
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
