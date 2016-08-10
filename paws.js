const run = require('promise-path').run;
const make = require('promise-path').make;
const imageDiff = require('image-diff');
const options = require('./paws.json');
const fs = require('fs');
const path = require('path');

var counter = 0;
var imagePath, scaledImagePath;
var paths = [
  ['start']
];
var renderedImagePaths = [];
var scaledImagePaths = [];
var livePaths = [];
var checkedPaths = {};
var deadPaths = {
  'start,Back,Enter': true // hack: silently breaks on this route //
};

function zp(number) {
  return (number < 10) ? '0' + number : number;
}

function today(seperator) {
  return new Date().toISOString().split('T')[0]
}

function readReport(next) {
  const filepath = reportPath();
  try {
    var report = JSON.parse(fs.readFileSync(filepath));

    renderedImagePaths = report.renderedImagePaths;
    scaledImagePaths = report.scaledImagePaths;
    deadPaths = report.deadPaths;
    checkedPaths = report.checkedPaths;
    livePaths = report.livePaths;
    counter = report.counter;

  } catch (ex) {
    console.log('Unable to read existing report', filepath, ex, ex.stack);
  }
  next();
}

function updateReport() {
  const report = {
    renderedImagePaths,
    deadPaths,
    checkedPaths,
    livePaths,
    counter
  };
  console.log('Report', report);
  fs.writeFile(reportPath(), JSON.stringify(report, null, 2), 'utf8');
}

function reportPath() {
  return `${options.screenshots.path}/report.json`.replace('{today}', today());
}

function chooseFirstPath() {
  var screenshotPath = (options.screenshots.path).replace('{today}', today());
  var diffPath = (options.diffs.path).replace('{today}', today());

  make(screenshotPath)
    .then(() => {
      make(diffPath)
    })
    .then(() => {
      readReport(chooseNextPath);
    })
    .catch((ex) => {
      console.error('Unable to create path', screenshotPath, ex, ex.stack)
    });
}

function chooseNextPath() {

  updateReport();

  if (paths.length > 0) {
    counter++;
    const path = paths.shift();

    if (isDeadPath(path)) {
      console.log('Skipping dead path', instructionPath);
      return chooseNextPath();
    }
    imagePath = `${options.screenshots.path}/${options.screenshots.prefix}${path.join(',')}.png`
      .replace('{#}', zp(counter))
      .replace('{today}', today());

    console.log('Rendering next route', imagePath);

    return renderPath(path, imagePath, function() {
      checkedPaths[path.join(',')] = {
        imagePath
      };

      renderedImagePaths.push(imagePath);

      return resizeImage(imagePath)
        .then((newImagePath) => {
          scaledImagePath = newImagePath;
          console.log('Resized image', imagePath, 'to', newImagePath);
          scaledImagePaths.push(newImagePath);
          if (path.length === 1) {
            livePaths.push(path);
            return chooseNextPath();
          } else {
            return compareAllImages(path, scaledImagePath, scaledImagePaths, chooseNextPath);
          }
        })
        .catch((ex) => {
          console.error('Unable to resize image', imagePath, ex, ex.stack);
          return chooseNextPath();
        });
    });
  } else {
    livePaths.forEach((livePath) => {
      options.navigation.keys.forEach((key) => {
        const path = [].concat(livePath, key);
        if (isDeadPath(path)) {
          console.log('Skipping dead path', path);
        } else if (isCheckedPath(path)) {
          console.log('Skipping checked path', path);
        } else {
          console.log('Generated new path', path);
          paths.push(path)
        }
      });
    });
    livePaths = [];

    if (paths.length > 0) {
      console.log('Generated ' + paths.length + ' new paths');
      chooseNextPath();
    } else {
      console.log('No more paths to render');
      console.log('Dead paths', deadPaths);
    }
  }
}

