function render(page, entry, config, next) {
  console.log('Capturing image');
  setTimeout(function() {
    try {
      page.render(entry.imagePath);
    } catch (ex) {
      entry.error = ex;
    }
    entry.pending = false;
    console.log('Image captured', entry.imagePath);
    next();
  }, config.navigation.wait.timeInSeconds * 1000);
}

module.exports = render;
