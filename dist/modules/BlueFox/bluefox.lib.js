// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  window.log = console.log;
  window.assert = console.assert;
  window.sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
}