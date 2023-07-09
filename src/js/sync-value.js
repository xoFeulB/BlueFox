{
  let values = {
    Title: `^.,.^ BlueFox`,
    Copyright: `© ${new Date().getFullYear()} BlueFox.Tech team`,
    Version: `v${chrome.runtime.getManifest().version}`,
    BluefoxOpenBetaServer: "api.bluefox.tech",
    BluefoxOpenBetaToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJCbHVlRm94T3BlbkJldGEiOiJCbHVlRm94T3BlbkJldGEifQ.FmEvhzj_ujU9nN1TnuzB3OMF1s-mF-hL3N0iim6cikg",
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
      setTextContent: (v) => {
        window.set.values[key].value = v;
        [...document.querySelectorAll(`[setTextContent="${key}"]`)].forEach(e => {
          e.textContent = v;
        });
      },
      setValue: (v) => {
        window.set.values[key].value = v;
        [...document.querySelectorAll(`[setValue="${key}"]`)].forEach(e => {
          e.value = v;
        });
      },
    };

    window.set.values[`${key}`].setTextContent(values[key]);
    window.set.values[`${key}`].setValue(values[key]);
  });
}
