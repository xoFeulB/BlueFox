// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";

("use strict");
export const Values = await BlueFoxJs.Sync.value({
  Title: `^.,.^ BlueFox`,
  Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise`,
  Version: `v${chrome.runtime.getManifest().version}`,
  BluefoxServer: "localhost.bluefox.ooo"
});
