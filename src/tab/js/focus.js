// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    let log = (...args) => {
      console.log("focus.js", ...args);
    };

    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
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
      let TabInfo = {
        reload: async () => {
          Object.assign(
            TabInfo,
            await (async () => {
              let tabInfo = [
                ...(await chrome.tabs.query({ url: "<all_urls>" })),
              ].filter((_) => {
                return Number(window.location.hash.substring(1)) == _.id;
              });
              return tabInfo[0];
            })()
          );
          TabInfo.DOM = document.querySelector("#TabInfo");
          TabInfo.DOM.TabInfo = TabInfo;
          TabInfo.DOM.dispatchEvent(new Event("sync"));
          Object.keys(TabInfo).forEach((key) => {
            [...document.querySelectorAll(`[TabInfo="${key}"]`)].forEach(
              (_) => {
                _.textContent = TabInfo[key];
              }
            );
          });
          if (!TabInfo.favIconUrl) {
            document
              .querySelector(
                `div:has(>img[sync-from-property="TabInfo.favIconUrl"])`
              )
              .setAttribute("uk-icon", "icon: world; ratio: 2");
            document
              .querySelector(`img[sync-from-property="TabInfo.favIconUrl"]`)
              ?.remove();
          }
        },
      };
      await TabInfo.reload();
      chrome.tabs.onUpdated.addListener(TabInfo.reload);

      let connector;
      let reloadConnector = async () => {
        connector = await chrome.tabs.connect(TabInfo.id);
        connector.onMessage.addListener((message) => {
          try {
            MessageHandler[message.type](message);
          } catch {
            log("failed", message);
          }
        });
      };
      await reloadConnector();
      
      let dropHandler = async (tabid, files) => {
        try {
          await reloadConnector();
          let r = [];
          for (let f of files) {
            r.push({
              type: f.type,
              text: await f.text(),
            });
          }
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

      let MessageHandler = {
        "BlueFox.GetEventListners": (message) => {
          document.querySelector("[EventListners]").textContent =
            message.object.length;
        },
        "BlueFox.CapturEvents": (message) => {
          document.querySelector("[HowManyCapturingEvents]").textContent =
            message.object.length;
        },
      };



      let oDict = {
        "[TabToWindow]": async (e) => {
          e.addEventListener("click", async () => {
            await chrome.windows.create({
              tabId: TabInfo.id,
            });
          });
        },
        "[CaptureWindow]": async (e) => {
          MessageHandler["BlueFox.CaptureWindow"] = (message) => {
            if (message.object) {
              document.querySelector(
                "[CapturePreview]"
              ).src = `data:image/png;base64, ${message.object}`;
              document
                .querySelector("[CapturePreview]")
                .dispatchEvent(new Event("sync"));
            }
          };
          e.addEventListener("click", async () => {
            await reloadConnector();
            await connector.postMessage({
              type: "BlueFox.CaptureWindow",
              object: {
                format: "png",
                captureBeyondViewport: true,
              },
            });
          });
        },
        "[ReloadTab]": async (e) => {
          e.addEventListener("click", async () => {
            chrome.tabs.reload(TabInfo.id);
          });
        },
        "[BlueFoxFileAttach]": async (e) => {
          let SelectTargetTab = document.querySelector("[SelectTargetTab]");
          e.addEventListener("drop", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            await dropHandler(TabInfo.id, event.dataTransfer.files);
          });
          e.addEventListener("dragover", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          });
          e.querySelector("input").addEventListener("input", async (event) => {
            await dropHandler(TabInfo.id, event.target.files);
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
                delay: 200,
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
            if (!values.includes(`${target.value}`)) {
              e.style.opacity = 0;
              e.removeAttribute("hide");
              await anime({
                targets: e,
                opacity: 1,
                duration: 250,
                delay: 200,
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

      {
        await sleep(1000);
        await connector.postMessage({
          type: "BlueFox.GetEventListners",
          object: {},
        });
      }
    }
  })();
}
