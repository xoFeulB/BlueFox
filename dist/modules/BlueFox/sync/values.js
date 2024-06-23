Object.assign(
  window,
  {
    values: {
      AppName: "^.,.^ BlueFox",
      Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise, Inc.`,
      Version: `v${chrome.runtime.getManifest().version}`,
    }
  }
);