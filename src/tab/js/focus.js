// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { default as anime } from "/modules/anime/anime.es.js";

{
  (async () => {
    let log = (...args) => {
      console.log("focus.js", ...args);
    };

    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

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
                    let property = BlueFoxJs.Util.getProperty(_, message.object);
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
            } catch { }
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
            log(await connector.post({
              type: "BlueFox.Dispatch.Script",
              object: script.text,
            }));
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

      await BlueFoxJs.Walker.walkHorizontally({
        _scope_: document,
        "[HeaderNav]": async ($) => {
          if (window.parent != window) {
            $.element.querySelector(`[sync-from-property="TabInfo.favIconUrl"]`)?.setAttribute("hide", "");
            $.element.querySelector(`[sync-from-property="TabInfo.title"]`)?.setAttribute("hide", "");
            $.element.querySelector(`[sync-from-property="TabInfo.url"]`)?.setAttribute("hide", "");
          }
        },
        "[TabToWindow]": async ($) => {
          $.element.addEventListener("click", async () => {
            await chrome.windows.create({
              tabId: TabInfo.id,
            });
          });
        },
        "[CaptureWindow]": async ($) => {
          $.element.addEventListener("click", async () => {
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
        "[ReloadTab]": async ($) => {
          $.element.addEventListener("click", async () => {
            chrome.tabs.reload(TabInfo.id);
          });
        },
        "[BlueFoxFileAttach]": async ($) => {
          $.element.addEventListener("drop", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            await dropHandler(event.dataTransfer.files);
          });
          $.element.addEventListener("dragover", async (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          });
          $.element
            .querySelector("input")
            .addEventListener("input", async (event) => {
              await dropHandler(event.target.files);
              event.target.value = null;
            });
        },
        "#menuControll": async ($) => {
          let active = document.querySelector("active");
          let animate = async () => {
            let move_to_elm = document.querySelector(
              `[value="${$.element.value}"][setValueOnClick="#menuControll"]`
            );
            await anime({
              targets: active,
              scale: 0.3,
              duration: 500,
              easing: "easeInExpo",
            }).finished;
            await anime({
              targets: active,
              left: move_to_elm.getBoundingClientRect().left - 25,
              duration: 500,
              easing: "easeOutBounce",
            }).finished;
            await anime({
              targets: active,
              scale: 1,
              duration: 300,
              easing: "easeInExpo",
            }).finished;
          };
          $.element.addEventListener("change", (event) => {
            animate();
          });
          window.addEventListener("resize", (event) => {
            animate();
          });
        },
        "[showWhenSome]": async ($) => {
          let target = document.querySelector(
            $.element.attributes["showWhenSome"].value
          );

          target.addEventListener("change", async (event) => {
            let values = JSON.parse(
              $.element.attributes["showWhenSome-values"].value
            ).map((_) => {
              return `${_}`;
            });
            if (values.includes(`${target.value}`)) {
              $.element.style.opacity = 0;
              $.element.removeAttribute("hide");
              await anime({
                targets: $.element,
                opacity: 1,
                duration: 250,
                delay: 200,
                easing: "linear",
              }).finished;
            } else {
              await anime({
                targets: $.element,
                opacity: 0,
                duration: 200,
                easing: "linear",
              }).finished;
              $.element.setAttribute("hide", "");
            }
          });
          target.dispatchEvent(new Event("change"));
        },
        "[showWhenNotEvery]": async ($) => {
          let target = document.querySelector(
            $.element.attributes["showWhenNotEvery"].value
          );

          target.addEventListener("change", async (event) => {
            let values = JSON.parse(
              $.element.attributes["showWhenNotEvery-values"].value
            ).map((_) => {
              return `${_}`;
            });
            if (!values.includes(`${target.value}`)) {
              $.element.style.opacity = 0;
              $.element.removeAttribute("hide");
              await anime({
                targets: $.element,
                opacity: 1,
                duration: 250,
                delay: 200,
                easing: "linear",
              }).finished;
            } else {
              await anime({
                targets: $.element,
                opacity: 0,
                duration: 200,
                easing: "linear",
              }).finished;
              $.element.setAttribute("hide", "");
            }
          });
          target.dispatchEvent(new Event("change"));
        },
        "[setValueOnClick]": async ($) => {
          let target = document.querySelector(
            $.element.attributes["setValueOnClick"].value
          );
          $.element.addEventListener("click", (event) => {
            target.value = $.element.attributes.value.value;
            target.attributes.value.value = $.element.attributes.value.value;
            target.dispatchEvent(new Event("change"));
          });
        },
        "#QuerySelector": async ($) => {
          $.element.addEventListener("change", (event) => {
            $.element.blur();
            document.querySelector("[GetSelectors]").click();
          });
        },
        "[GetSelectors]": async ($) => {
          $.element.addEventListener("click", async (event) => {
            $.element.disabled = true;
            document.querySelector("#QuerySelector").disabled = true;
            document.querySelector("#QuerySelectorsProperty").disabled = true;
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
                let QuerySelectorsProperty = document.querySelector(
                  "#QuerySelectorsProperty"
                );
                message.object.forEach(async (_) => {
                  let li = document.createElement("li");

                  let SelectorTemplate = document
                    .querySelector("#SelectorTemplate")
                    .content.cloneNode(true);

                  let elementProperties = await connector.post({
                    type: "BlueFox.GetElementProperties",
                    object: {
                      selector: _.selector,
                    },
                  });
                  let property = BlueFoxJs.Util.getProperty(QuerySelectorsProperty.value, elementProperties.object);
                  if (property.object) {
                    try {
                      SelectorTemplate.querySelector(`[placeholder="Key"]`).value = property.object[property.property]
                        ? property.object[property.property]
                        : null;
                    } catch { }
                  }
                  SelectorTemplate.querySelector(
                    `[placeholder="Selector"]`
                  ).value = _.selector;

                  li.appendChild(SelectorTemplate);
                  SelectorsList.appendChild(li);
                  SelectorsList.lastChild.querySelector("div").Selector = _;
                });
              }
            }
            $.element.disabled = false;
            document.querySelector("#QuerySelector").disabled = false;
            document.querySelector("#QuerySelectorsProperty").disabled = false;
          });
        },
        "[SelectorDownloadJSON]": async ($) => {
          $.element.addEventListener("click", async (event) => {
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
              download: `${document.querySelector("#QuerySelector").value
                }.json`,
            }).click();
          });
        },
        "[SelectorDownloadCSV]": async ($) => {
          $.element.addEventListener("click", async (event) => {
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
        "#QuerySelectorsProperty": async ($) => {
          $.element.addEventListener("change", (event) => {
            $.element.disabled = true;
            document.querySelector("#QuerySelector").disabled = true;
            document.querySelector("[GetSelectors]").disabled = true;
            $.element.blur();
            let SelectorsList = document.querySelector("[SelectorsList]");
            [...SelectorsList.querySelectorAll("div")].forEach(async (_) => {
              let message = await connector.post({
                type: "BlueFox.GetElementProperties",
                object: {
                  selector: _.Selector.selector,
                },
              });
              let property = BlueFoxJs.Util.getProperty(event.target.value, message.object);
              log(property);
              if (property.object) {
                try {
                  _.querySelector(`[placeholder="Key"]`).value = property.object[property.property]
                    ? property.object[property.property]
                    : null;
                } catch { }
              }
            });
            $.element.disabled = false;
            document.querySelector("#QuerySelector").disabled = false;
            document.querySelector("[GetSelectors]").disabled = false;
          });
        },
        "[SelectorsList]": async ($) => {
          $.element.addEventListener("click", async (event) => {
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
        "[CapturEvents]": async ($) => {
          let EventHistory = [];
          let CapturEventsOut = document.querySelector("[CapturEventsOut]");
          let connector = null;
          $.element.addEventListener("click", async (event) => {
            connector = await chrome.tabs.connect(TabInfo.id);
            connector.onMessage.addListener((P) => {
              if (P.type == "BlueFox.CapturedEvent") {
                log(P);
                EventHistory.push(P.object);
                let out = {
                  type: "event",
                  target: {
                    selector: P.object.action.target,
                  },
                  option: {
                    eventObject: P.object.action.eventPrototype,
                    eventType: P.object.action.type,
                    eventArgs: P.object.action.property,
                  },
                };
                CapturEventsOut.textContent += `${JSON.stringify(
                  out,
                  null,
                  4
                )},\n`;
              }
            });
            await connector.postMessage({
              type: "BlueFox.CapturEvents",
              object: {},
            });
          });
        },
        "[NieAgresywnyScan]": async ($) => {
          $.element.addEventListener("click", async (event) => {
            await connector.post({
              type: "BlueFox.Scan.NieAgresywny",
              object: {},
            });
          });
        },
      });
      await BlueFoxJs.Sync.view();

      {
        // log(chrome);
        // Network
        // chrome.webRequest.onBeforeRequest.addListener(
        //   (details) => {
        //     log("onBeforeRequest", details);
        //   },
        //   { urls: ["<all_urls>"], tabId: TabInfo.id },
        //   ["requestBody"]
        // );
        // chrome.webRequest.onResponseStarted.addListener(
        //   (details) => {
        //     log("onResponseStarted", details);
        //   },
        //   { urls: ["<all_urls>"], tabId: TabInfo.id },
        //   ["responseHeaders"]
        // );
        // chrome.webRequest.onCompleted.addListener(
        //   (details) => {
        //     log("onCompleted", details);
        //   },
        //   { urls: ["<all_urls>"], tabId: TabInfo.id },
        //   ["responseHeaders"]
        // );
        // chrome.webRequest.onResponseStarted.addListener(
        //   (details) => {
        //     log("onResponseStarted", details);
        //   },
        //   { urls: ["<all_urls>"], tabId: TabInfo.id },
        //   ["responseHeaders"]
        // );
      }

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
