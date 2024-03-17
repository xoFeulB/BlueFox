// © BlueFoxEnterprise
// https://github.com/xoFeulB

("use strict");
export class Connector {
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
      if (P.uuid in this.postPool) {
        this.postPool[P.uuid].resolve(P);
        delete this.postPool[P.uuid];
      }
    });
    this.connector.onDisconnect.addListener((P) => {
      Object.entries(this.postPool).forEach(([uuid, promise]) => {
        promise.reject();
      })
      this.connector = null;
    });
  }

  async post(P) {
    let uuid = crypto.randomUUID();
    let R = new Promise((resolve, reject) => {
      this.postPool[uuid] = {
        resolve: resolve,
        reject: reject
      };
    });

    this.connector.postMessage(
      Object.assign(P, {
        uuid: uuid,
      })
    );

    return R;
  }
}

