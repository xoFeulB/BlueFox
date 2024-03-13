// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    /* BlueFoxServer */ {
      if (
        [
          window.location.host == "localhost.bluefox.ooo:7777",
          window.location.href == "https://ooo.bluefox.ooo/BlueFox/info/index.json",
        ].some((_) => { return _; })
      ) {
        let R = await chrome.runtime.sendMessage({
          type: "Tab.getCurrent",
          object: null
        });
        await chrome.runtime.sendMessage({
          type: "Tab.createWindow",
          object: {
            url: `chrome-extension://${chrome.runtime.id}/tab/html/index.html`,
          }
        });
        await chrome.runtime.sendMessage({
          type: "Tab.removeWindow",
          object: R.windowId
        });
      }
    }
  })();
}
