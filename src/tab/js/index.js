// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    let log = console.log;
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
      let values = {
        Copyright: `© ${new Date().getFullYear()} BlueFox by Void Ark, inc.`,
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
              await anime({
                targets: e,
                opacity: 1,
                duration: 200,
                easing: "linear",
              });
              e.removeAttribute("hide");
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
        "[automaion-tabs]": async (e) => {
          let nowReloading = false;
          e.reload = async () => {
            if (nowReloading) {
              return;
            }
            nowReloading = true;

            /* flush */ {
              anime({
                targets: document.querySelector("[progress]"),
                width: 0,
                duration: 200,
                easing: "linear",
              });
              await anime({
                targets: e,
                opacity: 0,
                duration: 200,
                easing: "linear",
              });
              e.textContent = "";
            }

            /* create tab info  */ {
              let tabs = [
                ...(await chrome.tabs.query({ url: "<all_urls>" })),
              ].filter((_) => {
                return [
                  !_.url.includes("chrome://"),
                  !_.url.includes("chrome-extension://"),
                ].every(__ => {return __});
              });
              for (let tab of tabs) {
                let clone = document
                  .querySelector("template#automation_tabs_template")
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
                clone.querySelector("[SwitchTab]").attributes.SwitchTab.value = tab.id;
                clone
                  .querySelector("[SwitchTab]")
                  .addEventListener("click", async (event) => {
                    await chrome.tabs.update(
                      Number(event.target.attributes.SwitchTab.value),
                      { active: true }
                    );
                  });

                clone.querySelector("[Focus]").href = `./focus.html#${tab.id}`;

                let BlueFoxFileAttach = clone.querySelector(
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


                let queryWalker = new QueryWalker({"[setValueOnClick]":oDict["[setValueOnClick]"]}, clone);
                await queryWalker.do();

                e.appendChild(clone);

                anime({
                  targets: document.querySelector("[progress]"),
                  width: `${(e.childElementCount / tabs.length) * 100}%`,
                  duration: 500,
                  easing: "easeOutBounce",
                });
              }
            }

            await anime({
              targets: e,
              opacity: 1,
              duration: 200,
              easing: "linear",
            });
            nowReloading = false;
          };
          e.reload();

          chrome.tabs.onCreated.addListener(e.reload);
          chrome.tabs.onRemoved.addListener(e.reload);
          chrome.tabs.onDetached.addListener(e.reload);
          chrome.tabs.onAttached.addListener(e.reload);
          chrome.tabs.onUpdated.addListener(e.reload);
          chrome.tabs.onMoved.addListener(e.reload);
        },
        "[scanner-tabs]": async (e) => {
          let nowReloading = false;
          e.reload = async () => {
            if (nowReloading) {
              return;
            }
            nowReloading = true;

            /* flush */ {
              await anime({
                targets: e,
                opacity: 0,
                duration: 200,
                easing: "linear",
              });
              e.textContent = "";
            }

            /* create tab info  */ {
              let tabs = await chrome.tabs.query({ url: "<all_urls>" });
              for (let tab of tabs) {
                let clone = document
                  .querySelector("template#scanner_tabs_template")
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
                    await chrome.tabs.update(
                      Number(event.target.attributes.SwitchTab.value),
                      { active: true }
                    );
                  });

                let scanNowNieAgresywny = clone.querySelector(
                  "[ScanNow-NieAgresywny]"
                );
                scanNowNieAgresywny.tab = tab;
                scanNowNieAgresywny.attributes["ScanNow-NieAgresywny"].value =
                  tab.id;
                scanNowNieAgresywny.addEventListener("click", async (event) => {
                  let connector = await chrome.tabs.connect(
                    scanNowNieAgresywny.tab.id
                  );
                  await connector.postMessage({
                    type: "BlueFox.Scan.NieAgresywny",
                    object: {},
                  });
                });

                e.appendChild(clone);
              }
            }

            await anime({
              targets: e,
              opacity: 1,
              duration: 200,
              easing: "linear",
            });
            nowReloading = false;
          };
          e.reload();

          chrome.tabs.onCreated.addListener(e.reload);
          chrome.tabs.onRemoved.addListener(e.reload);
          chrome.tabs.onDetached.addListener(e.reload);
          chrome.tabs.onAttached.addListener(e.reload);
          chrome.tabs.onUpdated.addListener(e.reload);
          chrome.tabs.onMoved.addListener(e.reload);
        },
        "[switchLightMode]": async (e) => {
          let html = document.querySelector("html");
          e.addEventListener("click", (event) => {
            if (html.style.filter == "invert(1)") {
              anime({
                targets: e,
                duration: 1000,
                easing: "linear",
                update: (anim) => {
                  html.style.filter = `invert(${1 - anim.progress / 100})`;
                },
              });
            }
          });
        },
        "[switchDarkMode]": async (e) => {
          let html = document.querySelector("html");
          e.addEventListener("click", (event) => {
            if (html.style.filter == "invert(0)") {
              anime({
                targets: e,
                duration: 1000,
                easing: "linear",
                update: (anim) => {
                  html.style.filter = `invert(${anim.progress / 100})`;
                },
              });
            }
          });
        },
        "textarea[in]": async (e) => {
          e.addEventListener("input", (event) => {
            let R = [];
            let lines = e.value
              .split("\n")
              .filter((_) => {
                return _ != "";
              })
              .map((_) => {
                return _.split("\t");
              });
            for (let line of lines.slice(1)) {
              let r = {};
              for (let i in lines[0]) {
                r[lines[0][i]] = line[i].replaceAll("\\n", "\n");
              }
              if (r.type) {
                R.push(r);
              }
            }

            let J = R.map((_) => {
              _.value =
                {
                  null: null,
                  true: true,
                  false: false,
                }[_.value.toLowerCase()] ?? _.value;
              let j = {
                type: _.type,
                target: _.target,
              };

              if (_.type == "event") {
                j.dispatchEvent = _.value;
              } else if (_.type == "sleep") {
                j.target = Number(_.value);
              } else if (_.type == "capture") {
                j.fileName = _.value;
              } else if (_.type == "save") {
                j.fileName = _.value;
              } else if (_.objectPath) {
                let objectPath = _.objectPath.split(".");
                j[objectPath[0]] = {};
                j[objectPath[0]][
                  objectPath[1].join ? objectPath[1].join(".") : objectPath[1]
                ] = _.value;
              }
              return j;
            });

            document.querySelector("textarea[out]").value = JSON.stringify({
              version: 0,
              sleep: 0,
              dispatchEvents: ["change"],
              actions: J,
            });
          });
        },
        "[bookmarks]": async (e) => {
          chrome.bookmarks.getTree((bookmarks) => {
            bookmarks[0].children[0].children.forEach((_) => {
              let card = document
                .querySelector("#dashboard_tabs_bookmarks")
                .content.cloneNode(true);

              card.querySelector("[title]").textContent = _.title;
              card.querySelector("[url]").textContent = new URL(_.url).host;
              card.querySelector("[open_in_new_tab]").href = _.url;
              card.querySelector("[favicon]").src = `${
                new URL(_.url).origin
              }/favicon.ico`;
              card
                .querySelector("[favicon]")
                .addEventListener("error", (event) => {
                  event.target.closest("div").setAttribute(
                    "uk-icon",
                    "icon: world; ratio: 1"
                  );
                  event.target.remove();
                });

              e.appendChild(card);
            });
          });
        },
        };
      let queryWalker = new QueryWalker(oDict, document);
      await queryWalker.do();
    }


  })();
}
