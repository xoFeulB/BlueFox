// © BlueFoxEnterprise
// https://github.com/xoFeulB

const value = async (values = {}, _scope_ = document) => {
  let set = {
    values: {},
    flesh: () => {
      Object.keys(set.values).forEach((key) => {
        set.values[`${key}`].set(set.values[key].value);
      });
    },
  };

  Object.keys(values).forEach((key) => {
    set.values[`${key}`] = {
      value: values[key],
      origin: values[key],
      set: (v) => {
        set.values[key].value = v;
        [..._scope_.querySelectorAll(`[setTextContent="${key}"]`)].forEach(
          (e) => {
            e.textContent = v;
          }
        );
        set.values[key].value = v;
        [..._scope_.querySelectorAll(`[setValue="${key}"]`)].forEach((e) => {
          e.value = v;
        });
      },
    };

    set.values[`${key}`].set(values[key]);
  });

  return set;
};

("use strict");
export const Values = await value({
  Title: `^.,.^ BlueFox`,
  Copyright: `© ${new Date().getFullYear()} BlueFoxEnterprise`,
  Version: `v${chrome.runtime.getManifest().version}`,
  BluefoxServer: "localhost.bluefox.ooo"
});
