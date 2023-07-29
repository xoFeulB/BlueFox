// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  let log = (...args) => {
    console.log("postMessage.awaitable.js", ...args);
  };

  window.Connector = class {
    constructor(tabId) {
      this.tabId = tabId;
      this.connector = null;
      this.postPool = {};
      if (tabId) {
        this.load(tabId);
      }
    }

    async load(tabId) {
      this.tabId = tabId;
      this.connector = await chrome.tabs.connect(tabId);
      this.connector.onMessage.addListener((P) => {
        if (Object.keys(this.postPool).includes(P.uuid)) {
          this.postPool[P.uuid](P);
          delete this.postPool[P.uuid];
        }
      });
      this.connector.onDisconnect.addListener((P) => {
        this.connector = null;
      });
    }

    async post(P) {
      let uuid = crypto.randomUUID();

      let R = new Promise((resolve, reject) => {
        this.postPool[uuid] = (_) => {
          resolve(_);
        };
      });

      if (!this.connector) {
        await this.load(this.tabId);
      }
      this.connector.postMessage(
        Object.assign(P, {
          uuid: uuid,
        })
      );

      return R;
    }
  };
}
