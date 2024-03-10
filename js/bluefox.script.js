// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { Connector } from "/js/postMessage.awaitable.module.js";

("use strict");
let log = console.log;
let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

class LimitedArray extends (Array) {
  constructor(limit) {
    super();
    this.limit = limit;
  }
  append(object) {
    this.push(object);
    if (this.limit < this.length) {
      this.shift();
    }
  }
  flush() {
    this.splice(0);
  }
}

class Tab {
  constructor(tabInfo, responsesLimit = 3) {
    try {
      tabInfo.url = new URL(tabInfo.url);
    } catch (e) { }
    this.info = tabInfo;
    this.responses = new LimitedArray(responsesLimit);
    this.cookie = {
      get: async (option) => {
        let R = await chrome.cookies.getAll(Object.assign({ domain: this.info.url.hostname }, option));
        return R;
      },
      set: async (cookie) => {
        let R = await chrome.cookies.set(Object.assign({ url: this.info.url.href }, cookie));
        return R;
      },
      remove: async (cookie) => {
        let R = await chrome.cookies.remove(Object.assign({ url: this.info.url.href }, cookie));
        return R;
      },
    };
    this.keepResponses = true;

    this.tails = (config) => {
      return new (
        class extends (BlueFoxJs.Automation.BlueFoxScript) {
          constructor() {
            super(config);
            return this;
          }
          async getProperties(selector = this.selector) {
            let connector = new Connector();
            await connector.load(tabInfo.id);
            let message = await connector.post({
              type: "BlueFox.GetElementProperties",
              object: {
                selector: selector,
              },
            });
            return message.object;
          }
          async run(object) {
            let connector = new Connector();
            await connector.load(tabInfo.id);
            let R = await connector.post({
              type: "BlueFox.Dispatch.Action",
              object: JSON.stringify(Object.assign(this.tail, object)),
            });
            return R.object;
          }
          async runTillNextOnLoad(object, max_polling = 20) {
            let connector = new Connector();
            let uuid_prev = await new Promise((resolve, reject) => {
              let polling_count = max_polling;
              let polling = () => {
                setTimeout(async () => {
                  try {
                    if (!polling_count--) {
                      reject();
                      return;
                    }
                    await connector.load(tabInfo.id);
                    let uuid = (await connector.post({
                      type: "Tab.windowOnLoad",
                      object: {},
                    })).object;
                    if (!uuid) {
                      polling();
                    } else {
                      resolve(uuid);
                    }
                  } catch (e) {
                    polling();
                  }
                }, 100)
              }
              polling();
            });
            await connector.load(tabInfo.id);
            let R = await connector.post({
              type: "BlueFox.Dispatch.Action",
              object: JSON.stringify(Object.assign(this.tail, object)),
            });
            return await new Promise((resolve, reject) => {
              let polling_count = max_polling;
              let polling = () => {
                setTimeout(async () => {
                  try {
                    if (!polling_count--) {
                      reject();
                      return;
                    }
                    await connector.load(tabInfo.id);
                    let uuid = (await connector.post({
                      type: "Tab.windowOnLoad",
                      object: {},
                    })).object;
                    if (!uuid || uuid_prev == uuid) {
                      polling();
                    } else {
                      resolve(await R);
                    }
                  } catch (e) {
                    polling();
                  }
                }, 100)
              }
              polling();
            });
          }
          saveTail(title, description, object) {
            let R = JSON.parse(JSON.stringify(this.tail));

            R.meta.title = title;
            R.meta.description = description;

            Object.assign(document.createElement("a"), {
              href: window.URL.createObjectURL(
                new Blob([JSON.stringify(Object.assign(R, object), null, 4)], {
                  type: "application/json",
                })
              ),
              download: `${title}.json`,
            }).click();
            return this;
          }
          saveJSON(file_name, object) {
            Object.assign(document.createElement("a"), {
              href: window.URL.createObjectURL(
                new Blob([JSON.stringify(object, null, 4)], {
                  type: "application/json",
                })
              ),
              download: `${file_name}.json`,
            }).click();
            return this;
          }
        }
      )();
    }
  }

  async attachDebugger() {
    try { await chrome.debugger.attach({ tabId: this.info.id }, "1.3"); } catch (e) { }
    try { await this.sendCommand("Network.enable"); } catch (e) { }
    this.isDebugging = true;
  }
  async detachDebugger() {
    try { await chrome.debugger.detach({ tabId: this.info.id }, "1.3"); } catch (e) { }
    try { await this.sendCommand("Network.disable"); } catch (e) { }
    this.isDebugging = false;
  }
  async setUserAgentOverride(parameters) {
    // https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-setUserAgentOverride
    return await this.sendCommand(
      "Network.setUserAgentOverride",
      parameters
    );
  }
  async sendCommand(command, parameters) {
    return await chrome.debugger.sendCommand(
      { tabId: this.info.id },
      command,
      parameters
    );
  }

