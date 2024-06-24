import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { Connector } from "/modules/BlueFox/postMessage.awaitable.js";

{
  (async () => {
    let log = console.log;
    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
    await window?.AppReady;
    let connector = new Connector();

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

        TabInfo.DOM = document.querySelector("#TabInfo");
        TabInfo.DOM.TabInfo = TabInfo;
        TabInfo.DOM.dispatchEvent(new Event("sync"));
        if (!TabInfo.favIconUrl) {
          document
            .querySelector(
              `img[favIcon]`
            )
            ?.setAttribute("uk-icon", "icon: world; ratio: 2");
          document
            .querySelector(`img[favIcon]`)
            ?.setAttribute("hide", "");
        } else {
          document
            .querySelector(
              `img[favIcon]`
            ).src = TabInfo.favIconUrl;
        }
      },
    };
    await TabInfo.reload();
    chrome.tabs.onUpdated.addListener(TabInfo.reload);

    log("index.js loaded");
    BlueFoxJs.Walker.walkHorizontally(
      {
        _scope_: document,
        "#Panel": async ($) => {
          $.element.attributes.panel.value = "ConsolePanel";
          $.element.dispatchEvent(new Event("sync"));
        },
        "[TabsList]": async ($) => {
          $.element.tabs = {};
          log($.element.tabs);

          $.element.onCreated = async (tab) => {
            if (
              [
                tab.url != "",
                !tab.url?.includes("edge://"),
                !tab.url?.includes("extension://"),
                !tab.url?.includes("chrome://"),
                !tab.url?.includes("chrome-extension://"),
              ].every((_) => {
                return _;
              })
            ) {
              $.element.tabs[tab.id] = tab;
            }
          };

          $.element.onRemoved = async (id) => {
            $.element.tabs[id]?.element?.remove();
            delete $.element.tabs[id];
          }

          $.element.onUpdated = async (event) => {
            [
              ...(await chrome.tabs.query({ url: "<all_urls>" }))
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
            }).forEach((_) => {
              if ($.element.tabs[_.id]) {
                $.element.tabs[_.id] = Object.assign($.element.tabs[_.id], _);
              } else {
                $.element.tabs[_.id] = _;
              }
            });

            for (let [id, tab] of Object.entries($.element.tabs)) {
              if (tab.id in $.element.tabs) {
                if ($.element.tabs[tab.id].element) {
                  $.element.tabs[tab.id].element.querySelector("[title]").textContent = tab.title;
                  $.element.tabs[tab.id].element.querySelector("[url]").childNodes[0].textContent = tab.url;
                  if (tab.favIconUrl) {
                    $.element.tabs[tab.id].element.querySelector("div:has(>[favicon])").removeAttribute("uk-icon");
                    $.element.tabs[tab.id].element.querySelector("[favicon]").src = tab.favIconUrl;
                    $.element.tabs[tab.id].element.querySelector("[favicon]").removeAttribute("hide");
                  } else {
                    $.element.tabs[tab.id].element.querySelector("div:has(>[favicon])").setAttribute(
                      "uk-icon",
                      "icon: world; ratio: 2"
                    );
                    $.element.tabs[tab.id].element.querySelector("[favicon]").setAttribute("hide", "");
                  }
                } else {
                  let TabsTemplate = document.querySelector("#TabsTemplate").content.cloneNode(true);
                  if (tab.favIconUrl) {
                    TabsTemplate.querySelector("div:has(>[favicon])").removeAttribute("uk-icon");
                    TabsTemplate.querySelector("[favicon]").src = tab.favIconUrl;
                    TabsTemplate.querySelector("[favicon]").removeAttribute("hide");
                  } else {
                    TabsTemplate.querySelector("div:has(>[favicon])").setAttribute(
                      "uk-icon",
                      "icon: world; ratio: 2"
                    );
                    TabsTemplate.querySelector("[favicon]").setAttribute("hide", "");
                  }

                  TabsTemplate.querySelector("[title]").textContent = tab.title;
                  TabsTemplate.querySelector("[url]").textContent = tab.url;
                  TabsTemplate.querySelector("[Focus]").addEventListener(
                    "click",
                    (event) => {
                      window.open(`./focus.html#${tab.id}`, "_blank");
                    }
                  );
                  TabsTemplate.querySelector("[TabToWindow]").addEventListener(
                    "click",
                    async (event) => {
                      await chrome.windows.create(
                        {
                          tabId: tab.id,
                          focused: false,
                          top: 0,
                          left: 0,
                        }
                      );
                    }
                  );
                  await BlueFoxJs.Walker.walkHorizontally({
                    _scope_: TabsTemplate,
                    "code": $.self["code"],
                  });

                  $.element.appendChild(TabsTemplate);
                  $.element.tabs[tab.id].element = $.element.children[$.element.children.length - 1];
                }
              }
            }
          }

          chrome.tabs.onCreated.addListener($.element.onCreated);
          chrome.tabs.onRemoved.addListener($.element.onRemoved);
          chrome.tabs.onUpdated.addListener($.element.onUpdated);
          $.element.onUpdated();
        },
        "[CaptureScreenshots]": async ($) => {
          return;
          let Files = document.querySelector("[Files]");
          Files.addEventListener("hidden", (event) => {
            Files.textContent = "";
          });
          $.element.addEventListener("click", async (event) => {
            if ($.element.classList.contains("uk-spinner")) {
              return;
            }
            Files.attributes.Files.value = "hidden";
            Files.dispatchEvent(new Event("sync"));
            $.element.classList.add("uk-spinner");
            await sleep(300);
            try {
              let tabs = [
                ...(await chrome.tabs.query({ url: "<all_urls>" }))
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
                await chrome.windows.create({
                  tabId: tab.id,
                  focused: false,
                  top: 0,
                  left: 0,
                });
                let connector = new Connector();
                await connector.load(tab.id);
                let message = await connector.post({
                  BlueFoxCaptureWindow: {
                    format: "png",
                    captureBeyondViewport: true,
                  },
                });
                if (message.BlueFoxCaptureWindow) {
                  let div = document.createElement("div");
                  let img = Object.assign(
                    document.createElement("img"),
                    {
                      "className": "radius uk-box-shadow-small",
                    }
                  );
                  img.src = `data:image/png;base64, ${message.BlueFoxCaptureWindow}`;
                  img.addEventListener("click", (event) => {
                    document.querySelector(`#modal-media-image [image]`).textContent = "";
                    document.querySelector(`#modal-media-image [image]`).append(
                      Object.assign(
                        img.cloneNode(true),
                        {
                          className: "radius",
                        }
                      )
                    );
                    UIkit.modal(document.querySelector(`#modal-media-image`)).show();
                  });
                  div.append(img);
                  Files.append(div);

                }
              }
            } catch (e) { }
            if (Files.childElementCount) {
              Files.attributes.Files.value = "show";
              Files.dispatchEvent(new Event("sync"));
            }
            await sleep(600);
            $.element.classList.remove("uk-spinner");
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
      }
    );
  })();

}
