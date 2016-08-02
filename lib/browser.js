function sendKey(page, keyCode) {
  page.evaluate(function(keyCode) {
    function keyEvent(keyCode, type) {
      var el = document.body;
      var eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent("Events");

      if (eventObj.initEvent) {
        eventObj.initEvent(type, true, true);
      }

      eventObj.keyCode = keyCode;
      eventObj.which = keyCode;

      el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("on" + type, eventObj);
    }

    function keyPress(keyCode) {
      keyEvent(keyCode, 'keydown');
      keyEvent(keyCode, 'keyup');
      console.log('::Fire keypress', keyCode);
    }

    keyPress(keyCode);
  }, keyCode);
}

module.exports = {
  sendKey: sendKey
};