  async close() {
    return await chrome.windows.remove(this.info.windowId);
  }
  async reload() {
    await chrome.tabs.reload(this.info.id);
  }
  async dispatchScript(callable) {
    let R = await chrome.debugger.sendCommand(
      { tabId: this.info.id },
      "Runtime.evaluate",
      {
        expression: `(${callable.toString()})();`,
        objectGroup: "BlueFox-js-lanch",
        awaitPromise: true,
        returnByValue: true,
      }
    );
    return R;
  }
  async dispatchAction(object) {
    let connector = new Connector();
    await connector.load(this.info.id);
    return await connector.post({
      type: "BlueFox.Dispatch.Action",
      object: JSON.stringify(object),
    });
  }
  async captureScreenshot(config = { format: "png", captureBeyondViewport: true }) {
    return await chrome.debugger.sendCommand(
      { tabId: this.info.id },
      "Page.captureScreenshot",
      config
    );
  }
  async dispatchScriptTillTrue(callable, max_polling = 20) {
    return new Promise((resolve, reject) => {
      let polling_count = max_polling;
      let polling = () => {
        setTimeout(async () => {
          try {
            if (!polling_count--) {
              reject();
              return;
            }
            let R = await chrome.debugger.sendCommand(
              { tabId: this.info.id },
              "Runtime.evaluate",
              {
                expression: `(${callable.toString()})();`,
                objectGroup: "BlueFox-js-lanch",
                awaitPromise: true,
                returnByValue: true,
              }
            );

            if (!R.result.value) {
              polling();
            } else {
              resolve(R);
            }
          } catch (e) {
            polling();
          }
        }, 100)
      }
      polling();
    });
  }
  async addEventListeners(selector, event_type, callback) {
    let connector = new Connector();
    let uuid = crypto.randomUUID();
    await connector.load(this.info.id);
    connector.connector.onMessage.addListener((P) => {
      if (P.object.uuid == uuid) {
        callback(P.object.object);
      }
    });
    return (await connector.post({
      type: "BlueFoxScript.AddEventListener",
      object: {
        uuid: uuid,
        selector: selector,
        event_type: event_type
      },
    })).object;
  }
}

export class BlueFoxScript extends (Object) {
  constructor() {
    super();
    return new Promise((resolve, reject) => {
      this.init(resolve);
    });
  }

  async init(resolve) {
    /* Tab */{
      chrome.debugger.onDetach.addListener(
        async (source, reason) => {
          let handler = {
            "canceled_by_user": async (source) => {
              this[source.tabId].isDebugging = false;
            },
            "target_closed": async (source) => { },
          };
          if (reason in handler) {
            await handler[reason](source);
          }
        }
      );
      chrome.tabs.onRemoved.addListener(
        async (tabId, removeInfo) => {
          delete this[tabId];
        }
      );
      chrome.tabs.onUpdated.addListener(
        async (tabId, changeInfo, tab) => {
          if (tabId in this) {
            tab.url = new URL(tab.url);
            this[tabId].info = tab;
            if (!this[tabId].keepResponses && this[tabId].info.status == "loading") {
              this[tabId].responses.flush();
            }
            if (!this[tabId].isDebugging) {
              await this[tabId].attachDebugger();
            }
          } else {
            this[tab.id] = new Tab(tab);
            await this[tab.id].attachDebugger();
            await this[tab.id].setUserAgentOverride({ userAgent: "^.,.^ BlueFox" });
          }
        }
      );
      chrome.tabs.onCreated.addListener(
        async (tabInfo) => {
          this[tabInfo.id] = new Tab(tabInfo);
          await this[tabInfo.id].attachDebugger();
        }
      );

      [...(await chrome.tabs.query({ url: "<all_urls>" }))].forEach((tabInfo) => {
        this[tabInfo.id] = new Tab(tabInfo);
      });
    }

    /* Network */ {
      chrome.debugger.onEvent.addListener(
        async (source, method, params) => {
          let handler = {
            "Network.responseReceived": async () => {
              try {
                let responseBody = await chrome.debugger.sendCommand(
                  { tabId: source.tabId },
                  "Network.getResponseBody",
                  { requestId: params.requestId }
                );
                this[source.tabId].responses.append(
                  Object.assign(
                    params,
                    responseBody
                  )
                );
              } catch (e) {
                this[source.tabId].responses.append(
                  Object.assign(
                    params,
                    { exceptionDetails: e }
                  )
                );
              }
            }
          }
          if (method in handler) {
            await handler[method]();
          }
        }
      );
    }

    resolve(this);
  }

  // interface
  async runWorkspaceScript() { }
  async getWorkspaceFile() { }
  async runScript() { }

  findTab(regexp) {
    let regexp_object = new RegExp(regexp, "g");
    return Object.entries(this).filter(([key, tab]) => {
      return regexp_object.test(tab.info.url.href);
    }).map(([key, tab]) => {
      return tab;
    });
  }
  async createWindow(url, max_polling = 20, option = { focused: false, top: 0, left: 0 }) {
    let connector = new Connector();
    let created = await chrome.windows.create(
      Object.assign(
        {
          url: url,
        }, option
      )
    );

    await new Promise((resolve, reject) => {
      let polling_count = max_polling;
      let polling = () => {
        setTimeout(async () => {
          try {
            if (!polling_count--) {
              reject();
              return;
            }
            await connector.load(created.tabs[0].id);
            let uuid = (await connector.post({
              type: "Tab.windowOnLoad",
              object: {},
            })).object;
            if (!uuid) {
              polling();
            } else {
              resolve(uuid);
            }
          } catch (e) {
            polling();
          }
        }, 100)
      }
      polling();
    });
    return Object.entries(this).filter(([key, tab]) => {
      return tab.info.id == created.tabs[0].id;
    }).map(([key, tab]) => {
      return tab;
    })[0];
  }
}
