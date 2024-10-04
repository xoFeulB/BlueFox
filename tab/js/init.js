(async () => {
  {
    let currentTab = await chrome.tabs.getCurrent();
    if ([
      "chrome://newtab/",
      "edge://newtab/",
    ].includes(currentTab.url)) {
      location.href = location.href;
    }
  }
})();