{
  // "devtools_page": "/devtools/html/devtools.html",
  (async () => {
    let browser = chrome ? chrome : browser;
    let log = (...args) => {
      console.log("devtools.js", ...args);
    };
    log("loaded");

    await browser.devtools.panels.create(
      "BlueFox",
      "lobelia_logo.png",
      "panel.html"
    );

    browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        log(message, sender, sendResponse);
        return true;
      }
    );
  })();
}
