// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  window.log = console.log;
  window.assert = console.assert;
  window.getTabsInfo = chrome.tabs.query;
  window.sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
}