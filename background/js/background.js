// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    let log = console.log;

    let R = {
      pageInfo: {},
      event_observer: {},
      debugger: {},
    };

    let actions = {
      "Debugger.attach": async (o, sender) => {
        await chrome.debugger.attach({ tabId: sender.tab.id }, "1.3");
        log("Debugger Attached", sender);
        R.debugger[sender.tab.id] = sender;
        return sender.tab.id;
      },
      "Debugger.detach": async (o, sender) => {
        chrome.debugger.detach({ tabId: sender.tab.id });
        log("Debugger Detached", sender);
        return sender.tab.id;
      },
      "Debugger.isOnline": async (o, sender) => {
        if (sender.tab.id in R.debugger) {
          return true;
        }
        return false;
      },
      "Page.captureScreenshot": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "Page.captureScreenshot",
          o
        );
        return result.data;
      },
      "DOMDebugger.getEventListeners": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "DOMDebugger.getEventListeners",
          o
        );
        return result;
      },
      "Runtime.enable": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "Runtime.compileScript",
          o
        );
        return result;
      },
      "Runtime.compileScript": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "Runtime.compileScript",
          o
        );
        return result;
      },
      "Runtime.evaluate": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "Runtime.evaluate",
          o
        );
        return result;
      },
      "Runtime.runScript ": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "Runtime.runScript",
          o
        );
        return result;
      },
      "DOM.resolveNode": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "DOM.resolveNode",
          o
        );
        return result;
      },
      "DOM.getOuterHTML": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "DOM.getOuterHTML",
          o
        );
        return result;
      },
      "DOM.querySelectorAll": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "DOM.querySelectorAll",
          o
        );
        return result;
      },
      "DOMSnapshot.captureSnapshot": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "DOMSnapshot.captureSnapshot",
          o
        );
        return result;
      },
      "DOM.getDocument": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "DOM.getDocument",
          o
        );
        return result;
      },
      "BlueFox.storeEvent": async (o, sender) => {
        R.event_observer[sender.tab.id].push({
          url: sender.tab.url,
          title: sender.tab.title,
          action: o,
        });
      },
      "Input.dispatchKeyEvent": async (o, sender) => {
        let result = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          "Input.dispatchKeyEvent",
          o
        );
        return result;
      },
      "Tab.getCurrent": async (o, sender) => {
        let result = sender.tab;
        return result;
      },
      "Tab.createWindow": async (o, sender) => {
        let result = await chrome.windows.create(o);
        return result;
      },
      "Tab.removeWindow": async (o, sender) => {
        let result = await chrome.windows.remove(o);
        return result;
      },
    };

    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        if (message.type in actions) {
          (async () => {
            try {
              let R = await actions[message.type](message.object, sender);
              sendResponse(R);
            } catch (e) {
              sendResponse(e);
            }
          })();
          return true;
        } else {
          return false;
        }
      }
    );

    chrome.tabs.onRemoved.addListener((tabId) => {
      delete R.event_observer[tabId];
      delete R.pageInfo[tabId];
      delete R.debugger[tabId];
    });

    chrome.tabs.onUpdated.addListener(async (tabId) => {
      try {
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

    chrome.tabs.onCreated.addListener((tab) => {
      R.pageInfo[tab.id] = {};
    });

  })();
}
