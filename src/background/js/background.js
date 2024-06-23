// © BlueFoxEnterprise
// https://github.com/xoFeulB

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    (async () => {
      try {
        let R = await chrome.debugger.sendCommand(
          { tabId: sender.tab.id },
          message.type,
          message.object
        );
        sendResponse(R);
      } catch (e) {
        sendResponse(e);
      }
    })();
    return true;
  }
);
