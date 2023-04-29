// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

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

    let actions = {
      "Debugger.attach": async (o, sender) => {
        try {
          await chrome.debugger.attach({ tabId: sender.tab.id }, "1.3");
          log("Debugger Attached", sender);
          return sender.tab.id;
        } catch (err) {
          log(err);
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
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      log(message);
      actions[message.type](message.object, sender).then((response) => {
        sendResponse(response);
      });
      return true;
    });



    // chrome.tabs.onRemoved.addListener((event)=>{log(event)});
    // chrome.tabs.onDetached.addListener((event)=>{log(event)});
    // chrome.tabs.onAttached.addListener((event)=>{log(event)});
    // chrome.tabs.onUpdated.addListener((event)=>{log(event)});

    // chrome.tabs.onCreated.addListener((tabid)=>{log(tabid)});
    // chrome.tabs.onMoved.addListener((event)=>{log(event)});
  })();
}
