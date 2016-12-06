const secondsIn = require('./secondsIn');
const periodMatcher = /([A-z]+)\s([\d]+)\s([A-z]+)/;

function timePeriod(timeString) {
  timeString = timeString + '';

  const matches = timeString.match(periodMatcher);

  if (!matches) {
    throw 'Unrecognised format for time string: ' + timeString + ' expected to match ' + periodMatcher.toString();
  }

  const prefix = matches[1];
  const count = matches[2];
  const period = matches[3];
  const periodInSeconds = secondsIn(period);
  const frequencyInSeconds = count * periodInSeconds;

  return {
    prefix,
    count,
    period,
    periodInSeconds,
    frequencyInSeconds
  };
}

module.exports = timePeriod;
