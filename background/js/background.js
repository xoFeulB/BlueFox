{
  (async () => {
    let browser = chrome ? chrome : browser;
    let log = (...args) => {
      console.log("background.js", ...args);
    };
    log("loaded");

    let debuggee = {};

    let actions = {
      "Debugger.attach": async (o, sender) => {
        try {
          await browser.debugger.attach({ tabId: sender.tab.id }, "1.3");
          log("Debugger Attached", sender);
        } catch (err) {
          log(err);
        }
      },
      "Debugger.detach": async (o, sender) => {
        try {
          await browser.debugger.detach({ tabId: sender.tab.id }, "1.3");
          log("Debugger Detached", sender);
        } catch (err) {
          log(err);
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
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      actions[message.type](message.object, sender).then((response) => {
        sendResponse(response);
      });
      return true;
    });
  })();
}
