// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    let browser = chrome ? chrome : browser;
    let log = (...args) => {
      console.log("background.js", ...args);
    };
    log("loaded");
    let sendMessage = async (arg) => {
      try {
        return await browser.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let debuggee = {};

    let actions = {
      "Debugger.attach": async (o, sender) => {
        try {
          debuggee[sender.tab.id] = sender;
          await browser.debugger.attach({ tabId: sender.tab.id }, "1.3");
          log("Debugger Attached", sender);
          return sender.tab.id;
        } catch (err) {
          log(err);
          return false;
        }
      },
      "Page.captureScreenshot": async (o, sender) => {
        try {
          let result = await browser.debugger.sendCommand(
            { tabId: sender.tab.id },
            "Page.captureScreenshot",
            o
          );
          return result.data;
        } catch (err) {
          log(err);
        }
      },
      "Debugger.getDebuggee": async (o, sender) => {
        try {
          return debuggee;
        } catch (err) {
          log(err);
          return false;
        }
      },
    };

    browser.debugger.onDetach.addListener((source, reason) => {
      delete debuggee[source.tabId];
    });

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.to == "ServiceWorker") {
        actions[message.type](message.object, sender).then((response) => {
          sendResponse(response);
        });
        return true;
      }
    });
  })();
}
