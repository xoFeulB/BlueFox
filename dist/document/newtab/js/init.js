window.AppReady = new Promise(async (resolve) => {
  let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
  await sleep(1000);
  resolve();
});

(async () => {
  {
    let currentTab = await chrome.tabs.getCurrent();
    if ("chrome://newtab/" == currentTab.url) {
      location.href = location.href;
    }
  }
})();
