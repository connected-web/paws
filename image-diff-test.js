const imageDiff = require('image-diff');

imageDiff.getFullResult({
  actualImage: 'screenshots/home/01-home-.png',
  expectedImage: 'screenshots/home/02-home-Enter.png',
  diffImage: 'screenshots/diff/home/00-home-diff.png',
}, function(err, result) {
  // result = {total: 46340.2, difference: 0.707107}
  if (err) {
    return console.error('Image Diff Error', err);
  }
  console.log('Image Diff Result', result);
  console.log('Percentage', result.percentage * 100 + '%');
});
