var browser = require('./browser');

function sendKey(page, keyName, config, next) {

  var keyCode = config.navigation.keyMap[keyName];

  console.log('Sending key', keyName, keyCode);

  setTimeout(function() {
    browser.sendKey(page, keyCode);
    console.log('Key sent', keyCode);
    next();
  }, config.navigation.wait.timeInSeconds * 1000);
}

module.exports = sendKey;
