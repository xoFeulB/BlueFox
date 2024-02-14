// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    let log = (...args) => {
      console.log("background.js", ...args);
    };
    log("loaded");
    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let R = {
      pageInfo: {},
      event_observer: {},
      debugger: {},
    };

    let actions = {
      "Debugger.attach": async (o, sender) => {
        try {
          await chrome.debugger.attach({ tabId: sender.tab.id }, "1.3");
          log("Debugger Attached", sender);
          R.debugger[sender.tab.id] = sender;
          return sender.tab.id;
        } catch (err) {
          // log(err);
          return false;
        }
      },
      "Debugger.detach": async (o, sender) => {
        try {
          chrome.debugger.detach({ tabId: sender.tab.id });
          log("Debugger Detached", sender);
          return sender.tab.id;
        } catch (err) {
          log(err);
          return false;
        }
      },
      "Debugger.isOnline": async (o, sender) => {
        if (sender.tab.id in R.debugger) {
          return true;
        }
        return false;
      },
      "Page.captureScreenshot": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "Page.captureScreenshot",
            o
          );
          return result.data;
        } catch (err) {
          log(err);
        }
      },
      "DOMDebugger.getEventListeners": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "DOMDebugger.getEventListeners",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "Runtime.evaluate": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "Runtime.evaluate",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "DOM.resolveNode": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "DOM.resolveNode",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "DOM.getOuterHTML": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "DOM.getOuterHTML",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "DOM.querySelectorAll": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "DOM.querySelectorAll",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "DOMSnapshot.captureSnapshot": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "DOMSnapshot.captureSnapshot",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "DOM.getDocument": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "DOM.getDocument",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "BlueFox.storeEvent": async (o, sender) => {
        R.event_observer[sender.tab.id].push({
          url: sender.tab.url,
          title: sender.tab.title,
          action: o,
        });
      },
      "Input.dispatchKeyEvent": async (o, sender) => {
        try {
          let result = await chrome.debugger.sendCommand(
            { tabId: sender.tab.id },
            "Input.dispatchKeyEvent",
            o
          );
          return result;
        } catch (err) {
          log(err);
        }
      },
      "Tab.getCurrent": async (o, sender) => {
        try {
          let result = sender.tab;
          return result;
        } catch (err) {
          log(err);
        }
      },
      "Tab.createWindow": async (o, sender) => {
        try {
          let result = await chrome.windows.create(o);
          return result;
        } catch (err) {
          log(err);
        }
      },
      "Tab.removeWindow": async (o, sender) => {
        try {
          let result = await chrome.windows.remove(o);
          return result;
        } catch (err) {
          log(err);
        }
      },
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      actions[message.type](message.object, sender).then((response) => {
        sendResponse(response);
      });
      return true;
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      // log(R);
      delete R.event_observer[tabId];
      delete R.pageInfo[tabId];
      delete R.debugger[tabId];
    });

    chrome.tabs.onUpdated.addListener(async (tabId) => {
      try {
        // log(R);
        R.event_observer[tabId] = [];
        let dom_snapshot = await chrome.debugger.sendCommand(
          { tabId: tabId },
          "DOMSnapshot.captureSnapshot",
          {
            computedStyles: [],
          }
        );
        let strings = dom_snapshot.documents[0].nodes.nodeValue
          .filter((_) => {
            return _ != -1 && dom_snapshot.strings[_].trim();
          })
          .map((_) => {
            return dom_snapshot.strings[_].trim();
          });

        R.pageInfo[tabId] = {
          title: R.debugger[tabId].tab.title,
          url: R.debugger[tabId].tab.url,
          strings: strings,
        };
      } catch { }
    });
    // chrome.tabs.onDetached.addListener((event)=>{log(event)});
    // chrome.tabs.onAttached.addListener((event)=>{log(event)});

    chrome.tabs.onCreated.addListener((tab) => {
      R.pageInfo[tab.id] = [];
      R.pageInfo[tab.id] = {};
    });

    // chrome.tabs.onMoved.addListener((event)=>{log(event)});
  })();
}
