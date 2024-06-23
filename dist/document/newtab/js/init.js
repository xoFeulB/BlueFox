(async () => {
  {
    let currentTab = await chrome.tabs.getCurrent();
    if ("chrome://newtab/" == currentTab.url) {
      location.href = location.href;
    }
  }
})();
window.AppReady = new Promise((resolve) => {
  resolve();
});
