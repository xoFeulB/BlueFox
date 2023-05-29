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
        log(object);
        let R;
        for (let f of object.files) {
          await {
            "application/json": async (_) => {
              let bluefox = new window.BlueFox.v1();
              R = await bluefox.do(JSON.parse(await _.text));
            },
            "text/javascript": async (_) => {
              await sendMessage({
                type: "Runtime.evaluate",
                object: {
                  expression: await _.text,
                  objectGroup: "BlueFox-js-lanch",
                },
              });
            },
          }[f.type](f);
        }
        return R;
      },
      "BlueFox.Scan.NieAgresywny": async (object) => {
        await window.BlueFox.scanner();
      },
      "BlueFox.CaptureWindow": async (object) => {
        let R = await sendMessage({
          type: "Page.captureScreenshot",
          object: object,
        });
        return R;
      },
      "BlueFox.GetEventListners": async (object) => {
        let R = (
          await sendMessage({
            type: "DOMDebugger.getEventListeners",
            object: {
              objectId: (
                await sendMessage({
                  type: "Runtime.evaluate",
                  object: {
                    expression: "(()=>{return document;})()",
                    objectGroup: "event-listeners-test",
                  },
                })
              ).result.objectId,
              depth: -1,
            },
          })
        ).listeners;
        return R;
      },
    };
    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener(async (message) => {
        try{
          connector.postMessage({
            type: message.type,
            object: await messageHandler[message.type](
              Object.assign(message.object, {
                connector: connector,
              })
            ),
          });
        } catch {}
      });
    });

    await sendMessage({
      type: "Debugger.attach",
    });
  })();
}
