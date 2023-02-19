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

    let actions = {
      "Debugger.attach": async (o, sender) => {
        try {
          await browser.debugger.attach({ tabId: sender.tab.id }, "1.3");
          log("Debugger Attached", sender);
          return sender.tab.id;
        } catch (err) {
          log(err);
          return false;
        }
      },
      "Debugger.detach": async (o, sender) => {
        try {
          browser.debugger.detach({ tabId: sender.tab.id });
          log("Debugger Detached", sender);
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
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      actions[message.type](message.object, sender).then((response) => {
        sendResponse(response);
      });
      return true;
    });
  })();
}
