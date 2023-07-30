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

      let connector = new window.Connector();
      await connector.load(TabInfo.id);

      let scenarioHandler = async (scenarios) => {
        for (let scenario of scenarios) {
          let json_parsed = JSON.parse(scenario.text);
          for (let tail of json_parsed.tails) {
            if (tail.when) {
              for (let key of Object.keys(tail.when)) {
                let message = await connector.post({
                  type: "BlueFox.GetElementProperties",
                  object: {
                    selector: key,
                  },
                });
                if (
                  [...Object.keys(tail.when[key])].every((_) => {
                    let property = getProperty(_, message.object);
                    if (property.object) {
                      try {
                        let regex = new RegExp(tail.when[key][_], "g");
                        return regex.test(property.object[property.property]);
                      } catch {
                        return false;
                      }
                    }
                    return false;
                  })
                ) {
                  await connector.post({
                    type: "BlueFox.Dispatch.Action",
                    object: JSON.stringify(tail.tail),
                  });
                  await sleep(tail.sleep);
                }
              }
            } else {
              await connector.post({
                type: "BlueFox.Dispatch.Action",
                object: JSON.stringify(tail.tail),
              });
              await sleep(tail.sleep);
            }
          }
        }
      };

      let dropHandler = async (files) => {
        document.querySelector("[RecentlyAttached]").textContent = "";

        try {
          let actions = [];
          let scenarios = [];
          let scripts = [];

          for (let f of files) {
            try {
              await {
                "application/json": async () => {
                  let json_parsed = JSON.parse(await f.text());
                  if (json_parsed.actions) {
                    actions.push({
                      name: f.name,
                      type: f.type,
                      text: await f.text(),
                    });
                  }
                  if (json_parsed.tails) {
                    scenarios.push({
                      name: f.name,
                      type: f.type,
                      text: await f.text(),
                    });
                  }
                },
                "text/javascript": async () => {
                  scripts.push({
                    name: f.name,
                    type: f.type,
                    text: await f.text(),
                  });
                },
              }[f.type]();
            } catch {}
          }

          for (let action of actions) {
            await connector.post({
              type: "BlueFox.Dispatch.Action",
              object: action.text,
            });
            let _ = JSON.parse(action.text);
            let li = document.createElement("li");
            let div = document.createElement("div");
            div.className = "uk-button uk-button-text";
            div.textContent = action.name;
            div.action = action;
            li.appendChild(div);
            document.querySelector("[RecentlyAttached]").appendChild(li);
            div.addEventListener("click", async (event) => {
              await connector.post({
                type: "BlueFox.Dispatch.Action",
                object: event.target.action.text,
              });
            });
            let AttachedTailTemplate = document
              .querySelector("#AttachedTailTemplate")
              .content.cloneNode(true);
            AttachedTailTemplate.querySelector("[Title]").textContent =
              _.meta.title;
            AttachedTailTemplate.querySelector("[Title]").action = action;
            AttachedTailTemplate.querySelector(
              "[Version]"
            ).textContent = `v.${_.meta.version}`;
            AttachedTailTemplate.querySelector(
              "[ActionsLength]"
            ).textContent = `${_.actions.length} Actions`;
            AttachedTailTemplate.querySelector(
              "[DateTime]"
            ).textContent = `${new Date().toString()}`;
            AttachedTailTemplate.querySelector(
              "[Description]"
            ).textContent = `${_.meta?.description}`;
            document
              .querySelector("[AttachedTails]")
              .prepend(AttachedTailTemplate);
            document
              .querySelector("[AttachedTails]")
              .children[0].querySelector("[Title]")
              .addEventListener("click", async (event) => {
                await connector.post({
                  type: "BlueFox.Dispatch.Action",
                  object: event.target.action.text,
                });
              });
          }
          for (let script of scripts) {
            await connector.post({
              type: "BlueFox.Dispatch.Script",
              object: script.text,
            });
            let li = document.createElement("li");
            let div = document.createElement("div");
            div.className = "uk-button uk-button-text";
            div.textContent = script.name;
            div.script = script;
            li.appendChild(div);
            document.querySelector("[RecentlyAttached]").appendChild(li);
            div.addEventListener("click", async (event) => {
              await connector.post({
                type: "BlueFox.Dispatch.Script",
                object: event.target.script.text,
              });
            });
          }
          await scenarioHandler(scenarios);
          for (let scenario of scenarios) {
            {
              let li = document.createElement("li");
              let div = document.createElement("div");
              div.className = "uk-button uk-button-text";
              div.textContent = scenario.name;
              div.scenario = scenario;
              li.appendChild(div);
              document.querySelector("[RecentlyAttached]").appendChild(li);
              div.addEventListener("click", async (event) => {
                await scenarioHandler([event.target.scenario]);
              });
              li = document.createElement("li");
              div = document.createElement("div");
              div.className = "uk-button uk-button-text";
              div.textContent = scenario.name;
              div.scenario = scenario;
              li.appendChild(div);
              document
                .querySelector("[RecentlyAttachedScenarios]")
                .appendChild(li);
              div.addEventListener("click", async (event) => {
                await scenarioHandler([event.target.scenario]);
              });
            }
            let _ = JSON.parse(scenario.text);
            let AttachedTailTemplate = document
              .querySelector("#AttachedTailTemplate")
              .content.cloneNode(true);
            AttachedTailTemplate.querySelector("[Title]").textContent =
              _.meta.title;
            AttachedTailTemplate.querySelector("[Title]").file = _;
            AttachedTailTemplate.querySelector(
              "[Version]"
            ).textContent = `v.${_.meta.version}`;
            AttachedTailTemplate.querySelector(
              "[ActionsLength]"
            ).textContent = `${_.tails.length} Tails`;
            AttachedTailTemplate.querySelector(
              "[DateTime]"
            ).textContent = `${new Date().toString()}`;
            AttachedTailTemplate.querySelector(
              "[Description]"
            ).textContent = `${_.meta?.description}`;
            document
              .querySelector("[AttachedScenarios]")
              .prepend(AttachedTailTemplate);
            document
              .querySelector("[AttachedScenarios]")
              .children[0].querySelector("[Title]")
              .addEventListener("click", async (event) => {
                await scenarioHandler([scenario]);
              });
          }
        } catch (err) {
          log(err);
        }
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
          e.addEventListener("click", async () => {
            let message = await connector.post({
              type: "BlueFox.CaptureWindow",
              object: {
                format: "png",
                captureBeyondViewport: true,
              },
            });
            if (message.object) {
              document.querySelector(
                "[CapturePreview]"
              ).src = `data:image/png;base64, ${message.object}`;
              document
                .querySelector("[CapturePreview]")
                .dispatchEvent(new Event("sync"));
            }
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
          e.addEventListener("change", (event) => {
            e.blur();
            document.querySelector("[GetSelectors]").click();
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

              let message = await connector.post({
                type: "BlueFox.GetSelectors",
                object: {
                  selector: selector,
                },
              });
              if (message.object) {
                let SelectorsList = document.querySelector("[SelectorsList]");
                SelectorsList.textContent = "";
                let QuerySelectorsAttribute = document.querySelector(
                  "#QuerySelectorsAttribute"
                );
                message.object.forEach((_) => {
                  let li = document.createElement("li");

                  let SelectorTemplate = document
                    .querySelector("#SelectorTemplate")
                    .content.cloneNode(true);
                  SelectorTemplate.querySelector(`[placeholder="Key"]`).value =
                    _.attributes[QuerySelectorsAttribute.value]
                      ? _.attributes[QuerySelectorsAttribute.value]
                      : null;
                  SelectorTemplate.querySelector(
                    `[placeholder="Selector"]`
                  ).value = _.selector;

                  li.appendChild(SelectorTemplate);
                  SelectorsList.appendChild(li);
                  SelectorsList.lastChild.querySelector("div").Selector = _;
                });
              }
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
                new Blob([JSON.stringify(R, null, 4)], {
                  type: "application/json",
                })
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
        "#QuerySelectorsAttribute": async (e) => {
          e.addEventListener("change", (event) => {
            e.blur();
            let SelectorsList = document.querySelector("[SelectorsList]");
            [...SelectorsList.querySelectorAll("div")].forEach((_) => {
              _.querySelector(`[placeholder="Key"]`).value = _.Selector
                .attributes[e.value]
                ? _.Selector.attributes[e.value]
                : null;
            });
          });
        },
        "[SelectorsList]": async (e) => {
          e.addEventListener("click", async (event) => {
            if (
              event.target.attributes["GetElementProperties"] ||
              event.target.closest("[GetElementProperties]")
            ) {
              let message = await connector.post({
                type: "BlueFox.GetElementProperties",
                object: {
                  selector: event.target.closest("div").Selector.selector,
                },
              });
              let R = JSON.stringify(message.object, null, 4);
              navigator.clipboard.writeText(R);
              UIkit.notification(
                `<div><span uk-icon="check"></span><span> Copied to clipboard!</span></div><pre GetElementPropertiesNotification><code></code></pre>`,
                { timeout: 2000, status: "success" }
              );
              document.querySelector(
                "[GetElementPropertiesNotification] > code"
              ).textContent = R;
            }
          });
        },
        "[CapturEvents]": async (e) => {
          let CapturEventsOut = document.querySelector("[CapturEventsOut]");
          let connector = null;
          e.addEventListener("click", async (event) => {
            if (e.attributes.disabled) {
              e.removeAttribute("disabled");
            } else {
              e.setAttribute("disabled", "");
            }
            connector = await chrome.tabs.connect(TabInfo.id);
            connector.onMessage.addListener((P) => {
              if (P.type == "BlueFox.CapturedEvent") {
                log(P);
                CapturEventsOut.textContent += `${JSON.stringify(P.object, null, 4)},\n`;
              }
            });
            await connector.postMessage({
              type: "BlueFox.CapturEvents",
              object: {},
            });
          });
        },
      };
      let queryWalker = new QueryWalker(oDict, document);
      await queryWalker.do();

      {
        await sleep(1000);
        let GetEventListners = async () => {
          let message = await connector.post({
            type: "BlueFox.GetEventListners",
            object: {},
          });
          document.querySelector("[EventListners]").textContent =
            message.object.length;
        };
        await GetEventListners();
        setInterval(async () => {
          await GetEventListners();
        }, 5000);
      }
    }
  })();
}
