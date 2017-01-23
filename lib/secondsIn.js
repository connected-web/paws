const second = 1;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

const map = {
  's': second,
  'sec': second,
  'second': second,
  'seconds': second,
  'm': minute,
  'min': hour,
  'minute': minute,
  'minutes': minute,
  'h': hour,
  'hr': hour,
  'hour': hour,
  'hours': hour,
  'd': day,
  'dy': day,
  'day': day,
  'days': day
};

function secondsIn(string) {
  string = string || '';
  return map[string.toLowerCase()] || 0;
}

module.exports = secondsIn;
