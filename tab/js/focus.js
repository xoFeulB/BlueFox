// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { Connector } from "/js/postMessage.awaitable.js";

{
  (async () => {
    let log = (...args) => {
      console.log("focus.js", ...args);
    };

    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
    let connector = new Connector();

    let scenarioHandler = async (scenarios) => {
      for (let scenario of scenarios) {
        let json_parsed = JSON.parse(scenario.text);
        for (let tail of json_parsed.tails) {
          if (tail.when) {
            for (let key of Object.keys(tail.when)) {
              let result = await connector.post({
                BlueFoxGetElementProperties: {
                  selector: key,
                },
              });
              if (
                [...Object.keys(tail.when[key])].every((_) => {
                  let property = BlueFoxJs.Util.getProperty(_, result.BlueFoxGetElementProperties);
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
                  BlueFoxDispatchAction: JSON.stringify(tail.tail),
                });
                await sleep(tail.sleep);
              }
            }
          } else {
            await connector.post({
              BlueFoxDispatchAction: JSON.stringify(tail.tail),
            });
            await sleep(tail.sleep);
          }
        }
      }
    };

    let dropHandler = async (files) => {
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
            BlueFoxDispatchAction: action.text,
          });
        }
        for (let script of scripts) {
          await connector.post({
            BlueFoxDispatchScript: script.text,
          });
        }
        await scenarioHandler(scenarios);
      } catch (err) {
        log(err);
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
          if (!connector.connector) {
            await connector.load(TabInfo.id);
          }

          document.querySelector("title").textContent = `^.,.^ / ${TabInfo.title}`;
          TabInfo.DOM = document.querySelector("#TabInfo");
          TabInfo.DOM.TabInfo = TabInfo;
          TabInfo.DOM.dispatchEvent(new Event("sync"));
          if (!TabInfo.favIconUrl) {
            document
              .querySelector(
                `div:has(>img[sync-from-property="TabInfo.favIconUrl"])`
              )
              ?.setAttribute("uk-icon", "icon: world; ratio: 2");
            document
              .querySelector(`img[sync-from-property="TabInfo.favIconUrl"]`)
              ?.setAttribute("hide", "");
          }
          let DOMSnapshot = await connector.post({
            BlueFoxCaptureDOMSnapshot: {
              computedStyles: [],
            },
          });
          try {
            TabInfo.url = new URL(TabInfo.url);
            await fetch(`${window.values.BluefoxProtocol}://${window.values.BluefoxServer}/StoreStrings.post`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                {
                  href: TabInfo.url.href,
                  origin: TabInfo.url.origin,
                  pathname: TabInfo.url.pathname,
                  hash: TabInfo.url.hash,
                  search: TabInfo.url.search,
                  host: TabInfo.url.host,
                  hostname: TabInfo.url.hostname,
                  port: TabInfo.url.port,
                  strings: [...(new Set(DOMSnapshot.BlueFoxCaptureDOMSnapshot.strings))]
                }
              ),
            });
          } catch { }
        },
      };
      await TabInfo.reload();
      chrome.tabs.onUpdated.addListener(TabInfo.reload);

      await BlueFoxJs.Walker.walkHorizontally({
        _scope_: document,
        "[HeaderNav]": async ($) => {
          if (window.parent != window) {
            $.element.querySelector(`[sync-from-property="TabInfo.favIconUrl"]`)?.setAttribute("hide", "");
            $.element.querySelector(`[sync-from-property="TabInfo.title"]`)?.setAttribute("hide", "");
            $.element.querySelector(`[sync-from-property="TabInfo.url"]`)?.parentElement.setAttribute("hide", "");
            $.element.querySelector(`div:has(>img[sync-from-property="TabInfo.favIconUrl"])`)?.setAttribute("hide", "");
          }
        },
        "[TabToWindow]": async ($) => {
          $.element.addEventListener("click", async () => {
            await chrome.windows.create({
              tabId: TabInfo.id,
              focused: false,
              top: 0,
              left: 0,
            });
          });
        },
        "[CaptureWindow]": async ($) => {
          $.element.addEventListener("click", async () => {
            let message = await connector.post({
              BlueFoxCaptureWindow: {
                format: "png",
                captureBeyondViewport: true,
              },
            });
            if (message.BlueFoxCaptureWindow) {
              document.querySelector(
                "[CapturePreview]"
              ).src = `data:image/png;base64, ${message.BlueFoxCaptureWindow}`;
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
        "#MenuControll": async ($) => {
          let MenuTabs = [...document.querySelectorAll("[MenuTabs] [MenuTab]")];
          $.element.addEventListener("change", (event) => {
            MenuTabs.filter((_) => {
              _.classList.remove("bg-white");
              return _.attributes.value.value == $.element.value;
            }).forEach((_) => {
              _.classList.add("bg-white");
            });
            window.scroll({
              top: 0,
              behavior: "smooth",
            });
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
              $.element.removeAttribute("hide");
            } else {
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
              $.element.removeAttribute("hide");
            } else {
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
            $.element.setAttribute("uk-icon", "more");
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
                BlueFoxGetSelectors: {
                  selector: selector,
                },
              });
              if (message.BlueFoxGetSelectors) {
                let SelectorsList = document.querySelector("[SelectorsList]");
                SelectorsList.textContent = "";
                let QuerySelectorsProperty = document.querySelector(
                  "#QuerySelectorsProperty"
                );
                message.BlueFoxGetSelectors.forEach(async (_) => {
                  let li = document.createElement("li");

                  let SelectorTemplate = document
                    .querySelector("#SelectorTemplate")
                    .content.cloneNode(true);

                  let result = await connector.post({
                    BlueFoxGetElementProperties: {
                      selector: _.selector,
                    },
                  });
                  let property = BlueFoxJs.Util.getProperty(QuerySelectorsProperty.value, result.BlueFoxGetElementProperties);
                  if (property.object) {
                    try {
                      SelectorTemplate.querySelector(`[placeholder="Key"]`).value = property.object[property.property]
                        ? property.object[property.property]
                        : null;
                    } catch { }
                  }
                  SelectorTemplate.querySelector(
                    `[placeholder="Selector"]`
                  ).value = JSON.stringify(_.selector);

                  li.appendChild(SelectorTemplate);
                  SelectorsList.appendChild(li);
                  SelectorsList.lastChild.querySelector("div").Selector = _;
                });
              }
            }
            $.element.disabled = false;
            $.element.setAttribute("uk-icon", "crosshairs");
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
                BlueFoxGetElementProperties: {
                  selector: _.Selector.selector,
                },
              });
              let property = BlueFoxJs.Util.getProperty(event.target.value, message.BlueFoxGetElementProperties);
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
                BlueFoxGetElementProperties: {
                  selector: event.target.closest("div").Selector.selector,
                },
              });
              let R = JSON.stringify(message.BlueFoxGetElementProperties, null, 4);
              navigator.clipboard.writeText(R);
              UIkit.notification(
                `<div><span uk-icon="check"></span><span> Copied to clipboard!</span></div><pre GetElementPropertiesNotification><code></code></pre>`,
                { timeout: 2000, status: "success" }
              );
              document.querySelector(
                "[GetElementPropertiesNotification] > code"
              ).textContent = R;
            }
            else if (
              event.target.attributes["CopySelector"] ||
              event.target.closest("[CopySelector]")
            ) {
              event.target.closest("div").querySelector("[CopySelector]").classList.add("uk-spinner");
              navigator.clipboard.writeText(JSON.stringify(event.target.closest("div").Selector.selector));
              await sleep(930);
              event.target.closest("div").querySelector("[CopySelector]").classList.remove("uk-spinner");
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
        "#UiNames": async ($) => {
          $.element.SpreadsheetData = [];
          let Spreadsheet = $.element.querySelector("[Spreadsheet]");
          let checkbox = $.element.querySelector("[checkbox]");
          let reload = $.element.querySelector("[Reload]");

          reload.addEventListener("click", (event) => {
            checkbox.dispatchEvent(new Event("change"));
          });

          checkbox.addEventListener("change", async (event) => {
            [...checkbox.querySelectorAll("input")].forEach((_) => {
              _.disabled = true;
            });
            reload.disabled = true;
            reload.setAttribute("uk-icon", "more");
            let div = document.createElement("div");
            div.setAttribute("uk-spinner", "");
            div.className = "uk-text-center";
            Spreadsheet.textContent = "";
            Spreadsheet.appendChild(div);

            let selectors = [...checkbox.querySelectorAll("input")].filter((_) => {
              return _.checked;
            }).map((_) => { return _.value; });

            $.element.SpreadsheetData = [];
            for (let selector of selectors) {
              let message = await connector.post({
                BlueFoxGetSelectors: {
                  selector: `[${selector}]`,
                },
              });

              if (message.BlueFoxGetSelectors) {
                for (let _ of message.BlueFoxGetSelectors) {
                  let result = await connector.post({
                    BlueFoxGetElementProperties: {
                      selector: _.selector,
                    },
                  });
                  let property = BlueFoxJs.Util.getProperty(`attributes.${selector}.value`, result.BlueFoxGetElementProperties);
                  if (property.object) {
                    try {
                      $.element.SpreadsheetData.push(
                        [
                          TabInfo.title,
                          property.object[property.property]
                            ? property.object[property.property]
                            : "",

                          property.object[property.property]
                            ? `[${selector}="${property.object[property.property]}"]`
                            : _.selector,

                        ]
                      );
                    } catch { }
                  }
                }
              }
            }

            div.remove();
            [...checkbox.querySelectorAll("input")].forEach((_) => {
              _.disabled = false;
            });
            reload.disabled = false;
            reload.setAttribute("uk-icon", "refresh");
            if ($.element.SpreadsheetData.length != 0) {
              jspreadsheet(Spreadsheet, {
                data: $.element.SpreadsheetData,
                filters: true,
                columns: [
                  { type: 'text', title: 'LocationTitle', width: 300, align: "left" },
                  { type: 'text', title: 'Name', width: 300, align: "left" },
                  { type: 'text', title: 'Selector', width: 300, align: "left" },
                ],
              });
            }
          });
        },
        "code": async ($) => {
          if ($.element.closest("mark-down")) {
            return;
          }
          $.element.closest("pre")?.classList?.add("radius");

          let button = Object.assign(
            document.createElement("button"),
            {
              className: $.element.className ? "uk-icon-link copy-code" : "uk-icon-link",
            }
          );
          button.setAttribute("uk-icon", "copy");
          button.setAttribute("title", "copy");
          button.setAttribute("uk-tooltip", "");
          button.addEventListener("click", async (event) => {
            navigator.clipboard.writeText($.element.textContent);
            button.classList.add("uk-spinner");
            await sleep(930);
            button.classList.remove("uk-spinner");
          });
          let menu = Object.assign(
            document.createElement($.element.className ? "div" : "span"),
            {
              className: "code-menu"
            }
          );
          menu.append(button);
          $.element.className ? $.element.parentElement.prepend(menu) : $.element.append(menu);
        },
        "textarea[v0-in]": async ($) => {
          $.element.addEventListener("input", (event) => {
            let R = [];
            let lines = $.element.value
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
        "[ScrollUp]": async ($) => {
          $.element.addEventListener("click", async (event) => {
            let modal_body = document.querySelector("#modal-overflow > div .uk-modal-body");
            modal_body.scrollBy({
              top: modal_body.scrollHeight * -1,
              left: modal_body.scrollWidth * -1,
              behavior: "smooth",
            });
          });
        },
        "#json_editor": async ($) => {
          $.element.reload = async () => {
            $.element.textContent = "";
            let Cookies = await chrome.cookies.getAll({ domain: TabInfo.url.hostname });
            Cookies.forEach((Cookie) => {
              delete Cookie.hostOnly;
              delete Cookie.session;
              let div = document.createElement("div");
              div.classList.add("uk-margin");
              div.editor = new JSONEditor(div, {
                schema: {
                  disable_collapse: true,
                  disable_array_add: true,
                  disable_array_delete: true,
                  disable_array_delete_all_rows: true,
                  disable_array_delete_last_row: true,
                  disable_array_reorder: true,
                  type: "object",
                  title: Cookie.name,
                  properties: {
                    domain: {
                      type: "string"
                    },
                    expirationDate: {
                      type: "number"
                    },
                    httpOnly: {
                      type: "boolean"
                    },
                    name: {
                      type: "string"
                    },
                    path: {
                      type: "string"
                    },
                    sameSite: {
                      type: "string"
                    },
                    secure: {
                      type: "boolean"
                    },
                    storeId: {
                      type: "string"
                    },
                    value: {
                      type: "string"
                    },
                  }
                }
              });
              div.editor.on("ready", () => {
                div.editor.setValue(Cookie);
                BlueFoxJs.Walker.walkHorizontally({
                  _scope_: div,
                  "button": async ($) => {
                    $.element.classList.add("uk-button", "uk-button-default");
                  },
                  ".row .form-control": async ($) => {
                    $.element.classList.add("uk-flex", "uk-flex-middle");
                    $.element.childNodes[0].classList.add("uk-width-1-4");
                    $.element.childNodes[1].classList.add("uk-input", "uk-width-3-4");
                  }
                });
              });
              div.editor.on("change", async () => {
                await BlueFoxJs.Walker.walkHorizontally({
                  _scope_: div,
                  ".row .form-control": async ($) => {
                    $.element.classList.add("uk-flex", "uk-flex-middle");
                    $.element.childNodes[0].classList.add("uk-width-1-4");
                    $.element.childNodes[1].classList.add("uk-input", "uk-width-3-4");
                  }
                });
              });
              let button = Object.assign(
                document.createElement("button"),
                {
                  className: "uk-button uk-button-primary",
                  textContent: "Update",
                }
              );
              button.addEventListener("click", async (event) => {
                let c = div.editor.getValue();
                if (c.domain[0] == ".") {
                  c.domain = c.domain.slice(1);
                }
                c.url = `${c.secure ? "https" : "http"}://${c.domain}${c.path}`;
                await chrome.cookies.set(c);
              });
              div.appendChild(button);
              $.element.appendChild(div);
            });
          }
          await $.element.reload();
        },
        "[ReloadJsonEditor]": async ($) => {
          $.element.addEventListener("click", () => {
            $.self._scope_.querySelector("#json_editor").reload();
          });
        },
      });
      await BlueFoxJs.Sync.view();

      {
        await sleep(1000);
        let GetEventListners = async () => {
          let message = await connector.post({
            BlueFoxGetEventListners: {},
          });
          document.querySelector("[EventListners]").textContent =
            message.BlueFoxGetEventListners.length;
        };
        await GetEventListners();
        setInterval(async () => {
          await GetEventListners();
        }, 5000);
      }
    }
  })();
}
