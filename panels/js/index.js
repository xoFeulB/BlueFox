// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    let log = console.log;
    let browser = chrome ? chrome : browser;
    let sendMessage = async (arg) => {
      try {
        return await browser.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      log(message);
    });

    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

    let getProperty = (_path, _dict) => {
      let _key = _path.split(".")[0];
      let _next_path = _path.split(".").slice(1).join(".");
      if (_dict[_key] != undefined) {
        let R = getProperty(_next_path, _dict[_key]);
        if (R?.found) {
          return { object: _dict, property: _key };
        } else {
          return R;
        }
      } else {
        if (_path == _next_path) {
          return { found: true };
        } else {
          return { found: false };
        }
      }
    };

    let values = {
      Copyright: `© ${new Date().getFullYear()} LobeliaSecurity™`,
      Version: `v${chrome.runtime.getManifest().version}`,
    };

    let oDict = {
      "[set]": async (e) => {
        e.textContent = values[e.attributes.set.value];
      },
      "#menuControll": async (e) => {
        let active = document.querySelector("[menu] > [list] > active");
        let animate = () => {
          let move_to = document
            .querySelector(
              `[value="${e.value}"][setValueOnClick="#menuControll"]`
            )
            .getBoundingClientRect().top;
          anime({
            targets: active,
            top: move_to,
            width: [0, 5],
            duration: 500,
            easing: "easeOutElastic",
          });
        };
        e.addEventListener("change", (event) => {
          animate();
        });
      },
      "[showWhenSome]": async (e) => {
        let target = document.querySelector(e.attributes["showWhenSome"].value);
        let values = JSON.parse(e.attributes["showWhenSome-values"].value).map(
          (_) => {
            return `${_}`;
          }
        );

        target.addEventListener("change", (event) => {
          if (values.includes(`${target.value}`)) {
            e.removeAttribute("hide");
          } else {
            e.setAttribute("hide", "");
          }
        });
        target.dispatchEvent(new Event("change"));
      },
      "[setValueOnClick]": async (e) => {
        let target = document.querySelector(
          e.attributes["setValueOnClick"].value
        );
        e.addEventListener("click", (event) => {
          target.value = e.attributes.value.value;
          target.attributes.value.value = e.attributes.value.value;
          target.dispatchEvent(new Event("change"));
        });
      },
      "[tabs]": async (e) => {
        let nowReloading = false;
        e.reload = async () => {
          if (nowReloading) {
            return;
          }
          nowReloading = true;

          anime({
            targets: document.querySelector("[progress]"),
            width: 0,
            duration: 200,
            easing: "linear",
          });
          anime({
            targets: e,
            opacity: 0,
            duration: 200,
            easing: "linear",
            complete: async (anim) => {
              e.textContent = "";
              document.querySelector("[progress]").style.width = "0%";
              let tabs = await browser.tabs.query({ url: "<all_urls>" });
              for (let tab of tabs) {
                let clone = document
                  .querySelector("template#tabs_template")
                  .content.cloneNode(true);

                if (tab.favIconUrl) {
                  clone.querySelector("[favicon]").src = tab.favIconUrl;
                } else {
                  clone
                    .querySelector("div:has(>[favicon])")
                    .setAttribute("uk-icon", "icon: world; ratio: 2");
                  clone.querySelector("[favicon]").remove();
                }

                clone.querySelector("[title]").textContent = tab.title;
                clone.querySelector("[URL]").textContent = tab.url;
                clone.querySelector("[SwitchTab]").attributes.SwitchTab.value =
                  tab.id;
                clone
                  .querySelector("[SwitchTab]")
                  .addEventListener("click", async (event) => {
                    await browser.tabs.update(
                      Number(event.target.attributes.SwitchTab.value),
                      { active: true }
                    );
                  });
                clone.querySelector(
                  "[BlueFoxFileAttach]"
                ).attributes.BlueFoxFileAttach.value = tab.id;

                e.appendChild(clone);

                anime({
                  targets: document.querySelector("[progress]"),
                  width: `${(e.childElementCount / tabs.length) * 100}%`,
                  duration: 500,
                  easing: "easeOutBounce",
                });
              }
              anime({
                targets: e,
                opacity: 1,
                duration: 200,
                easing: "linear",
                complete: async (anim) => {
                  nowReloading = false;
                },
              });
            },
          });
        };
        e.reload();

        chrome.tabs.onCreated.addListener(e.reload);
        chrome.tabs.onRemoved.addListener(e.reload);
        chrome.tabs.onDetached.addListener(e.reload);
        chrome.tabs.onAttached.addListener(e.reload);
        chrome.tabs.onUpdated.addListener(e.reload);
        chrome.tabs.onMoved.addListener(e.reload);
      },
      "[tabInfo]": async (e) => {},
    };

    let queryWalker = new QueryWalker(oDict, document);
    await queryWalker.do();
  })();
}
