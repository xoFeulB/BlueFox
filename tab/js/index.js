// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { Values } from "/js/sync-value.js";
import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { BlueFoxScript } from "/js/bluefox.script.js";
import { AwaitbleWebSocket } from "/js/websocket.awaitable.js";

window.BlueFoxJs = BlueFoxJs;
window.BlueFoxScript = class extends BlueFoxScript {
  async runRemoteScript(path) {
    let regexp_object = new RegExp(path, "g");
    await ([...document.querySelectorAll("#FileList [path]")].filter((_) => {
      return regexp_object.test(_.path);
    })[0]).play();
  }

  async getRemoteFile(path) {
    let regexp_object = new RegExp(path, "g");

    let workspaceObject = ([...document.querySelectorAll("#FileList [path]")].filter((_) => {
      return regexp_object.test(_.path);
    })[0]).workspaceObject;

    let fetch_result = await fetch(
      `http://${Values.values.BluefoxServer.value}:7777/R?/${workspaceObject.id}/${workspaceObject.workspace}${workspaceObject.path}`
    );
    let B = await fetch_result.blob();

    return {
      name: workspaceObject.path.split("/").slice(-1)[0],
      type: fetch_result.headers.get("Content-Type"),
      blob: [...new Uint8Array(await B.arrayBuffer())],
      object: "Uint8Array",
    };
  }
}

