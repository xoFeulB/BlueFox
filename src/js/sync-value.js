// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";

(async () => {
  let values = {
    Title: `^.,.^ BlueFox`,
    Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise`,
    Version: `v${chrome.runtime.getManifest().version}`,
    BluefoxOpenBetaServer: "local.api.bluefox",
    BluefoxOpenBetaToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJCbHVlRm94T3BlbkJldGEiOiJCbHVlRm94T3BlbkJldGEifQ.FmEvhzj_ujU9nN1TnuzB3OMF1s-mF-hL3N0iim6cikg",
  };
  await BlueFoxJs.Sync.value(values);
})();
