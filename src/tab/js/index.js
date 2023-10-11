// © BlueFoxEnterprise
// https://github.com/xoFeulB

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

    /* Display */ {
      let oDict = {
        "[Tabs]": async (e) => {
          let reloading = false;
          e.reload = async () => {
            let value = `${e.value}`;
            if (reloading) {
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
                !_.url.includes("edge://"),
                !_.url.includes("extension://"),
                !_.url.includes("chrome://"),
                !_.url.includes("chrome-extension://"),
              ].every((__) => {
                return __;
              });
            });
            for (let tab of tabs) {
              let TabsTemplate = document
                .querySelector("#TabsTemplate")
                .content.cloneNode(true);
              if (tab.favIconUrl) {
                TabsTemplate.querySelector("[favicon]").src = tab.favIconUrl;
              } else {
                TabsTemplate.querySelector("div:has(>[favicon])").setAttribute(
                  "uk-icon",
                  "icon: world; ratio: 2"
                );
                TabsTemplate.querySelector("[favicon]").remove();
              }

              TabsTemplate.querySelector("[title]").textContent = tab.title;
              TabsTemplate.querySelector("[URL]").textContent = tab.url;
              TabsTemplate.querySelector(
                "[SwitchTab]"
              ).attributes.SwitchTab.value = tab.id;
              TabsTemplate.querySelector("[SwitchTab]").addEventListener(
                "click",
                async (event) => {
                  await chrome.tabs.update(
                    Number(event.target.attributes.SwitchTab.value),
                    { active: true }
                  );
                }
              );
              TabsTemplate.querySelector("[Focus]").addEventListener(
                "click",
                (event) => {
                  window.open(`./focus.html#${tab.id}`, "_blank");
                }
              );
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
        "textarea[v0-in]": async (e) => {
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

            document.querySelector("textarea[v0-out]").value = JSON.stringify(
              {
                meta: {
                  version: 0,
                },
                sleep: 0,
                dispatchEvents: ["change"],
                actions: J,
              },
              null,
              4
            );
          });
        },
        "textarea[v1-in]": async (e) => {
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

            document.querySelector("textarea[v1-out]").value = JSON.stringify(
              {
                meta: {
                  version: 0,
                },
                sleep: 0,
                dispatchEvents: ["change"],
                actions: J,
              },
              null,
              4
            );
          });
        },
        "button[RunScript]": async (e) => {
          let ServerScript = document.querySelector("[ServerScript]");
          e.addEventListener("click", async (event) => {
            await sendMessage({
              type: "Debugger.attach",
            });
            await sendMessage({
              type: "Runtime.evaluate",
              object: {
                expression: ServerScript.value,
                objectGroup: "BlueFox-js-lanch",
              },
            });
          });
        },
        "[OpenServerTab]": async (e) => {
          e.addEventListener("click", async (event) => {
            window.open("./server.html", "_blank");
          });
        },
        "[TestConnection]": async (e) => {
          e.addEventListener("click", async (event) => {
            let server = document.querySelector("#BlueFoxServer").value;
            if (server) {
              try {
                let r = await fetch(`https://${server}/TestConnection.post`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                });

                if ((r.status = 200)) {
                  UIkit.notification({
                    message: "Connection Success",
                    status: "success",
                  });
                } else {
                  UIkit.notification({
                    message: "Connection Failed",
                    status: "warning",
                  });
                }
              } catch {
                UIkit.notification({
                  message: "Server not found",
                  status: "danger",
                });
              }
            }
          });
        },
      };
      let queryWalker = new QueryWalker(oDict, document);
      await queryWalker.do();
    }
  })();
}
