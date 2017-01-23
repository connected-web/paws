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
  var queue = [];

  function reportPath() {
    return outputPath('report.json');
  }

  function outputPath(fileName) {
    return `${options.output.path}/${fileName}`
      .replace('{today}', dateAtStart) // requires daily restart to reset, see checkDay
      .replace('{folder}', options.folder)
      .replace('{time}', timeTodayInSeconds());
  }

  function readReport(next) {
    const filepath = reportPath();
    try {
      const report = JSON.parse(fs.readFileSync(filepath));

      snapshots = report.snapshots || [];
      schedule = report.schedule || {};
      queue = report.queue || [];

    } catch (ex) {
      console.log('Unable to read existing report', filepath); //, ex, ex.stack);
    }
    next();
  }

  function updateReport() {
    const report = {
      snapshots,
      schedule,
      queue
    };
    return write(reportPath(), JSON.stringify(report, null, 2), 'utf8');
  }

  function renderUrl(url, outputPath, next) {
    const pathString = path.join(',');
    const productConfig = `${__dirname}/${options.source}`;

    const renderCommand = `phantomjs phantom-harness.js ${productConfig} ${url} ${outputPath}`;
    console.log('Rendering', renderCommand);
    return run(renderCommand)
      .then((result) => {
        console.log('Result', result.stdout, result.stderr);
        next();
      })
      .catch((ex) => {
        console.error(ex, ex.stack);
        next(ex);
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

    return updateReport();
  }

  function timeTodayInSeconds() {
    var dayStart = new Date();
    dayStart.setHours(0);
    dayStart.setMinutes(0);
    dayStart.setSeconds(0);

    var now = new Date();
    return Math.round((now.getTime() - dayStart.getTime()) / 1000);
  }

  function queueItemsFromSchedule() {
    const frequencyInSeconds = 60;
    var timeSlot = Math.floor(timeTodayInSeconds() / frequencyInSeconds) * frequencyInSeconds;
    var item = schedule[timeSlot];
    if (item) {
      Object.keys(item).forEach((key) => {
        if (item[key] === SCHEDULE.ITEM.INITIALISED) {
          item[key] = SCHEDULE.ITEM.QUEUED;
          queue.push({
            time: timeSlot,
            index: key
          });
        }
      });
    }
    if (queue.length > 0) {
      console.log('Queuing items from schedule:', options.name, 'Queue length', queue.length, 'Time slot', timeSlot);
      return updateReport();
    }
    return Promise.resolve(true);
  }

  function processQueue() {
    // do things
    // then processQueue
    if (queue.length > 0) {
      var nextItem = queue.shift();
      var pathConfig = options.paths[nextItem.index];
      var url = pathConfig.url;
      var path = outputPath(`${options.output.prefix}snapshot`);
      console.log('Renderering URL', url, ':', path);
      renderUrl(url, path, (error) => {
        if (error) {
          handleError(error);
          schedule[nextItem.time][nextItem.index] = SCHEDULE.ITEM.ERRORED;
        } else {
          console.log('Completed render on', options.name, url);
          schedule[nextItem.time][nextItem.index] = SCHEDULE.ITEM.COMPLETED;
        }
        updateReport()
        queueItemsFromSchedule()
          .then(() => {
            setTimeout(processQueue, 1000);
          })
          .catch(handleError);
      });
    } else {
      setTimeout(() => {
        queueItemsFromSchedule()
          .then(processQueue)
          .catch(handleError);
      }, 5000);
    }
  }

  return readReport(() => {
    populateSchedule()
      .then(queueItemsFromSchedule)
      .then(processQueue)
      .catch(handleError);
  });
}

function handleError(ex) {
  console.error('Unable to process queue', ex, ex.stack);
}

module.exports = {
  monitor
};
