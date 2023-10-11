// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  window.log = console.log;
  window.getTabsInfo = chrome.tabs.query;
  window.getProperty = (_path, _dict) => {
    let _key = _path.split(".")[0];
    let _next_path = _path.split(".").slice(1).join(".");
    if (_dict[_key] != undefined) {
      let R = window.getProperty(_next_path, _dict[_key]);
      if (R?.found) {
        return { object: _dict, property: _key };
      } else {
        return R;
      }
    } else {
      if (_path == _next_path) {
        return { found: true };
      } else {
        return { found: false };
      }
    }
  };
}
