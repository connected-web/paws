function render(page, entry, config, next) {
  console.log('Capturing image', entry && entry.path);
  var wait = config.wait && config.wait.timeInSeconds || 500;
  setTimeout(function () {
    try {
      page.render(entry.path);
    } catch (ex) {
      entry.error = ex;
    }
    entry.pending = false;
    console.log('Captured', entry.path);
    next && next();
  }, wait * 1000);
}

module.exports = render;
