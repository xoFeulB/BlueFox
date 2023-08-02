{
  window.log = (...args) => {
    console.log(...args);
  };
  window.getTabsInfo = chrome.tabs.query;
}
