const find = require('promise-path').find;
const fs = require('fs');

const syntaxErrorRegex = /SyntaxError: Unexpected .+ in JSON at position (\d+)/;

find('screenshots/**/report.json')
  .then((paths) => {
    return Promise.all(paths.map(checkReport));
  })
  .then((results) => {
    results.forEach((result) => {
      console.log(result);
    });
    return results;
  })
  .then((results) => {
    var summary = results.reduce(summarise, {
      broken: 0,
      ok: 0,
      fixed: 0
    });
    console.log('Found', summary.broken, 'broken reports', summary.ok, 'ok reports', 'and fixed', summary.fixed, 'reports');
  });

function summarise(accumulator, item, index, array) {
  if (item.ex) {
    accumulator.broken++;
  } else {
    accumulator.ok++;
  }
  if (item.fix) {
    accumulator.fixed++;
  }
  return accumulator;
}

function checkReport(path) {
  const result = {
    path
  };

  var contents, report;

  try {
    contents = fs.readFileSync(path, 'utf8');
    report = JSON.parse(contents);
  } catch (ex) {
    const exception = ex + '';
    if (syntaxErrorRegex.test(exception)) {
      const lineNumber = exception.match(syntaxErrorRegex)[1];
      result.ex = exception;
      result.advice = 'Remove text after line ' + lineNumber;
      result.fix = fixReport(path, contents, lineNumber);
    } else {
      result.ex = ex;
      result.advice = 'Unable to fix this error, please review file';
    }
  }
  return result;
}

function fixReport(path, contents, lineNumber) {
  var result;
  try {
    contents = contents.substr(0, lineNumber);
    var report = JSON.parse(contents);
    fs.writeFileSync(path, JSON.stringify(report, null, 2), 'utf8');
    result = `Replaced contents after ${lineNumber}, and wrote result to ${path}`;
  } catch (ex) {
    console.error('Attempted to fix', path, 'by replacing at', lineNumber, 'but failed');
    console.error('Exception', ex, ex.stack);
    result = false;
  }
  return result;
}
