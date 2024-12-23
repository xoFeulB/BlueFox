import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";

window.AppReady = new Promise(async (resolve) => {
  Object.assign(
    window,
    {
      // defines
      values: {
        AppName: "^.,.^ BlueFox",
        Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise`,
        Version: `v${chrome.runtime.getManifest().version}`,
        BluefoxProtocol: "http",
        BluefoxServer: "localhost",
      },
      // util
      log: console.log,
      assert: console.assert,
      sleep: (msec) => new Promise((resolve) => setTimeout(resolve, msec)),
    }
  );
  BlueFoxJs.Sync.enableSyncViewElement();
  BlueFoxJs.Sync.view();
  resolve();
});

(async () => {
  let currentTab = await chrome.tabs.getCurrent();
  if ([
    "chrome://newtab/",
    "edge://newtab/",
  ].includes(currentTab.url)) {
    location.href = location.href;
  }
})();
