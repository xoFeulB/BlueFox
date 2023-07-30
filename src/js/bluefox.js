// © LobeliaSecurity™
// https://github.com/LobeliaSecurity

{
  (async () => {
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

    let v0 = class {
      constructor() {
        this.J = null;
        this.take = [];
        this.actions = null;
        this.dispatchEvents = null;
        this.msec = null;

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
                      e.dispatchEvent(new Event(eventType, { bubbles: true }));
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
                    e.dispatchEvent(new Event(eventType, { bubbles: true }));
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
              e.dispatchEvent(
                new Event(action.dispatchEvent, { bubbles: true })
              );
            }
          },
          save: async (action) => {
            let R = this.J;
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
      async do(J) {
        log(J);
        this.J = J;
        this.take = [];
        this.actions = J.actions;
        this.dispatchEvents = J.dispatchEvents;
        this.msec = J.sleep;

        for (let action of this.actions) {
          await this.actionHandler[action.type](action);
          this.msec != 0 ? await this.sleep(this.msec) : null;
        }
        return this.take;
      }
    };

    let v1 = class {
      constructor() {
        this.J = null;
        this.stack = [];
        this.actions = null;
        this.dispatchEvents = null;
        this.msec = null;
        this.focus = document;

        this.sleep = (msec) =>
          new Promise((resolve) => setTimeout(resolve, msec));

        this.actionHandler = {
          set: async (action) => {
            let e = this.focus.querySelector(action.target.selector);
            if (e) {
              if (action?.target?.property) {
                let _ = getProperty(action.target.property, e);
                if (_.object) {
                  e = _.object[_.property];
                }
              }

              if (action?.option?.property) {
                for (let propertyPath in action.option.property) {
                  let found = getProperty(propertyPath, e);
                  if (found.object) {
                    found.object[found.property] =
                      action.option.property[propertyPath];

                    for (let dispatchEvent of this.dispatchEvents) {
                      let _ = getProperty(
                        dispatchEvent.option.eventObject,
                        window
                      );
                      let event = _.object[_.property];
                      e.dispatchEvent(
                        new event(
                          dispatchEvent.option.eventType,
                          dispatchEvent.option.eventArgs
                        )
                      );
                    }
                  }
                }
              }
              if (action?.option?.attribute) {
                for (let attributeName in action.option.attribute) {
                  e.setAttribute(
                    attributeName,
                    action.option.attribute[attributeName]
                  );

                  for (let dispatchEvent of this.dispatchEvents) {
                    let _ = getProperty(
                      dispatchEvent.option.eventObject,
                      window
                    );
                    let event = _.object[_.property];
                    e.dispatchEvent(
                      new event(
                        dispatchEvent.option.eventType,
                        dispatchEvent.option.eventArgs
                      )
                    );
                  }
                }
              }
            }
          },
          push: async (action) => {
            let e = this.focus.querySelector(action.target.selector);
            if (e) {
              if (action?.target?.property) {
                let _ = getProperty(action.target.property, e);
                if (_.object) {
                  e = _.object[_.property];
                }
              }

              let stack = action;
              if (action?.option?.property) {
                let stack_property = {};
                for (let propertyPath in action.option.property) {
                  let found = getProperty(propertyPath, e);
                  if (found.object) {
                    stack_property[propertyPath] = found.object[found.property];
                  }
                }
                Object.assign(stack.option, {
                  property: stack_property,
                });
              }
              if (action?.option?.attribute) {
                let stack_attribute = {};
                for (let attributeName in action.option.attribute) {
                  stack_attribute[attributeName] =
                    e.getAttribute(attributeName);
                }
                Object.assign(stack.option, {
                  attribute: stack_attribute,
                });
              }
              this.stack.push(stack);
            }
          },
          call: async (action) => {
            let e = this.focus.querySelector(action.target.selector);
            if (e) {
              let _ = getProperty(action.target.property, e);
              if (_.object) {
                if (action?.option) {
                  _.object[_.property](action?.option);
                } else {
                  _.object[_.property]();
                }
              }
            }
          },
          event: async (action) => {
            let e = this.focus.querySelector(action.target.selector);
            if (e) {
              if (action?.target?.property) {
                let _ = getProperty(action.target.property, e);
                if (_.object) {
                  e = _.object[_.property];
                }
              }

              let _ = getProperty(dispatchEvent.option.eventObject, window);
              let event = _.object[_.property];

              e.dispatchEvent(
                new event(action.option.eventType, action.option.eventArgs)
              );
            }
          },
          sleep: async (action) => {
            await this.sleep(action.option.msec);
          },
          open: async (action) => {
            window.location.assign(action.option.url);
          },
          focus: async (action) => {
            let e = this.focus.querySelector(action.target.selector);
            if (e) {
              if (action?.target?.property) {
                let _ = getProperty(action.target.property, e);
                if (_.object) {
                  e = _.object[_.property];
                }
              }
              this.focus = e;
            }
            if (action.option.reset) {
              this.focus = document;
            }
          },
          capture: async (action) => {
            let e = this.focus.querySelector(action.target.selector);
            if (e) {
              if (action?.target?.property) {
                let _ = getProperty(action.target.property, e);
                if (_.object) {
                  e = _.object[_.property];
                }
              }

              try {
                await window.BlueFox.captureDOM(
                  action.option.fileName,
                  e,
                  window,
                  action.option.format,
                  action.option.quality
                );
              } catch (err) {
                log(err);
              }
            }
          },
          save: async (action) => {
            let R = this.J;
            Object.assign(R, {
              stack: this.stack,
            });
            Object.assign(this.focus.createElement("a"), {
              href: window.URL.createObjectURL(
                new Blob([JSON.stringify(R, null, 4)], {
                  type: "application/json",
                })
              ),
              download: `${action.option.fileName}.json`,
            }).click();
            this.stack = [];
          },
        };
      }
      async do(J) {
        log(J);
        this.J = J;
        this.stack = [];
        this.actions = J.actions;
        this.dispatchEvents = J.dispatchEvents;
        this.msec = J.sleep;

        for (let action of this.actions) {
          await this.actionHandler[action.type](action);
          this.msec != 0 ? await this.sleep(this.msec) : null;
        }
        return this.stack;
      }
    };

    window.BlueFox = class {
      async do(J) {
        await {
          0: async () => {
            let _ = new v0();
            return _.do(J);
          },
          1: async () => {
            let _ = new v1();
            return _.do(J);
          },
        }[J.meta.version]();
      }
    };
  })();
}
