// © LobeliaSecurity™
// https://github.com/LobeliaSecurity
{
  let log = (...args) => {
    console.log("sync-view.js", ...args);
  };
  (async () => {
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
    let syncView = {
      "[capture]": async (e) => {
        let target = document.querySelector(e.attributes["capture"].value);
        let targetTagName = target.tagName.toLowerCase();

        e.setAttribute("sync", "");
        e.setAttribute("sync-to-this", "");

        if (targetTagName == "input") {
          e.setAttribute("sync-to-property", "textContent");
          e.setAttribute("sync-from", e.attributes["capture"].value);
          e.setAttribute("sync-from-property", "value");
          e.setAttribute(
            "sync-event",
            JSON.stringify(["sync", "input", "change"])
          );
        } else if (targetTagName == "select") {
          e.setAttribute("sync-to-property", "textContent");
          e.setAttribute("sync-from", e.attributes["capture"].value);
          e.setAttribute("sync-from-property", "selectedOptions.0.textContent");
          e.setAttribute("sync-event", JSON.stringify(["sync", "change"]));
        }

        e.removeAttribute("capture");
      },
      "sync,[sync]": async (e) => {
        let init = () => {
          __init__();
        };
        let __init__ = () => {
          e.SyncView = {
            from: e.attributes["sync-from-this"]
              ? e
              : document.querySelector(e.attributes["sync-from"].value),
            fromProperty: e.attributes["sync-from-property"].value,
            to: e.attributes["sync-to-this"]
              ? e
              : document.querySelector(e.attributes["sync-to"].value),
            toProperty: e.attributes["sync-to-property"].value,
            event: JSON.parse(e.attributes["sync-event"].value),
            entryNop: e.attributes["sync-entry-nop"],
            init: init,
          };

          e.SyncView.sync = () => {
            let fromObj = getProperty(e.SyncView.fromProperty, e.SyncView.from);
            let toObj = getProperty(e.SyncView.toProperty, e.SyncView.to);
            try {
              toObj.object[toObj.property] = fromObj.object[fromObj.property];
            } catch {}
          };
          e.SyncView.entryNop ? null : e.SyncView.sync();

          e.SyncView.event.forEach((eventType) => {
            e.SyncView.from.addEventListener(eventType, (event) => {
              e.SyncView.sync();
              e.SyncView.to.dispatchEvent(new Event("sync"));
            });
          });
        };
        init();
      },
    };
    let queryWalker = new QueryWalker(syncView, document);
    await queryWalker.do();
  })();
}
