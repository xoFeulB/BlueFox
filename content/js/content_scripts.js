// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    window.BlueFox ? null : (window.BlueFox = {});
    let browser = chrome ? chrome : browser;

    let log = (...args) => {
      console.log("content_scripts.js", ...args);
    };
    log("loaded");

    let sendMessage = async (arg) => {
      try {
        return await browser.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let items = await chrome.storage.local.get("BlueFoxSetting_url");
    for (url of JSON.parse(items.BlueFoxSetting_url)) {
      if (window.location.href.match(url)) {
        await sendMessage({
          to: "ServiceWorker",
          type: "Debugger.attach",
          object: {},
        });

        window.BlueFox.captureDOM = async (
          file_name,
          element,
          window_object,
          format = "jpeg",
          quality = 50
        ) => {
          let domRect = element.getBoundingClientRect();
          let R = await sendMessage({
            to: "ServiceWorker",
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

        break;
      }
    }

    let dropHandler = async (files) => {
      [...files].forEach(async (file) => {
        let J = JSON.parse(await file.text());
        let version = J.version;
        let jsonWalker = new (window.BlueFox.jsonWalker[version]())(J);
        await jsonWalker.do();
        log(jsonWalker.take);
      });
    };

    window.addEventListener("drop", async (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      await dropHandler(event.dataTransfer.files);
    });
    window.addEventListener("dragover", async (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
  })();
}
