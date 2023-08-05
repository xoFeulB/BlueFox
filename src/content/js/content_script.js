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
    window.BlueFox.dispatchKeyEvent = async (o) => {
      let R = await sendMessage({
        type: "Input.dispatchKeyEvent",
        object: o,
      });
      return R;
    };

    let messageHandler = {
      "BlueFox.Dispatch": async (object) => {
        log(object);
        let R;
        for (let f of object.files) {
          await {
            "application/json": async (_) => {
              let bluefox = new window.BlueFox();
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
      "BlueFox.Dispatch.Action": async (object) => {
        log("BlueFox.Dispatch.Action", object);
        let bluefox = new window.BlueFox();
        return await bluefox.do(JSON.parse(await object));
      },
      "BlueFox.Dispatch.Script": async (object) => {
        log("BlueFox.Dispatch.Script", object);
        await sendMessage({
          type: "Runtime.evaluate",
          object: {
            expression: await object,
            objectGroup: "BlueFox-js-lanch",
          },
        });
        return {};
      },
      "BlueFox.Scan.NieAgresywny": async (object) => {
        await window.BlueFoxScanner.scanner();
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
      "BlueFox.GetSelectors": async (object) => {
        let R = [];
        try {
          [...document.querySelectorAll(object.selector)].forEach((_) => {
            try {
              R.push({
                selector: CssSelectorGenerator.getCssSelector(_),
                attributes: (() => {
                  let r = {};
                  [..._.attributes]
                    .map((attribute) => {
                      return {
                        name: attribute.name,
                        value: attribute.value,
                      };
                    })
                    .forEach((attribute) => {
                      r[attribute.name] = attribute.value;
                    });
                  return r;
                })(),
              });
            } catch {}
          });
        } catch {}
        return R;
      },
      "BlueFox.GetElementProperties": async (object) => {
        let R = {};
        try {
          let target = document.querySelector(object.selector);
          for (let property in target) {
            R[property] = target[property];
          }
        } catch {}
        return R;
      },
    };
    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener(async (message) => {
        try {
          let R = await messageHandler[message.type](
            Object.assign(message.object, {
              connector: connector,
            })
          );
          connector.postMessage({
            uuid: message.uuid,
            type: message.type,
            object: R,
          });
        } catch (err) {
          log(err);
        }
      });
    });

    await sendMessage({
      type: "Debugger.attach",
    });
    setInterval(async () => {
      await sendMessage({
        type: "Debugger.attach",
      });
    }, 5000);
  })();
}
