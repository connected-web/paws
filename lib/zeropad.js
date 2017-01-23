function zeropad(number) {
  return (number < 10) ? '0' + number : number;
}

module.exports = zeropad;
