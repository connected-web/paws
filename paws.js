const run = require('promise-path').run;
const make = require('promise-path').make;
const write = require('promise-path').write;
const fs = require('fs');
const path = require('path');

const today = require('./lib/today');
const zp = require('./lib/zeropad');
const timePeriod = require('./lib/timePeriod');

const SCHEDULE = {
  ITEM: {
    INITIALISED: 'i',
    QUEUED: 'q',
    COMPLETED: 'c',
    ERRORED: 'x'
  }
};

function monitor(options) {

  console.log('Configuring for product', options);

  const dateAtStart = today();

  var snapshots = [];
  var schedule = {};

  function reportPath() {
    return `${options.output.path}/report.json`
      .replace('{today}', dateAtStart) // requires daily restart to reset, see checkDay
      .replace('{folder}', options.folder);
  }

  function readReport(next) {
    const filepath = reportPath();
    try {
      const report = JSON.parse(fs.readFileSync(filepath));

      snapshots = report.snapshots || [];
      schedule = report.schedule || [];

    } catch (ex) {
      console.log('Unable to read existing report', filepath); //, ex, ex.stack);
    }
    next();
  }

  function updateReport() {
    const report = {
      snapshots,
      schedule
    };
    return write(reportPath(), JSON.stringify(report, null, 2), 'utf8');
  }

  function renderUrl(url, outputPath, next) {
    const pathString = path.join(',');

    return run(`phantomjs phantom-harness.js ${productConfig} ${url} ${outputPath}`)
      .then((result) => {
        console.log('Result', result.stdout, result.stderr);
        next();
      })
      .catch((ex) => {
        console.error(ex, ex.stack);
        next();
      });
  }

  function populateSchedule() {
    const limit = timePeriod('only 1 day').frequencyInSeconds;

    options.paths.forEach((item, itemIndex) => {
      const frequency = timePeriod(item.schedule);
      if (frequency.frequencyInSeconds >= 60) {
        var time = 0;
        while (time < limit) {
          schedule[time] = schedule[time] || {};
          schedule[time][itemIndex] = schedule[time][itemIndex] || SCHEDULE.ITEM.INITIALISED;
          time = time + frequency.frequencyInSeconds;
        }
      } else {
        throw 'Scheduled frequency is set too low; must be greater than or equal to 60 seconds';
      }
    });

    updateReport();
  }

  function selectItemFromSchedule() {

  }

  function processQueue() {
    // do things
    // then processQueue
  }

  readReport(populateSchedule);
  selectItemFromSchedule();
  processQueue();
}

module.exports = {
  monitor
};
