// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
    window.BlueFox ? null : (window.BlueFox = {});
    let log = (...args) => {
      console.log("blue-fox.js", ...args);
    };
    log("loaded");

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

    window.BlueFox.v1 = class {
      constructor(J) {
        this.J = J;
        this.take = [];
        this.actions = J.actions;
        this.dispatchEvents = J.dispatchEvents;
        this.msec = J.sleep;
        this.sleep = (msec) =>
          new Promise((resolve) => setTimeout(resolve, msec));

        this.actionHandler = {
          set: async (action) => {
            let e = document.querySelector(action.target);
            if (e) {
              if (action.property) {
                for (let propertyPath in action.property) {
                  let found = getProperty(propertyPath, e);
                  if (found.object) {
                    found.object[found.property] =
                      action.property[propertyPath];
                    for (let eventType of this.dispatchEvents) {
                      e.dispatchEvent(new Event(eventType));
                    }
                  }
                }
              }
              if (action.attribute) {
                for (let attributeName in action.attribute) {
                  e.setAttribute(
                    attributeName,
                    action.attribute[attributeName]
                  );
                  for (let eventType of this.dispatchEvents) {
                    e.dispatchEvent(new Event(eventType));
                  }
                }
              }
            }
          },
          take: async (action) => {
            let e = document.querySelector(action.target);
            if (e) {
              let take = action;
              if (action.property) {
                let take_property = {};
                for (let propertyPath in action.property) {
                  let found = getProperty(propertyPath, e);
                  if (found.object) {
                    take_property[propertyPath] = found.object[found.property];
                  }
                }
                Object.assign(take, {
                  property: take_property,
                });
              }
              if (action.attribute) {
                let take_attribute = {};
                for (let attributeName in action.attribute) {
                  take_attribute[attributeName] = e.getAttribute(attributeName);
                }
                Object.assign(take, {
                  attribute: take_attribute,
                });
              }
              this.take.push(take);
            }
          },
          eval: async (action) => {
            let e = document.querySelector(action.target);
            if (e) {
              if (action.property) {
                for (let propertyPath in action.property) {
                  let found = getProperty(propertyPath, e);
                  if (found.object) {
                    found.object[found.property](action.property[propertyPath]);
                  }
                }
              }
            }
          },
          capture: async (action) => {
            let e = document.querySelector(action.target);
            if (e) {
              try {
                await window.BlueFox.captureDOM(
                  action.fileName,
                  e,
                  window,
                  action.format,
                  action.quality
                );
              } catch {}
            }
          },
          sleep: async (action) => {
            await this.sleep(action.target);
          },
          event: async (action) => {
            let e = document.querySelector(action.target);
            if (e) {
              e.dispatchEvent(new Event(action.dispatchEvent));
            }
          },
          save: async (action) => {
            let R = J;
            Object.assign(R, {
              takes: this.take,
            });
            Object.assign(document.createElement("a"), {
              href: window.URL.createObjectURL(
                new Blob([JSON.stringify(R)], { type: "application/json" })
              ),
              download: `${action.fileName}.json`,
            }).click();
            this.take = [];
          },
        };
      }
      async do() {
        for (let action of this.actions) {
          await this.actionHandler[action.type](action);
          this.msec != 0 ? await this.sleep(this.msec) : null;
        }
        return this.take;
      }
    }


  })();
}
