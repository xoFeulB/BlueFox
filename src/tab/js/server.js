// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { BlueFoxScript } from "/js/bluefox.script.js";
window.BlueFoxJs = BlueFoxJs;
window.BlueFoxScript = BlueFoxScript;

{
  (async () => {
    let log = console.log;
    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
    let sendMessage = async (arg) => {
      try {
        return await chrome.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };
    log(BlueFoxJs);
    log(BlueFoxScript);
    /* Display */ {
      BlueFoxJs.Walker.walkHorizontally({
        _scope_: document,
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
              });
            } else {
              await anime({
                targets: $.element,
                opacity: 0,
                duration: 200,
                easing: "linear",
              });
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
              });
            } else {
              await anime({
                targets: $.element,
                opacity: 0,
                duration: 200,
                easing: "linear",
              });
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
            await sendMessage({
              type: "Debugger.attach",
            });
            await sendMessage({
              type: "Runtime.evaluate",
              object: {
                expression: window.MonacoEditor.getValue(),
                objectGroup: "BlueFox-js-lanch",
              },
            });
          });
        },
        "[BlueFoxServerFileAttach]": async ($) => {
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
        "[ServerScript]": async ($) => {
          require.config({ paths: { vs: "/modules/monaco-editor/min/vs" } });
          require(["vs/editor/editor.main"], function () {
            window.MonacoEditor = monaco.editor.create($.element, {
              value: [
                `(async () => {`,
                `  let blueFoxScript = new BlueFoxScript();`,
                `  await blueFoxScript.init();`,
                ``,
                `  if (!(await blueFoxScript.tabs.get("https://www.google.com").length)) {`,
                `    await blueFoxScript.tabs.create("https://www.google.com");`,
                `    await sleep(1000);`,
                `  }`,
                ``,
                `  let tab = await blueFoxScript.tabs.get("https://www.google.com")[0];`,
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
                `      return JSON.stringify([...document.querySelectorAll("#search a[data-jsarwt='1']")]`,
                `        .filter((_) => {`,
                `          return _.querySelector("h3");`,
                `        })`,
                `        .map((_) => {`,
                `          return {`,
                `            href: _.href,`,
                `            title: _.querySelector("h3").textContent,`,
                `          }`,
                `        }))`,
                `    }`,
                `  );`,
                `  log(JSON.parse(search_result.result.value));`,
                `})();`,
              ].join("\n"),
              language: "javascript",
              tabSize: 2,
            });
          });
        },
      });
      BlueFoxJs.Sync.view();
    }
  })();
}
