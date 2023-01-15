{
  (async () => {
    window.BlueFox = {};
    let browser = chrome ? chrome : browser;
    let log = (...args) => {
      console.log("content_scripts.js", ...args);
    };
    log("loaded");
    browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        log(message, sender, sendResponse);
        return true;
      }
    );

    let sendMessage = async (arg) => {
      try {
        return await browser.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let items = await chrome.storage.local.get("BlueFoxSetting_url");
    log(items);
    for (url of JSON.parse(items.BlueFoxSetting_url)) {
      log(url);
      if (window.location.href.match(url)) {
        await sendMessage({
          type: "Debugger.attach",
          object: {},
        });

        window.BlueFox.captureDOM = async (
          file_name,
          element,
          format = "jpeg",
          quality = 50
        ) => {
          let domRect = element.getBoundingClientRect();
          let R = await sendMessage({
            type: "Page.captureScreenshot",
            object: {
              format: format,
              quality: quality,
              clip: {
                x: domRect.x,
                y: domRect.y,
                width: domRect.width,
                height: domRect.height,
                scale: 1,
              },
              captureBeyondViewport: true,
            },
          });
          Object.assign(document.createElement("a"), {
            href: `data:image/png;base64,${R}`,
            download: `${file_name}.${format}`,
          }).click();
        };
        break;
      }
    }
  })();
}
