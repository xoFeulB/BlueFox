Object.assign(
  window,
  {
    values: {
      AppName: "^.,.^ BlueFox",
      Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise, inc.`,
      Version: `v${chrome.runtime.getManifest().version}`,
    }
  }
);