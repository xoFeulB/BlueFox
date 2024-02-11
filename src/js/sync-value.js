// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";

(async () => {
  window.values = {
    Title: `^.,.^ BlueFox`,
    Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise`,
    Version: `v${chrome.runtime.getManifest().version}`,
    BluefoxProtocol: "http",
    BluefoxServer: "local.api.bluefox",
    BluefoxToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJCbHVlRm94T3BlbkJldGEiOiJCbHVlRm94T3BlbkJldGEifQ.FmEvhzj_ujU9nN1TnuzB3OMF1s-mF-hL3N0iim6cikg",
  };
  await BlueFoxJs.Sync.value(window.values);
})();
