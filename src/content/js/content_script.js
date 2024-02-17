// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    let BlueFoxJs = await new Promise((resolve) => {
      let BlueFoxJsReady = async (event) => {
        window.removeEventListener("BlueFoxJs@Ready", BlueFoxJsReady);
        resolve(event.detail.BlueFoxJs);
      };
      window.addEventListener("BlueFoxJs@Ready", BlueFoxJsReady);
    });
    let BlueFox = new BlueFoxJs.Automation.BlueFox()

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

    BlueFox.captureDOM = async (
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
    BlueFox.dispatchKeyEvent = async (o) => {
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
              R = await BlueFox.do(JSON.parse(await _.text));
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
        return await BlueFox.do(JSON.parse(await object));
      },
      "BlueFox.Dispatch.Script": async (object) => {
        log("BlueFox.Dispatch.Script", object);
        let R = await sendMessage({
          type: "Runtime.evaluate",
          object: {
            expression: object,
            objectGroup: "BlueFox-js-lanch",
            awaitPromise: true,
          },
        });
        return R;
      },
      "BlueFox.Scan.NieAgresywny": async (object) => {
        return await window.BlueFoxScanner.scanner();
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
            } catch { }
          });
        } catch { }
        return R;
      },
      "BlueFox.GetElementProperties": async (object) => {
        let R = {};
        try {
          let target = document.querySelector(object.selector);
          for (let property in target) {
            R[property] = target[property];
          }
          R.attributes = {};
          [...target.attributes].forEach((attribute) => {
            R.attributes[attribute.name] = {
              name: attribute.name,
              value: attribute.value
            };
          })

        } catch { }
        return R;
      },
      "BlueFox.CaptureDOMSnapshot": async (object) => {
        let R = await sendMessage({
          type: "DOMSnapshot.captureSnapshot",
          object: object,
        });
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
          log(message, err);
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

    /* BlueFoxServer */ {
      if (window.location.host == "localhost.bluefox.ooo:7777") {
        let R = await sendMessage({
          type: "Tab.getCurrent",
          object: null
        });
        await sendMessage({
          type: "Tab.createWindow",
          object: {
            url: `chrome-extension://${chrome.runtime.id}/tab/html/server.html`,
          }
        });
        await sendMessage({
          type: "Tab.removeWindow",
          object: R.windowId
        });
      }
    }
  })();
}
