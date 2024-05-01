Object.assign(
  window,
  {
    values: {
      AppName: "^.,.^ BlueFoxWorkspace",
      Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise, inc.`,
      Version: `v${chrome.runtime.getManifest().version}`,
    }
  }
);