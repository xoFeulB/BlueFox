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

    let EventFilter = {
      Event: (event) => {
        return {
          type: event.type,
          eventPrototype: Object.prototype.toString.call(event).slice(8, -1),
          timestamp: event.timeStamp,
          property: {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
          },
        };
      },
      InputEvent: (event) => {
        return {
          type: event.type,
          eventPrototype: Object.prototype.toString.call(event).slice(8, -1),
          timestamp: event.timeStamp,
          property: {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,

            // UIEvent
            detail: event.detail,
            // view: event.view,

            inputType: event.inputType,
            data: event.data,
            isComposing: event.isComposing,
            detail: event.detail,
          },
        };
      },
      KeyboardEvent: (event) => {
        return {
          type: event.type,
          eventPrototype: Object.prototype.toString.call(event).slice(8, -1),
          timestamp: event.timeStamp,
          property: {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
            // UIEvent
            detail: event.detail,
            key: event.key,
            code: event.code,
            location: event.location,
            repeat: event.repeat,
            isComposing: event.isComposing,
            charCode: event.charCode,
            keyCode: event.keyCode,
            which: event.which,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
          },
        };
      },
      FocusEvent: (event) => {
        return {
          type: event.type,
          eventPrototype: Object.prototype.toString.call(event).slice(8, -1),
          timestamp: event.timeStamp,
          property: {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
            // UIEvent
            detail: event.detail,
          },
        };
      },
      MouseEvent: (event) => {
        return {
          type: event.type,
          eventPrototype: Object.prototype.toString.call(event).slice(8, -1),
          timestamp: event.timeStamp,
          property: {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
            // UIEvent
            detail: event.detail,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            button: event.button,
            buttons: event.buttons,
            region: event.region,
          },
        };
      },
    };

    let CaptureType = {
      click: EventFilter.MouseEvent,
      dblclick: EventFilter.MouseEvent,
      drop: EventFilter.MouseEvent,
      dragover: EventFilter.MouseEvent,
      dragenter: EventFilter.MouseEvent,
      pointerdown: EventFilter.MouseEvent,
      beforeinput: EventFilter.InputEvent,
      focus: EventFilter.FocusEvent,
      focusin: EventFilter.FocusEvent,
      focusout: EventFilter.FocusEvent,
      keydown: EventFilter.KeyboardEvent,
      keypress: EventFilter.KeyboardEvent,
      keyup: EventFilter.KeyboardEvent,
      input: EventFilter.InputEvent,
      change: EventFilter.Event,
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
                  awaitPromise: true,
                  returnByValue: true,
                },
              });
            },
          }[f.type](f);
        }
        return R;
      },
      "BlueFox.Dispatch.Action": async (object) => {
        log("BlueFox.Dispatch.Action", JSON.parse(object));
        return await BlueFox.do(JSON.parse(object));
      },
      "BlueFox.Dispatch.Script": async (object) => {
        log("BlueFox.Dispatch.Script", object);
        let R = await sendMessage({
          type: "Runtime.evaluate",
          object: {
            expression: object,
            objectGroup: "BlueFox-js-lanch",
            awaitPromise: true,
            returnByValue: true,
          },
        });
        return R;
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
          });

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
      "BlueFoxScript.AddEventListener": async (object) => {
        try {
          let R = [];
          [...document.querySelectorAll(object.selector)].forEach((_) => {
            let selector = CssSelectorGenerator.getCssSelector(_);
            let uuid = crypto.randomUUID();
            _.addEventListener(
              object.event_type,
              (event) => {
                object.connector.postMessage(
                  Object.assign(
                    object.message,
                    {
                      object: {
                        uuid: object.uuid,
                        object: {
                          uuid: uuid,
                          type: object.type,
                          event: (() => {
                            try {
                              return Object.assign(
                                CaptureType[event.type](event),
                                {
                                  target: selector,
                                }
                              );
                            } catch (e) {
                              return {
                                type: object.event_type,
                                target: selector,
                              };
                            }
                          })(),
                          properties: (() => {
                            let r = {};
                            for (let property in _) {
                              r[property] = _[property];
                            }
                            r.attributes = {};
                            [..._.attributes].forEach((attribute) => {
                              r.attributes[attribute.name] = {
                                name: attribute.name,
                                value: attribute.value
                              };
                            });
                            return r;
                          })()
                        }
                      },
                    }
                  )
                );
              }
            );

            R.push(
              {
                uuid: uuid,
                selector: selector,
              }
            );
          })
          return R;
        } catch (e) {
          return [];
        }
      },
    };
    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener(async (message) => {
        try {
          let R = await messageHandler[message.type](
            Object.assign(message.object, {
              message: message,
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
            url: `chrome-extension://${chrome.runtime.id}/tab/html/index.html`,
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
