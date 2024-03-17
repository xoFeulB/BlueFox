// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    sessionStorage.uuid = null;
    let windowOnLoad = new Promise((resolve) => {
      let load = async (event) => {
        window.removeEventListener("load", load);
        resolve(crypto.randomUUID());
      };
      window.addEventListener("load", load);
    });

    let BlueFoxJs = await new Promise((resolve) => {
      let BlueFoxJsReady = async (event) => {
        window.removeEventListener("BlueFoxJs@Ready", BlueFoxJsReady);
        resolve(event.detail.BlueFoxJs);
      };
      window.addEventListener("BlueFoxJs@Ready", BlueFoxJsReady);
    });

    class BlueFox extends BlueFoxJs.Automation.BlueFox {
      async captureDOM(file_name,
        element,
        window_object,
        format = "jpeg",
        quality = 50
      ) {
        let domRect = element.getBoundingClientRect();
        let R = await chrome.runtime.sendMessage({
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
          href: `data:image/png;base64,${R.data}`,
          download: `${file_name}.${format}`,
        }).click();
      }

      async dispatchKeyEvent(o) {
        let R = await chrome.runtime.sendMessage({
          type: "Input.dispatchKeyEvent",
          object: o,
        });
        return R;
      }
    }

    let bluefox = new BlueFox();

    let log = console.log;

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
      "BlueFox.Dispatch.Action": async (message, connector) => {
        return await bluefox.do(JSON.parse(message.object));
      },
      "BlueFox.Dispatch.Script": async (message, connector) => {
        let R = await chrome.runtime.sendMessage({
          type: "Runtime.evaluate",
          object: {
            expression: message.object,
            objectGroup: "BlueFox-js-lanch",
            awaitPromise: true,
            returnByValue: true,
          },
        });
        return R;
      },
      "BlueFox.CaptureWindow": async (message, connector) => {
        let R = await chrome.runtime.sendMessage({
          type: "Page.captureScreenshot",
          object: message.object,
        });
        return R.data;
      },
      "BlueFox.GetEventListners": async (message, connector) => {
        let R = (
          await chrome.runtime.sendMessage({
            type: "DOMDebugger.getEventListeners",
            object: {
              objectId: (
                await chrome.runtime.sendMessage({
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
      "BlueFox.GetSelectors": async (message, connector) => {
        let R = [];
        try {
          [...document.querySelectorAll(message.object.selector)].forEach((_) => {
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
      "BlueFox.GetElementProperties": async (message, connector) => {
        let R = {};
        let select = (selector) => {
          if (selector[0] == "/") {
            return document.evaluate(
              selector,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null,
            ).singleNodeValue;
          }
          else {
            return document.querySelector(selector);
          }
        };
        try {
          let target = select(message.object.selector);
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
      "BlueFox.CaptureDOMSnapshot": async (message, connector) => {
        let R = await chrome.runtime.sendMessage({
          type: "DOMSnapshot.captureSnapshot",
          object: message.object,
        });
        return R;
      },
      "BlueFoxScript.AddEventListener": async (message, connector) => {
        try {
          let R = [];
          let elements = [];
          if (message.object.selector[0] == "/") {
            let result = document.evaluate(
              message.object.selector,
              document,
              null,
              XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
              null,
            );
            elements = [...(
              function* () {
                while ((node = result.iterateNext())) {
                  yield node;
                }
              }
            )(result)];
          } else {
            elements = [...document.querySelectorAll(message.object.selector)];
          }
          elements.forEach((_) => {
            let selector = CssSelectorGenerator.getCssSelector(_);
            let uuid = crypto.randomUUID();
            _.addEventListener(
              message.object.event_type,
              (event) => {
                connector.postMessage(
                  Object.assign(
                    message,
                    {
                      object: {
                        uuid: message.object.uuid,
                        object: {
                          uuid: uuid,
                          type: message.object.type,
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
                                type: message.object.event_type,
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
      "Tab.windowOnLoad": async (message, connector) => {
        sessionStorage.uuid = await windowOnLoad;
        return sessionStorage.uuid;
      },
    };

    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener((message) => {
        (async () => {
          if (message.type in messageHandler) {
            try {
              let R = await messageHandler[message.type](
                message,
                connector,
              );
              connector.postMessage({
                uuid: message.uuid,
                type: message.type,
                object: R,
              });
            } catch (err) { }
          }
        })();
      });
    });
  })();
}