function resizeImage(imagePath) {
  // ImageMagick e.g. `convert dragon.gif    -resize 50%  half_dragon.gif`

  const scaleInPercentage = 10;
  const diffPath = (options.diffs.path).replace('{today}', today());
  const newImagePath = `${diffPath}/${path.basename(imagePath, '.png')}_${scaleInPercentage}pc.png`;

  console.log('Resizing', imagePath, 'to', newImagePath, 'by', scaleInPercentage, '%');

  return run(`convert ${imagePath} -resize ${scaleInPercentage}% ${newImagePath}`)
    .then(() => {
      return Promise.resolve(newImagePath);
    });
}

function isCheckedPath(path) {
  const pathString = path.join(',');
  return checkedPaths[pathString];
}

function isDeadPath(path) {
  const pathString = path.join(',');
  return Object.keys(deadPaths).reduce((accumulator, deadPath) => {
    return accumulator || pathString.indexOf(deadPath) === 0;
  }, false);
}

function compareAllImages(instructionPath, primaryImagePath, imagePaths, next) {
  imagePaths = [].concat(imagePaths);

  console.log(`Compare all ${imagePaths.length} rendered images against ${instructionPath}`);

  if (imagePaths.length > 0) {
    const imagePath = imagePaths.pop();

    // don't compare image with self
    if (imagePath === primaryImagePath) {
      return compareAllImages(instructionPath, primaryImagePath, imagePaths, next);
    }

    // compare specific image
    compareImages(instructionPath, imagePath, function(result) {
      if (result.percentage < 0.01) {
        // found a match
        console.log('Found matching existing image < 1% difference', imagePath, instructionPath, 'matched', (100 - result.percentage * 100) + '% similar');
        removeDeadPath(instructionPath, {
          matches: imagePath
        }, primaryImagePath);
        next();
      } else {
        // compare next image
        compareAllImages(instructionPath, primaryImagePath, imagePaths, next);
      }
    });
  } else {
    console.log(`Didn't find any image matches, path is still live`);
    livePaths.push(instructionPath);
    next();
  }
}

function compareImages(instructionPath, imagePath, callback) {

  console.log('Compare image on path', instructionPath, 'with', imagePath, scaledImagePath);

  const imagePath1 = scaledImagePath;
  const imagePath2 = imagePath;
  const diffPath = (options.diffs.path).replace('{today}', today());

  const diffImagePath = `${__dirname}/${diffPath}/temp-diff.png`
    .replace('{#}', zp(counter));

  const diffOptions = {
    actualImage: imagePath1,
    expectedImage: imagePath2,
    diffImage: diffImagePath,
  };

  imageDiff.getFullResult(diffOptions, function(err, result) {
    // result = {total: 46340.2, difference: 0.707107}
    if (err) {
      const errorPercentage = 0.5;
      console.error(`Image Diff Error: treating as ${errorPercentage * 100}%`, err);
      result = {
        percentage: errorPercentage
      };
    } else {
      console.log('Image Diff Result', result);
      console.log('Percentage', result.percentage * 100 + '%');
    }

    return callback && callback(result);
  });
}

function removeDeadPath(path, reason, deadImagePath) {
  console.log('Marking dead path:', path, reason);
  console.log(':skull: Dead paths now at', Object.keys(deadPaths).length, 'of', renderedImagePaths.length);
  const pathString = path.join(',');
  deadPaths[pathString] = reason;
  checkedPaths[pathString].dead = reason;
  renderedImagePaths.filter((imagePath) => {
    return imagePath === deadImagePath;
  });
  fs.unlink(__dirname + '/' + deadImagePath);
}

function renderPath(path, screenshot, next) {
  const pathString = path.join(',');

  return run(`phantomjs phantom-harness.js ${pathString} ${counter} ${screenshot}`)
    .then((result) => {
      console.log('Result', result.stdout, result.stderr);
      next();
    })
    .catch((ex) => {
      console.error(ex, ex.stack);
      next();
    });
}

chooseFirstPath();
