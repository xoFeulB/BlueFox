import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { BlueFoxScript } from "/js/scripting/bluefox.script.js";
import { AwaitbleWebSocket } from "/js/communication/websocket.awaitable.js";


window.BlueFoxJs = BlueFoxJs;
window.BlueFoxScript = class extends BlueFoxScript {
  async runWorkspaceScript(path, args) {
    let regexp_object = new RegExp(path, "g");
    let FileListPath = await ([...document.querySelectorAll("#FileList [path]")].filter((_) => {
      return regexp_object.test(_.path);
    })[0]);
    let play = FileListPath.closest("li").querySelector("[Play]");
    play.classList.add("uk-spinner");
    let file = await (await fetch(
      `http://${window.values.BluefoxServer}:7777/R?/${FileListPath.workspaceObject.id}/${FileListPath.workspaceObject.workspace}${FileListPath.workspaceObject.path}`
    )).text();
    let script = `(${file})(${JSON.stringify(args ? args : []).slice(1, -1)});`;
    let R = await chrome.runtime.sendMessage({
      type: "Runtime.evaluate",
      object: {
        expression: script,
        objectGroup: "BlueFox-js-lanch",
        awaitPromise: true,
        returnByValue: true,
        silent: false,
        userGesture: true,
      },
    });
    if (R.exceptionDetails) {
      console.error(R);
    }
    play.classList.remove("uk-spinner");
    return R;
  }

  async getWorkspaceFile(path) {
    let regexp_object = new RegExp(path, "g");

    let workspaceObject = ([...document.querySelectorAll("#FileList [path]")].filter((_) => {
      return regexp_object.test(_.path);
    })[0]).workspaceObject;

    let fetch_result = await fetch(
      `http://${window.values.BluefoxServer}:7777/R?/${workspaceObject.id}/${workspaceObject.workspace}${workspaceObject.path}`
    );
    let B = await fetch_result.blob();

    return {
      name: workspaceObject.path.split("/").slice(-1)[0],
      type: fetch_result.headers.get("Content-Type"),
      blob: [...new Uint8Array(await B.arrayBuffer())],
      object: "Uint8Array",
    };
  }

  async runScript(script) {
    let R = await chrome.runtime.sendMessage({
      type: "Runtime.evaluate",
      object: {
        expression: script,
        objectGroup: "BlueFox-js-lanch",
        awaitPromise: true,
        returnByValue: true,
        silent: false,
        userGesture: true,
      },
    });
    if (R.exceptionDetails) {
      console.error(R);
    }
    return R;
  }
}
{
  (async () => {
    let blueFoxScript = await new BlueFoxScript();
    let log = console.log;
    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
    await window?.AppReady;

    BlueFoxJs.Walker.walkHorizontally(
      {
        _scope_: document,
        "#Panel": async ($) => {
          $.element.attributes.panel.value = "ConsolePanel";
          $.element.dispatchEvent(new Event("sync"));
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
        "set-value-on-click[target='[Console].attributes.Console.value']": async ($) => {
          $.element.addEventListener("click", (event) => {
            window.scroll({
              top: 0,
              behavior: "smooth",
            });
          });
        },
        "[TabsList]": async ($) => {
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
            if ($.element.childElementCount == 0) {
              $.element.textContent = "";
            }
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
                      window.open(`/html/focus.html#${tab.id}`, "_blank");
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
                  let QuerySelector = TabsTemplate.querySelector("[QuerySelector]");
                  let CaptureScreenshot = TabsTemplate.querySelector("[CaptureScreenshot]");
                  CaptureScreenshot.addEventListener(
                    "click",
                    async (event) => {
                      if (CaptureScreenshot.classList.contains("uk-spinner")) {
                        return;
                      }
                      (async () => {
                        CaptureScreenshot.classList.add("uk-spinner");
                        await sleep(900);
                        CaptureScreenshot.classList.remove("uk-spinner");
                      })();

                      let screenshot = await blueFoxScript[tab.id].getScreenshot(
                        QuerySelector.value ? QuerySelector.value : "html",
                        {
                          fileName: "capture",
                          format: "png",
                          quality: 100,
                          captureBeyondViewport: true,
                        }
                      );
                      await navigator.clipboard.write([
                        new ClipboardItem(
                          {
                            "image/png": new Blob(
                              [screenshot], { type: "image/png" }
                            )
                          }
                        )
                      ]);
                      (async () => {
                        let CaptureScreenshotPreview = document.querySelector("[CaptureScreenshotPreview]");
                        if (CaptureScreenshotPreview.attributes.CaptureScreenshotPreview.value == "show") {
                          CaptureScreenshotPreview.attributes.CaptureScreenshotPreview.value = "hide";
                          CaptureScreenshotPreview.dispatchEvent(new Event("change"));
                          await sleep(Number(CaptureScreenshotPreview.attributes.out.value.split(".")[1]) + 100);
                        }
                        CaptureScreenshotPreview.querySelector("img").src = window.URL.createObjectURL(new Blob(
                          [screenshot], { type: "image/png" }
                        ));
                        CaptureScreenshotPreview.attributes.CaptureScreenshotPreview.value = "show";
                        CaptureScreenshotPreview.dispatchEvent(new Event("change"));

                        await sleep(3000);
                        CaptureScreenshotPreview.attributes.CaptureScreenshotPreview.value = "hide";
                        CaptureScreenshotPreview.dispatchEvent(new Event("change"));
                      })();
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
        "button[RunScript]": async ($) => {
          window.ServerScriptOut = document.querySelector("[ServerScriptOut]");
          $.element.addEventListener("click", async (event) => {
            $.element.classList.add("uk-spinner");
            let R = await chrome.runtime.sendMessage({
              type: "Runtime.evaluate",
              object: {
                expression: window.MonacoEditor.getValue(),
                objectGroup: "BlueFox-js-lanch",
                awaitPromise: true,
                returnByValue: true,
                silent: false,
                userGesture: true,
              },
            });
            if (R.exceptionDetails) {
              console.error(R);
            }
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
                `  let tab = await blueFoxScript.createWindow("https://www.google.com");`,
                `  await tab`,
                `    .tails()`,
                `    .target("textarea")`,
                `    .setProperty({ value: "^.,.^ BlueFox" })`,
                `    .target("[name='btnK'][tabindex='0']")`,
                `    .call("click", null)`,
                `    .runTillNextOnLoad({ sleep: 50 });`,
                ``,
                `  let search_result = await tab.dispatchScript(`,
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
      }
    );

    /* WebSocket */ {
      let webSocket;
      let start_ws = async () => {
        try {
          webSocket?.close();
          webSocket = await (new AwaitbleWebSocket(`ws://${window.values.BluefoxServer}:8888`));
          let webSocketMessageHandler = {
            "getFileTree": async (data) => {
              document.querySelector("[vscode-notice]").setAttribute("hide", "");
              let workspaces = await (await fetch(`http://${window.values.BluefoxServer}:7777/GetWorkspace.get`)).json();
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
                          `http://${window.values.BluefoxServer}:7777/R?/${workspace.id}/${folder.name}${object.path}`
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
              let file = await (await fetch(`http://${window.values.BluefoxServer}:7777/GetFile.get?${JSON.stringify(data)}`)).text();
              let R = await chrome.runtime.sendMessage({
                type: "Runtime.evaluate",
                object: {
                  expression: file,
                  objectGroup: "BlueFox-js-lanch",
                  awaitPromise: true,
                  returnByValue: true,
                  silent: false,
                  userGesture: true,
                },
              });
              if (R.exceptionDetails) {
                console.error(R);
              }
              return R;
            },
            "RunScript": async (data) => {
              let R = await chrome.runtime.sendMessage({
                type: "Runtime.evaluate",
                object: {
                  expression: data.content,
                  objectGroup: "BlueFox-js-lanch",
                  awaitPromise: true,
                  returnByValue: true,
                  silent: false,
                  userGesture: true,
                },
              });
              if (R.exceptionDetails) {
                console.error(R);
              }
              delete data.content;
              webSocket.socket.send(
                JSON.stringify(
                  Object.assign(data, R)
                )
              );
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
          webSocket.socket.addEventListener("close", async (event) => {
            document.querySelector("[vscode-notice]").removeAttribute("hide");
            let filelist = document.querySelector("#FileList").textContent = "";
          });

          {
            if (location.hash) {
              window.BlueFoxID = location.hash.slice(1);
              webSocket.socket.send(
                JSON.stringify(
                  {
                    BlueFoxID: location.hash.slice(1),
                  }
                )
              );
            }
          }

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
