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
      async captureDOM(
        file_name,
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

      async dispatchKeyEvent(object) {
        let R = await chrome.runtime.sendMessage({
          type: "Input.dispatchKeyEvent",
          object: object,
        });
        return R;
      }
    }

    class MessageHandler {
      constructor() {
        this.EventFilter = {
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
        this.CaptureType = {
          click: this.EventFilter.MouseEvent,
          dblclick: this.EventFilter.MouseEvent,
          drop: this.EventFilter.MouseEvent,
          dragover: this.EventFilter.MouseEvent,
          dragenter: this.EventFilter.MouseEvent,
          pointerdown: this.EventFilter.MouseEvent,
          beforeinput: this.EventFilter.InputEvent,
          focus: this.EventFilter.FocusEvent,
          focusin: this.EventFilter.FocusEvent,
          focusout: this.EventFilter.FocusEvent,
          keydown: this.EventFilter.KeyboardEvent,
          keypress: this.EventFilter.KeyboardEvent,
          keyup: this.EventFilter.KeyboardEvent,
          input: this.EventFilter.InputEvent,
          change: this.EventFilter.Event,
        };
        this.bluefox = new BlueFox();
        chrome.runtime.onConnect.addListener((connector) => {
          connector.onMessage.addListener((message) => {
            (async () => {
              let R = {};
              for (let [key, value] of Object.entries(message)) {
                if (key in this) {
                  R[key] = await this[key](value, connector);
                }
              }
              connector.postMessage(
                Object.assign(
                  R,
                  {
                    uuid: message.uuid,
                  }
                )
              );
            })();
          });
        });
      }

      // Handlers
      async BlueFoxDispatchAction(object, connector) {
        return await this.bluefox.do(JSON.parse(object));
      }
      async BlueFoxDispatchScript(object, connector) {
        let R = await chrome.runtime.sendMessage({
          type: "Runtime.evaluate",
          object: {
            expression: object,
            objectGroup: "BlueFox-js-lanch",
            awaitPromise: true,
            returnByValue: true,
          },
        });
        return R;
      }
      async BlueFoxCaptureWindow(object, connector) {
        let R = await chrome.runtime.sendMessage({
          type: "Page.captureScreenshot",
          object: object,
        });
        return R.data;
      }
      async BlueFoxGetEventListners(object, connector) {
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
      }
      async BlueFoxGetSelectors(object, connector) {
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
      }
      async BlueFoxGetElementProperties(object, connector) {
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
          let target = select(object.selector);
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
        } catch (e) { }
        return R;
      }
      async BlueFoxCaptureDOMSnapshot(object, connector) {
        let R = await chrome.runtime.sendMessage({
          type: "DOMSnapshot.captureSnapshot",
          object: object,
        });
        return R;
      }
      async BlueFoxScriptAddEventListener(object, connector) {
        try {
          let R = [];
          let elements = [];
          if (object.selector[0] == "/") {
            let result = document.evaluate(
              object.selector,
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
            elements = [...document.querySelectorAll(object.selector)];
          }
          elements.forEach((_) => {
            let selector = CssSelectorGenerator.getCssSelector(_);
            let uuid = crypto.randomUUID();
            _.addEventListener(
              object.event_type,
              (event) => {
                connector.postMessage(
                  Object.assign(
                    object,
                    {
                      uuid: object.uuid,
                      object: {
                        uuid: uuid,
                        type: object.type,
                        event: (() => {
                          try {
                            return Object.assign(
                              this.CaptureType[event.type](event),
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
      }
      async TabWindowOnLoad(object, connector) {
        sessionStorage.uuid = await windowOnLoad;
        return sessionStorage.uuid;
      }
    }

    new MessageHandler();
  })();
}
