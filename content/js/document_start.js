// © BlueFoxEnterprise
// https://github.com/xoFeulB

{
  (async () => {
    let log = (...args) => {
      // console.log("page_observer.js", ...args);
    };

    log("loaded");

    sessionStorage.uuid = null;
    let windowOnLoad = new Promise((resolve) => {
      let load = async (event) => {
        window.removeEventListener("load", load);
        resolve(crypto.randomUUID());
      };
      window.addEventListener("load", load);
    });

    let messageHandler = {
      "Tab.windowOnLoad": async (message, connector) => {
        sessionStorage.uuid = await windowOnLoad;
        return sessionStorage.uuid;
      }
    };
    chrome.runtime.onConnect.addListener((connector) => {
      connector.onMessage.addListener(async (message) => {
        try {
          let R = await messageHandler[message.type](
            message,
            connector,
          );
          connector.postMessage({
            uuid: message.uuid,
            type: message.type,
            object: R,
          });
        } catch (err) {
          log(message, err);
        }
      });
    });
  })();
}