{
  (async () => {
    await new Promise((resolve) => {
      let load = async (event) => {
        window.removeEventListener("load", load);
        resolve(event);
      };
      window.addEventListener("load", load);
    });

    let log = console.log;
    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };
    /* Display */ {
      await BlueFoxJs.Walker.walkHorizontally({
        _scope_: document,
        "[Tabs]": async ($) => {
          $.element.tabs = {};
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
                  $.element.tabs[tab.id].element.querySelector("[url]").textContent = tab.url;
                  if (tab.favIconUrl) {
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
                    TabsTemplate.querySelector("[favicon]").src = tab.favIconUrl;
                  } else {
                    TabsTemplate.querySelector("div:has(>[favicon])").setAttribute(
                      "uk-icon",
                      "icon: world; ratio: 2"
                    );
                    TabsTemplate.querySelector("[favicon]").setAttribute("hide", "");
                  }

                  TabsTemplate.querySelector("[title]").textContent = tab.title;
                  TabsTemplate.querySelector("[url]").textContent = tab.url;
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
                  TabsTemplate.querySelector("[FocusInFrame]").addEventListener(
                    "click",
                    (event) => {
                      event.target
                        .closest("[tabInfo]")
                        .querySelector("[FocusFrame]").textContent = "";
                      if (!JSON.parse(event.target.getAttribute("aria-expanded"))) {
                        let iframe = Object.assign(document.createElement("iframe"), {
                          src: `./focus.html#${tab.id}`,
                        });
                        event.target
                          .closest("[tabInfo]")
                          .querySelector("[FocusFrame]")
                          .appendChild(iframe);
                      }
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
        "button[RunScript]": async ($) => {
          window.ServerScriptOut = document.querySelector("[ServerScriptOut]");
          $.element.addEventListener("click", async (event) => {
            $.element.classList.add("uk-spinner");
            await sendMessage({
              type: "Debugger.attach",
            });
            await sendMessage({
              type: "Runtime.evaluate",
              object: {
                expression: window.MonacoEditor.getValue(),
                objectGroup: "BlueFox-js-lanch",
                awaitPromise: true,
                returnByValue: true,
              },
            });
            $.element.classList.remove("uk-spinner");
          });
        },
        "[ServerScript]": async ($) => {
          require.config({ paths: { vs: "/modules/monaco-editor/min/vs" } });
          require(["vs/editor/editor.main"], function () {
            window.MonacoEditor = monaco.editor.create($.element, {
              value: [
                `(async () => {`,
                `  let blueFoxScript = await new BlueFoxScript();`,
                ``,
                `  let tab = await blueFoxScript.tabs.create("https://www.google.com");`,
                `  await tab.dispatch`,
                `    .tails()`,
                `    .target("textarea")`,
                `    .setProperty({ value: "^.,.^ BlueFox" })`,
                `    .target("[name='btnK'][tabindex='0']")`,
                `    .call("click", null)`,
                `    .run({ sleep: 50 });`,
                `  await sleep(1000);`,
                ``,
                `  let search_result = await tab.dispatch.script(`,
                `    () => {`,
                `      return [...document.querySelectorAll("#search :is(a[data-jsarwt='1'],a[jsname])")]`,
                `        .filter((_) => {`,
                `          return _.querySelector("h3");`,
                `        })`,
                `        .map((_) => {`,
                `          return {`,
                `            href: _.href,`,
                `            title: _.querySelector("h3").textContent,`,
                `          }`,
                `        });`,
                `    }`,
                `  );`,
                `  window.alert(JSON.stringify(search_result.result.value, null, 4));`,
                `})();`,
              ].join("\n"),
              language: "javascript",
              tabSize: 2,
              automaticLayout: true,
            });
          });
        },
        "[ReLoad]": async ($) => {
          $.element.addEventListener("click", async (event) => {
            $.element.classList.add("uk-spinner");
            window.dispatchEvent(new CustomEvent("reload_ws"));
            await sleep(930);
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
        }
      });
      BlueFoxJs.Sync.view();
    }

    /* WebSocket */ {
      let webSocket;
      let start_ws = async () => {
        try {
          webSocket?.close();
          webSocket = await (new AwaitbleWebSocket(`ws://${Values.values.BluefoxServer.value}:8888`));
          if (!webSocket.isOpen) {
            throw new Error();
          }
          let webSocketMessageHandler = {
            "getFileTree": async (data) => {
              let workspaces = await (await fetch(`http://${Values.values.BluefoxServer.value}:7777/GetWorkspace.get`)).json();
              let filelist = document.querySelector("#FileList");
              filelist.textContent = "Found, and Waiting BlueFoxServer...";
              filelist.workspaces = workspaces;

              workspaces.forEach((workspace) => {
                workspace.workspace.forEach((folder) => {
                  folder.objects
                    .filter((object) => {
                      return [
                        object.isFile,
                      ].every((_) => { return _; });
                    })
                    .forEach((object) => {
                      let li = document.querySelector("#FileListTemplate").content.cloneNode(true);
                      let path = li.querySelector("[Path]");
                      let play = li.querySelector("[Play]");
                      let pull = li.querySelector("[Pull]");
                      path.textContent = object.path;
                      path.path = object.path;
                      path.workspaceObject = {
                        id: workspace.id,
                        workspace: folder.name,
                        path: object.path
                      };
                      path.play = async (event) => {
                        play.classList.add("uk-spinner");
                        await webSocketMessageHandler["dispatch"](
                          {
                            id: workspace.id,
                            workspace: folder.name,
                            path: object.path
                          }
                        );
                        play.classList.remove("uk-spinner");
                      };

                      pull.pull = async (event) => {
                        pull.classList.add("uk-spinner");
                        let R = await (await fetch(
                          `http://${Values.values.BluefoxServer.value}:7777/R?/${workspace.id}/${folder.name}${object.path}`
                        )).text();
                        window.MonacoEditor.setValue(R);
                        pull.classList.remove("uk-spinner");
                      };
                      if (["js"].includes(object.path.split(".").slice(-1)[0])) {
                        pull.addEventListener("click", pull.pull);
                        play.addEventListener("click", path.play);
                      } else {
                        pull.setAttribute("hidden", "");
                        play.setAttribute("hidden", "");
                      }
                      filelist.appendChild(li);
                    });
                });
              });
              await BlueFoxJs.Walker.walkHorizontally({
                _scope_: filelist,
                "code": async ($) => {
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
                }
              });
            },
            "dispatch": async (data) => {
              let file = await (await fetch(`http://${Values.values.BluefoxServer.value}:7777/GetFile.get?${JSON.stringify(data)}`)).text();
              await sendMessage({
                type: "Debugger.attach",
              });
              await sendMessage({
                type: "Runtime.evaluate",
                object: {
                  expression: file,
                  objectGroup: "BlueFox-js-lanch",
                  awaitPromise: true,
                  returnByValue: true,
                },
              });
            },
            "RunScript": async (data) => {
              await sendMessage({
                type: "Debugger.attach",
              });
              await sendMessage({
                type: "Runtime.evaluate",
                object: {
                  expression: data.content,
                  objectGroup: "BlueFox-js-lanch",
                  awaitPromise: true,
                  returnByValue: true,
                },
              });
            },
            "ReLoad": async (data) => {
              window.dispatchEvent(new CustomEvent("reload_ws"));
            },
          };

          webSocket.socket.addEventListener("message", async (event) => {
            let data = JSON.parse(event.data);
            if (data.type in webSocketMessageHandler) {
              await webSocketMessageHandler[data.type](data);
            }
          });
          webSocket.socket.addEventListener("error", async (event) => {
            await sleep(3000);
            window.dispatchEvent(new CustomEvent("reload_ws"));
          });

          await webSocketMessageHandler["getFileTree"](null);
        } catch (e) {
          await sleep(3000);
          window.dispatchEvent(new CustomEvent("reload_ws"));
        }
      }
      window.addEventListener("reload_ws", () => {
        start_ws();
      });
      window.dispatchEvent(new CustomEvent("reload_ws"));
    }
  })();
}

