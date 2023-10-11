// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

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

    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
    let dropHandler = async (files) => {
      for (let f of files) {
        try {
          await sendMessage({
            type: "Debugger.attach",
          });
          await sendMessage({
            type: "Runtime.evaluate",
            object: {
              expression: await f.text(),
              objectGroup: "BlueFox-js-lanch",
            },
          });
        } catch {}
      }
    };
    /* Display */ {
      let oDict = {
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
        "button[RunScript]": async (e) => {
          window.ServerScriptOut = document.querySelector("[ServerScriptOut]");
          e.addEventListener("click", async (event) => {
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
        "[BlueFoxServerFileAttach]": async (e) => {
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
        "[ServerScript]": async (e) => {
          require.config({ paths: { vs: "/modules/monaco-editor/min/vs" } });
          require(["vs/editor/editor.main"], function () {
            window.MonacoEditor = monaco.editor.create(e, {
              value: "",
              language: "javascript",
            });
          });
        },
      };
      let queryWalker = new QueryWalker(oDict, document);
      await queryWalker.do();
    }
  })();
}
