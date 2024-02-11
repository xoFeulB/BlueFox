// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  window.log = console.log;
  window.getTabsInfo = chrome.tabs.query;
  window.sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
}
