// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    let log = (...args) => {
      console.log("event_observer.js", ...args);
    };
    log("loaded");

    let getCssSelector = (e) => {
      return CssSelectorGenerator.getCssSelector(e);
    };

    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let EventFilter = {
      Event: (event) => {
        return {
          type: event.type,
          eventPrototype: Object.prototype.toString.call(event).slice(8, -1),
          target: getCssSelector(event.target),
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
          target: getCssSelector(event.target),
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
          target: getCssSelector(event.target),
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
          target: getCssSelector(event.target),
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
          target: getCssSelector(event.target),
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
      "BlueFox.CapturEvents": async (object) => {
        {
          let box = document.createElement("div");
          box.id = "bluefox-loading";

          let message = document.createElement("div");
          message.textContent = "BlueFox waiting for page to finish loading";
          message.style.position = "fixed";
          message.style.zIndex = "999";
          message.style.top = "50vh";
          message.style.left = "50vw";
          message.style.paddingLeft = "1em";
          message.style.color = "white";

          box.appendChild(message);

          let fil = document.createElement("div");
          fil.style.position = "fixed";
          fil.style.width = "100vw";
          fil.style.height = "100vh";
          fil.style.zIndex = "998";
          fil.style.top = "0";
          fil.style.left = "0";
          fil.style.backgroundColor = "rgba(0,0,0,0.5)";

          box.appendChild(fil);

          document.body.appendChild(box);
        }

        let eventListner = (event) => {
          let action = CaptureType[event.type](event);
          log(action);
          object.connector.postMessage({
            type: "BlueFox.CapturedEvent",
            object: { action: action },
          });
        };
        let listners = (
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

        let nodes = new Set();
        for (let listner of listners) {
          let node = await sendMessage({
            type: "DOM.resolveNode",
            object: { backendNodeId: listner.backendNodeId },
          });

          nodes.add(
            JSON.stringify({
              useCapture: listner.useCapture,
              eventType: listner.type,
              description: node.object.description,
            })
          );
        }
        nodes = [...nodes].map((_) => {
          return JSON.parse(_);
        });
        nodes
          .filter((_) => {
            return Object.keys(CaptureType).includes(_.eventType);
          })
          .forEach((_) => {
            try {
              [...document.querySelectorAll(_.description)].forEach((e) => {
                e.addEventListener(_.eventType, eventListner);
              });
            } catch { }
          });

        {
          document.querySelector("#bluefox-loading").remove();
        }

        return nodes.filter((_) => {
          return Object.keys(CaptureType).includes(_.eventType);
        });
      },
    };
    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener(async (message) => {
        try {
          connector.postMessage({
            type: message.type,
            object: await messageHandler[message.type](
              Object.assign(message.object, {
                connector: connector,
              })
            ),
          });
        } catch { }
      });
    });
  })();
}
