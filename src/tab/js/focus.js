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
              ?.setAttribute("uk-icon", "icon: world; ratio: 2");
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
            if (Object.keys(MessageHandler).includes(message.type)) {
              MessageHandler[message.type](message);
            }
          } catch {
            log("failed", message);
          }
        });
      };
      await reloadConnector();

      let dropHandler = async (files) => {
        let updateHistory = async (files) => {
          document.querySelector("[RecentlyAttached]").textContent = "";
          if (files.length == 0) {
            return;
          }
          files.forEach((_) => {
            let li = document.createElement("li");
            let div = document.createElement("div");
            div.className = "uk-button uk-button-text";
            div.textContent = _.name;
            div.file = _;
            li.appendChild(div);
            document.querySelector("[RecentlyAttached]").appendChild(li);
            div.addEventListener("click", async (event) => {
              await reloadConnector();
              await connector.postMessage({
                type: "BlueFox.Dispatch",
                object: {
                  files: [event.target.file],
                },
              });
            });
            if (_.type == "application/json") {
              let J = JSON.parse(_.text);
              let AttachedTailTemplate = document
                .querySelector("#AttachedTailTemplate")
                .content.cloneNode(true);
              AttachedTailTemplate.querySelector("[Title]").textContent =
                J.meta.title;
              AttachedTailTemplate.querySelector("[Title]").file = _;
              AttachedTailTemplate.querySelector(
                "[Version]"
              ).textContent = `v.${J.meta.version}`;
              AttachedTailTemplate.querySelector(
                "[ActionsLength]"
              ).textContent = `${J.actions.length} Actions`;
              AttachedTailTemplate.querySelector(
                "[DateTime]"
              ).textContent = `${new Date().toString()}`;
              AttachedTailTemplate.querySelector(
                "[Description]"
              ).textContent = `${J.meta?.description}`;
              document
                .querySelector("[AttachedTails]")
                .prepend(AttachedTailTemplate);
              document
                .querySelector("[AttachedTails]")
                .children[0].querySelector("[Title]")
                .addEventListener("click", async (event) => {
                  await reloadConnector();
                  await connector.postMessage({
                    type: "BlueFox.Dispatch",
                    object: {
                      files: [event.target.file],
                    },
                  });
                });
            }
          });
        };
        try {
          let r = [];
          for (let f of files) {
            r.push({
              name: f.name,
              type: f.type,
              text: await f.text(),
            });
          }
          await reloadConnector();
          await connector.postMessage({
            type: "BlueFox.Dispatch",
            object: {
              files: r,
            },
          });
          updateHistory(
            r.filter((_) => {
              return ["application/json", "text/javascript"].includes(_.type);
            })
          );
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
        "BlueFox.CapturEvents": (message) => {
          document.querySelector("[HowManyCapturingEvents]").textContent =
            message.object.length;
        },
        "BlueFox.GetSelectors": (message) => {
          if (message.object) {
            let SelectorsList = document.querySelector("[SelectorsList]");
            SelectorsList.textContent = "";
            message.object.forEach((_) => {
              let li = document.createElement("li");
              let div = Object.assign(document.createElement("div"), {
                className: "uk-flex",
              });
              let Key = Object.assign(document.createElement("input"), {
                type: "text",
                className: "uk-input uk-width-1-3 uk-margin-small-right",
                placeholder: "Key",
                value: "",
              });
              let Selector = Object.assign(document.createElement("input"), {
                type: "text",
                className: "uk-input uk-width-1-3",
                placeholder: "Selector",
                value: _,
              });
              div.appendChild(Key);
              div.appendChild(Selector);
              li.appendChild(div);
              SelectorsList.appendChild(li);
            });
          }
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
          e.addEventListener("drop", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            await dropHandler(event.dataTransfer.files);
          });
          e.addEventListener("dragover", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          });
          e.querySelector("input").addEventListener("input", async (event) => {
            await dropHandler(event.target.files);
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
        "#QuerySelector": async (e) => {
          e.addEventListener("keypress", async (event) => {
            if (event.keyCode === 13) {
              e.blur();
              document.querySelector("[GetSelectors]").click();
            }
          });
        },
        "[GetSelectors]": async (e) => {
          e.addEventListener("click", async (event) => {
            let selector = document.querySelector("#QuerySelector").value;
            if (selector) {
              let SelectorsList = document.querySelector("[SelectorsList]");
              SelectorsList.textContent = "";
              let div = document.createElement("div");
              div.setAttribute("uk-spinner", "");
              div.className = "uk-text-center";
              SelectorsList.appendChild(div);
              await connector.postMessage({
                type: "BlueFox.GetSelectors",
                object: {
                  selector: selector,
                },
              });
            }
          });
        },
        "[SelectorDownloadJSON]": async (e) => {
          e.addEventListener("click", async (event) => {
            let R = [];
            let SelectorsList = document.querySelector("[SelectorsList]");
            [...SelectorsList.querySelectorAll("li")].forEach((_) => {
              R.push({
                key: _.querySelector(`[placeholder="Key"]`).value,
                selector: _.querySelector(`[placeholder="Selector"]`).value,
              });
            });

            Object.assign(document.createElement("a"), {
              href: window.URL.createObjectURL(
                new Blob([JSON.stringify(R)], { type: "application/json" })
              ),
              download: `${
                document.querySelector("#QuerySelector").value
              }.json`,
            }).click();
          });
        },
        "[SelectorDownloadCSV]": async (e) => {
          e.addEventListener("click", async (event) => {
            let R = ["Key\tSelector"];
            let SelectorsList = document.querySelector("[SelectorsList]");
            [...SelectorsList.querySelectorAll("li")].forEach((_) => {
              R.push(
                [
                  _.querySelector(`[placeholder="Key"]`).value,
                  _.querySelector(`[placeholder="Selector"]`).value,
                ].join("\t")
              );
            });

            Object.assign(document.createElement("a"), {
              href: window.URL.createObjectURL(
                new Blob([R.join("\n")], { type: "text/csv" })
              ),
              download: `${document.querySelector("#QuerySelector").value}.csv`,
            }).click();
          });
        },
      };
      let queryWalker = new QueryWalker(oDict, document);
      await queryWalker.do();

      {
        await sleep(1000);
        let GetEventListners = async () => {
          await reloadConnector();
          await connector.postMessage({
            type: "BlueFox.GetEventListners",
            object: {},
          });
        };
        await GetEventListners();
        setInterval(async () => {
          await GetEventListners();
        }, 5000);
      }
    }
  })();
}
