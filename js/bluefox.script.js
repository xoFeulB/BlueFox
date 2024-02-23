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

  // interface
  async runRemoteScript() { }
  async getRemoteFile() { }

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
                let R = new (class extends BlueFoxJs.Automation.BlueFoxScript {
                  constructor() {
                    super(config);
                    this.connector = new Connector();
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
      create: async (url, msec = 1000, option = {
        focused: false,
        top: 0,
        left: 0,
      }) => {
        let created = await chrome.windows.create(
          Object.assign(
            {
              url: url,
            }, option
          )
        );
        await sleep(msec);
        await this.tabs.reload();

        let tab = this.tabs.info.filter((_) => {
          return _.id == created.tabs[0].id;
        })[0];
        return tab;
      },
    };
    await this.tabs.reload();
    return this;
  }
};
