{
  (async () => {
    let log = console.log;
    let browser = chrome ? chrome : browser;

    let values = {
      Copyright: `© ${new Date().getFullYear()} LobeliaSecurity™`,
      Version: `v${chrome.runtime.getManifest().version}`,
    };
    let sendMessage = async (arg) => {
      try {
        return await browser.runtime.sendMessage(arg);
      } catch (err) {
        log(err);
      }
    };

    let oDict = {
      "[set]": async (e) => {
        e.textContent = values[e.attributes.set.value];
      },
      "#debuggerStatus": async (e) => {
        e.updateDebuggerStatus = async () => {
          if (
            await sendMessage({
              type: "Debugger.isDebuggingSomeTab",
              object: {},
            })
          ) {
            e.value = "avatar-presence online";
          } else {
            e.value = "avatar-presence offline";
          }
          e.dispatchEvent(new Event("sync"));
        };
        document.body.addEventListener("mouseenter", (event) => {
          e.updateDebuggerStatus();
        });
        e.updateDebuggerStatus();
      },
      "#tabControll": async (e) => {
        if (localStorage.tabControll) {
          e.value = localStorage.tabControll;
        }
        e.addEventListener("change", (event) => {
          localStorage.tabControll = e.value;
        });
      },
      "[showWhenSome]": async (e) => {
        let target = document.querySelector(e.attributes["showWhenSome"].value);
        let values = JSON.parse(e.attributes["showWhenSome-values"].value).map(
          (_) => {
            return `${_}`;
          }
        );

        target.addEventListener("change", (event) => {
          if (values.includes(`${target.value}`)) {
            e.removeAttribute("hide");
          } else {
            e.setAttribute("hide", "");
          }
        });
        target.dispatchEvent(new Event("change"));
        e.removeAttribute("showWhenSome");
        e.removeAttribute("showWhenSome-value");
      },
      "[setValueOnClick]": async (e) => {
        let target = document.querySelector(
          e.attributes["setValueOnClick"].value
        );
        e.addEventListener("click", (event) => {
          target.value = e.attributes.value.value;
          target.dispatchEvent(new Event("change"));
        });
      },
      "#AddMatchURL": async (e) => {
        e.add = (url = "") => {
          let clone = document
            .querySelector("[templates] template#MatchUrl_tr")
            .content.cloneNode(true);
          clone.querySelector("input").value = url;
          clone.querySelector("[setValueOnClick]").setAttribute("value", url);
          let MatchUrl = clone.querySelector("[MatchUrl]");
          MatchUrl.addEventListener("input", (event) => {
            MatchUrl.closest("tr")
              .querySelector("[setValueOnClick]")
              .setAttribute("value", MatchUrl.value);
            try {
              new RegExp(MatchUrl.value);
              MatchUrl.setCustomValidity("");
              document
                .querySelector("[MatchURL_loading]")
                .removeAttribute("hide");
              chrome.storage.local.set(
                {
                  BlueFoxSetting_url: JSON.stringify(
                    [
                      ...document.querySelectorAll(
                        "#MatchURLAccordion [MatchUrl]"
                      ),
                    ]
                      .filter((_) => {
                        return _.checkValidity();
                      })
                      .map((_) => {
                        return _.value;
                      })
                      .filter((_) => {
                        return _;
                      })
                  ),
                },
                function () {
                  document
                    .querySelector("[MatchURL_loading]")
                    .setAttribute("hide", "");
                  document
                    .querySelector("#debuggerStatus")
                    .updateDebuggerStatus();
                }
              );
            } catch (err) {
              MatchUrl.setCustomValidity("invalid RegExp");
              MatchUrl.reportValidity();
            }
          });

          queryWalker.do(clone);
          document
            .querySelector("#MatchURLAccordion table>tbody")
            .appendChild(clone);
        };
        e.addEventListener("click", (event) => {
          e.add();
          document.querySelector("#debuggerStatus").updateDebuggerStatus();
        });
      },
      "[deleteMatchURL]": async (e) => {
        e.addEventListener("click", (event) => {
          let removeControll = document.querySelector("#removeControll").value;
          document.querySelector("[MatchURL_loading]").removeAttribute("hide");
          chrome.storage.local.get("BlueFoxSetting_url", function (items) {
            blueFoxSetting_url = JSON.parse(
              items.BlueFoxSetting_url ? items.BlueFoxSetting_url : "[]"
            );
            chrome.storage.local.set(
              {
                BlueFoxSetting_url: JSON.stringify(
                  blueFoxSetting_url.filter((_) => {
                    return _ != removeControll;
                  })
                ),
              },
              function () {
                document
                  .querySelector("[MatchURL_loading]")
                  .setAttribute("hide", "");
                document
                  .querySelector("#debuggerStatus")
                  .updateDebuggerStatus();
              }
            );
          });
          document
            .querySelector(`tr:has([value='${removeControll}'])`)
            .remove();
          document.querySelector(".modal [aria-label='Close']").click();
        });
      },
    };
    let queryWalker = new QueryWalker(oDict, document);
    await queryWalker.do();

    chrome.storage.local.get("BlueFoxSetting_url", function (items) {
      let BlueFoxSetting_url = JSON.parse(
        items.BlueFoxSetting_url ? items.BlueFoxSetting_url : "[]"
      );
      BlueFoxSetting_url.forEach((url) => {
        document.querySelector("#AddMatchURL").add(url);
      });
    });
  })();
}
