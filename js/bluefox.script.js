// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { Connector } from "/js/postMessage.awaitable.module.js";

("use strict");
let log = console.log;
let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

export class BlueFoxScript {
  constructor() {
    this.tabs = {};
    this.connector = new Connector();
  }

  async runRemoteScript() { }

  async init() {
    this.tabs = {
      info: {},
      reload: async () => {
        this.tabs.info = await (async () => {
          let tabInfo = [
            ...(await chrome.tabs.query({ url: "<all_urls>" })),
          ].map((_) => {
            _.url = new URL(_.url);
            _.dispatch = {
              script: async (callable) => {
                await this.connector.load(_.id);
                return (await this.connector.post({
                  type: "BlueFox.Dispatch.Script",
                  object: `(${callable.toString()})();`,
                })).object;
              },
              action: async (object) => {
                await this.connector.load(_.id);
                return await this.connector.post({
                  type: "BlueFox.Dispatch.Action",
                  object: JSON.stringify(object),
                });
              },
              screenshot: async (config = {
                format: "png",
                captureBeyondViewport: true,
              }) => {
                await this.connector.load(_.id);
                return await this.connector.post({
                  type: "BlueFox.CaptureWindow",
                  object: config,
                });
              },
              tails: (config) => {
                let R = new (class {
                  constructor() {
                    this.selector = "";
                    this.tail = {};
                    this.init(config);
                    this.connector = new Connector();
                    return BlueFoxJs.Util.l8.liquify(this);
                  }
                  init(config) {
                    this.tail = Object.assign({
                      meta: {
                        version: 1,
                      },
                      sleep: 0,
                      dispatchEvents: [
                        {
                          option: {
                            eventObject: "Event",
                            eventType: "change",
                            eventArgs: {
                              bubbles: true
                            }
                          }
                        },
                        {
                          option: {
                            eventObject: "Event",
                            eventType: "input",
                            eventArgs: {
                              bubbles: true
                            }
                          }
                        }
                      ],
                      actions: []
                    }, config);
                    this.stack = [];
                    return this;
                  }
                  target(selector) {
                    this.selector = selector;
                    return this;
                  }
                  defined(selector) {
                    this.selector = `:is([bluefox-label="${selector}"],[aria-description="${selector}"],[aria-label="${selector}"])`;
                    return this;
                  }
                  set(object) {
                    this.tail.actions.push(
                      {
                        type: "set",
                        target: {
                          selector: this.selector,
                          property: null,
                          all: false
                        },
                        option: object
                      }
                    );
                    return this;
                  }
                  setProperty(object) {
                    this.tail.actions.push(
                      {
                        type: "set",
                        target: {
                          selector: this.selector,
                          property: null,
                          all: false
                        },
                        option: {
                          property: object,
                        }
                      }
                    );
                    return this;
                  }
                  setAttribute(object) {
                    this.tail.actions.push(
                      {
                        type: "set",
                        target: {
                          selector: this.selector,
                          property: null,
                          all: false
                        },
                        option: {
                          attribute: object,
                        }
                      }
                    );
                    return this;
                  }
                  call(property, object) {
                    this.tail.actions.push(
                      {
                        type: "call",
                        target: {
                          selector: this.selector,
                          property: property,
                        },
                        option: object
                      }
                    );
                    return this;
                  }
                  event(object) {
                    this.tail.actions.push(
                      {
                        type: "event",
                        target: {
                          selector: this.selector,
                          property: null,
                        },
                        option: object
                      }
                    );
                    return this;
                  }
                  focus(property, reset = false) {
                    this.tail.actions.push(
                      {
                        type: "focus",
                        target: {
                          selector: this.selector,
                          property: property,
                          reset: reset,
                        },
                      }
                    );
                    return this;
                  }
                  capture(
                    selector = this.selector,
                    object = {
                      fileName: "capture",
                      format: "png",
                      quality: 100
                    }
                  ) {
                    this.tail.actions.push(
                      {
                        type: "capture",
                        target: {
                          selector: selector,
                          property: null,
                        },
                        option: object
                      }
                    );
                    return this;
                  }
                  key(object) {
                    this.tail.actions.push(
                      {
                        type: "key",
                        option: object
                      }
                    );
                    return this;
                  }
                  open(url) {
                    this.tail.actions.push(
                      {
                        type: "open",
                        option: { url: url }
                      }
                    );
                    return this;
                  }
                  sleep(msec) {
                    this.tail.actions.push(
                      {
                        type: "sleep",
                        option: {
                          msec: msec
                        }
                      }
                    );
                    return this;
                  }
                  file(object) {
                    this.tail.actions.push(
                      {
                        type: "file",
                        target: {
                          selector: this.selector,
                        },
                        files: object
                      }
                    );
                    return this;
                  }
                  async pushProperties(selector = this.selector) {
                    await this.connector.load(_.id);
                    let message = await this.connector.post({
                      type: "BlueFox.GetElementProperties",
                      object: {
                        selector: selector,
                      },
                    });
                    this.stack.push(message.object);
                    return this;
                  }
                  async getProperties(selector = this.selector) {
                    await this.connector.load(_.id);
                    let message = await this.connector.post({
                      type: "BlueFox.GetElementProperties",
                      object: {
                        selector: selector,
                      },
                    });
                    return message.object;
                  }
                  async run(object) {
                    await _.dispatch.action(
                      Object.assign(this.tail, object)
                    );
                    return this;
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
                })();
                return R;
              }
            };
            return _;
          });
          return tabInfo;
        })();
      },
      get: (regexp) => {
        let regexp_object = new RegExp(regexp, "g");
        return this.tabs.info.filter((_) => {
          return regexp_object.test(_.url.href);
        });
      },
      getFocused: () => {
        let regexp_object = new RegExp(regexp, "g");
        return this.tabs.info.filter((_) => {
          return regexp_object.test(_.url.href);
        });
      },
      create: async (url, option = {
        focused: false,
        top: 0,
        left: 0,
      }) => {
        await chrome.windows.create(
          Object.assign(
            {
              url: url,
            }, option
          )
        );
      },
    };
    await this.tabs.reload();
    chrome.tabs.onUpdated.addListener(this.tabs.reload);
    chrome.tabs.onRemoved.addListener(this.tabs.reload);
  }
};
