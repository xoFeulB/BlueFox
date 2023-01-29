{
  (async () => {
    let log = console.log;
    let browser = chrome ? chrome : browser;
    let sendMessage = async (arg) => {
      try {
        return await browser.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let oDict = {
      "#refresh": async (e) => {
        e.reflesh = async () => {
          let out = document.querySelector("[debuggee]>ol");
          let debuggee = await sendMessage({
            type: "Debugger.getDebuggee",
            object: {},
          });
          out.innerHTML = "";
          Object.keys(debuggee).forEach((_) => {
            out.appendChild(
              Object.assign(document.createElement("li"), {
                textContent: debuggee[_].url,
              })
            );
          });
        };
        e.reflesh();
        e.addEventListener("click", e.reflesh);
      },
    };

    let queryWalker = new QueryWalker(oDict, document);
    await queryWalker.do();
  })();
}
