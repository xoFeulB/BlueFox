{
  let values = {
    Title: `^.,.^ BlueFox`,
    Copyright: `© ${new Date().getFullYear()} BlueFox.Tech team`,
    Version: `v${chrome.runtime.getManifest().version}`,
  };
  window.set = {
    values: {},
    flesh: () => {
      Object.keys(window.set.values).forEach((key) => {
        window.set.values[`${key}`].set(window.set.values[key].value);
      });
    }
  };

  Object.keys(values).forEach((key) => {
    window.set.values[`${key}`] = {
      value: values[key],
      origin: values[key],
      set: (v) => {
        window.set.values[key].value = v;
        [...document.querySelectorAll(`[set="${key}"]`)].forEach(e => {
          e.textContent = v;
        });
      },
    };

    window.set.values[`${key}`].set(values[key]);
  });
}
