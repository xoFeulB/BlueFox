// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    let log = (...args) => {
      console.log("index.js", ...args);
    };
    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let dropHandler = async (tabid, files) => {
      try {
        let r = [];
        for (let f of files) {
          r.push({
            type: f.type,
            text: await f.text(),
          });
        }
        let connector = await chrome.tabs.connect(tabid);
        await connector.postMessage({
          type: "BlueFox.Dispatch",
          object: {
            files: r,
          },
        });
      } catch (err) {
        log(err);
      }
    };

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

    /* Display */ {
      let oDict = {
        "[Tabs]": async (e) => {
          let reloading = false;
          e.reload = async () => {
            let value = `${e.value}`;
            if(reloading){
              return;
            }
            reloading = true;
            e.textContent = "";
            let tabs = [
              {
                tab: null,
                url: "",
                title: "",
                id: "",
              },
              ...(await chrome.tabs.query({ url: "<all_urls>" })),
            ].filter((_) => {
              return [
                _.url != "",
                !_.url.includes("chrome://"),
                !_.url.includes("chrome-extension://"),
              ].every((__) => {
                return __;
              });
            });
            for (let tab of tabs) {
              let TabsTemplate = document.querySelector("#TabsTemplate").content.cloneNode(true);
              if (tab.favIconUrl) {
                TabsTemplate.querySelector("[favicon]").src = tab.favIconUrl;
              } else {
                TabsTemplate
                  .querySelector("div:has(>[favicon])")
                  .setAttribute("uk-icon", "icon: world; ratio: 2");
                  TabsTemplate.querySelector("[favicon]").remove();
              }

              TabsTemplate.querySelector("[title]").textContent = tab.title;
              TabsTemplate.querySelector("[URL]").textContent = tab.url;
              TabsTemplate.querySelector("[SwitchTab]").attributes.SwitchTab.value =
                tab.id;
                TabsTemplate
                .querySelector("[SwitchTab]")
                .addEventListener("click", async (event) => {
                  await chrome.tabs.update(
                    Number(event.target.attributes.SwitchTab.value),
                    { active: true }
                  );
                });

              let BlueFoxFileAttach = TabsTemplate.querySelector(
                "[BlueFoxFileAttach]"
              );

              BlueFoxFileAttach.tab = tab;
              BlueFoxFileAttach.attributes.BlueFoxFileAttach.value = tab.id;
              BlueFoxFileAttach.addEventListener("drop", async (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                await dropHandler(
                  BlueFoxFileAttach.tab.id,
                  event.dataTransfer.files
                );
              });
              BlueFoxFileAttach.addEventListener(
                "dragover",
                async (event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                }
              );
              TabsTemplate.querySelector("[Focus]").addEventListener("click", (event) => {
                window.open(
                  `./focus.html#${tab.id}`,
                  "_blank"
                );
              });
              e.appendChild(TabsTemplate);
            }
            reloading = false;
          };
          e.reload();

          chrome.tabs.onCreated.addListener(e.reload);
          chrome.tabs.onRemoved.addListener(e.reload);
          chrome.tabs.onDetached.addListener(e.reload);
          chrome.tabs.onAttached.addListener(e.reload);
          chrome.tabs.onUpdated.addListener(e.reload);
          chrome.tabs.onMoved.addListener(e.reload);
        },
        "[BlueFoxFileAttach]": async (e) => {
          let SelectTargetTab = document.querySelector("[SelectTargetTab]");
          e.addEventListener("drop", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            await dropHandler(
              SelectTargetTab.selectedOptions[0].tab.id,
              event.dataTransfer.files
            );
          });
          e.addEventListener("dragover", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          });
          e.querySelector("input").addEventListener("input", async (event) => {
            await dropHandler(
              SelectTargetTab.selectedOptions[0].tab.id,
              event.target.files
            );
            event.target.value = null;
          });
        },
        "#menuControll": async (e) => {
          let active = document.querySelector("active");
          let animate = async () => {
            let move_to_elm = document.querySelector(
              `[value="${e.value}"][setValueOnClick="#menuControll"]`
            );
            await anime({
              targets: active,
              scale: 0.3,
              duration: 500,
              easing: "easeInExpo",
            });
            await anime({
              targets: active,
              left: move_to_elm.getBoundingClientRect().left - 25,
              duration: 500,
              easing: "easeOutBounce",
            });
            await anime({
              targets: active,
              scale: 1,
              duration: 300,
              easing: "easeInExpo",
            });
          };
          e.addEventListener("change", (event) => {
            animate();
          });
          window.addEventListener("resize", (event) => {
            animate();
          });
        },
        "[showWhenSome]": async (e) => {
          let target = document.querySelector(
            e.attributes["showWhenSome"].value
          );

          target.addEventListener("change", async (event) => {
            let values = JSON.parse(
              e.attributes["showWhenSome-values"].value
            ).map((_) => {
              return `${_}`;
            });
            if (values.includes(`${target.value}`)) {
              e.style.opacity = 0;
              e.removeAttribute("hide");
              await anime({
                targets: e,
                opacity: 1,
                duration: 250,
                delay:200,
                easing: "linear",
              });
            } else {
              await anime({
                targets: e,
                opacity: 0,
                duration: 200,
                easing: "linear",
              });
              e.setAttribute("hide", "");
            }
          });
          target.dispatchEvent(new Event("change"));
        },
        "[showWhenNotEvery]": async (e) => {
          let target = document.querySelector(
            e.attributes["showWhenNotEvery"].value
          );

          target.addEventListener("change", async (event) => {
            let values = JSON.parse(
              e.attributes["showWhenNotEvery-values"].value
            ).map((_) => {
              return `${_}`;
            });
            if (!(values.includes(`${target.value}`))) {
              e.style.opacity = 0;
              e.removeAttribute("hide");
              await anime({
                targets: e,
                opacity: 1,
                duration: 250,
                delay:200,
                easing: "linear",
              });
            } else {
              await anime({
                targets: e,
                opacity: 0,
                duration: 200,
                easing: "linear",
              });
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
      };
      let queryWalker = new QueryWalker(oDict, document);
      await queryWalker.do();
    }
  })();
}