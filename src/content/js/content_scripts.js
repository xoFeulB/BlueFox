// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    window.BlueFox ? null : (window.BlueFox = {});

    let log = (...args) => {
      console.log("content_scripts.js", ...args);
    };
    log("loaded");

    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    window.BlueFox.captureDOM = async (
      file_name,
      element,
      window_object,
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
            y: domRect.top + window_object.scrollY,
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

    let messageHandler = {
      "BlueFox.Dispatch": async (object) => {
        for (let J of object.json) {
          let jsonWalker = new (window.BlueFox.v1())(J);
          await jsonWalker.do();
        }
      },
      "BlueFox.Scan.NieAgresywny": async (object) => {
        await window.BlueFox.scanner();
      },
    };
    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener((message) => {
        messageHandler[message.type](message.object);
      });
    });

    await sendMessage({
      type: "Debugger.attach",
      object: {},
    });
  })();
}
