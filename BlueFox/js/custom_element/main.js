// © BlueFoxEnterprise
// https://github.com/xoFeulB

window.customElements.define("set-value-on-click", class extends HTMLElement {
  getProperty(_path, _obj, _sep = ".") {
    let _key = _path.split(_sep)[0];
    let _next_path = _path.split(_sep).slice(1).join(_sep);
    if (_obj[_key] != undefined) {
      let R = this.getProperty(_next_path, _obj[_key], _sep);
      if (R === true) {
        return {
          object: _obj,
          property: _key,
          path: _path,
          separator: _sep,
          value: _obj[_key],
        };
      } else {
        return R;
      }
    } else {
      if (_path == _next_path) {
        return true;
      } else {
        return false;
      }
    }
  };
  connectedCallback() {
    let target = {};
    target.separator = this.attributes.separator ? this.attributes.separator.value : ".";
    target.path = this.attributes.target.value.split(target.separator);
    target.element = (() => {
      if (target.path[0] == "this") {
        return this;
      }
      if (target.path[0] == "window") {
        return window;
      }
      return document.querySelector(target.path[0]);
    })();
    target.property = target.path.slice(1).join(target.separator);
    target.object = this.getProperty(
      target.property,
      target.element,
      target.separator
    );

    this.addEventListener("click", async (event) => {
      if (target.object.object[target.object.property] != this.attributes.value.value) {
        try {
          await Promise.all([
            ...document.querySelectorAll("show-when")
          ].map((_) => {
            return new Promise((resolve, reject) => {
              if (_.animating) {
                let onshow = (event) => {
                  _.removeEventListener("show", onshow);
                  resolve();
                };
                _.addEventListener("show", onshow);
                setTimeout(() => {
                  _.removeEventListener("show", onshow);
                  reject();
                }, 1000);
              } else {
                resolve();
              }
            });
          }));
          target.object.object[target.object.property] = this.attributes.value.value;
          target.element.dispatchEvent(new Event("change"));
        } catch (e) { }
      }
    });
  }
});

window.customElements.define("show-when", class extends HTMLElement {
  async sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  };

  getProperty(_path, _obj, _sep = ".") {
    let _key = _path.split(_sep)[0];
    let _next_path = _path.split(_sep).slice(1).join(_sep);
    if (_obj[_key] != undefined) {
      let R = this.getProperty(_next_path, _obj[_key], _sep);
      if (R === true) {
        return {
          object: _obj,
          property: _key,
          path: _path,
          separator: _sep,
          value: _obj[_key],
        };
      } else {
        return R;
      }
    } else {
      if (_path == _next_path) {
        return true;
      } else {
        return false;
      }
    }
  };

  async none() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "1.0",
            }
          ],
          {
            duration: 0,
            fill: 'forwards',
          }
        );
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "0.0",
            }
          ],
          {
            duration: 0,
            fill: 'forwards',
          }
        );
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async fade() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              easing: 'ease-in-out'
            },
            {
              opacity: "0.0",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async left() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              transform: "translateX(-10px)",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              transform: "translateX(0px)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              transform: "translateX(0px)",
              easing: 'ease-in-out'
            },
            {
              opacity: "0.0",
              transform: "translateX(-10px)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async right() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              transform: "translateX(10px)",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              transform: "translateX(0px)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              transform: "translateX(0px)",
              easing: 'ease-in-out'
            },
            {
              opacity: "0.0",
              transform: "translateX(10px)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async bottom() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              transform: "translateY(10px)",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              transform: "translateY(0)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              transform: "translateY(0)",
              easing: 'ease-in-out'
            },
            {
              opacity: "0.0",
              transform: "translateY(10px)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async top() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              transform: "translateY(-10px)",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              transform: "translateY(0)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              transform: "translateY(0)",
              easing: 'ease-in-out'
            },
            {
              opacity: "0.0",
              transform: "translateY(-10px)",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async roll() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              rotate: "-360deg",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              rotate: "0deg",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              rotate: "0deg",
              easing: 'ease-in-out'
            },
            {
              opacity: "0.0",
              rotate: "360deg",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async loll() {
    if (this.regex.test(this.target.object.object[this.target.object.property])) {
      if (this.attributes.hidden) {
        await this.sleep(this.inDuration + 10);
        this.removeAttribute("hidden");
        this.animate(
          [
            {
              opacity: "0.0",
              rotate: "360deg",
              easing: 'ease-in-out'
            },
            {
              opacity: "1.0",
              rotate: "0deg",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.inDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.inDuration);
        this.dispatchEvent(new Event("show"));
      }
    } else {
      if (!this.attributes.hidden) {
        this.animate(
          [
            {
              opacity: "1.0",
              rotate: "0deg",
              easing: 'ease-in-out'
            },
            {
              rotate: "-360deg",
              easing: 'ease-in-out'
            }
          ],
          {
            duration: this.outDuration,
            fill: 'forwards',
          }
        );
        await this.sleep(this.outDuration + 10);
        this.setAttribute("hidden", "");
        this.dispatchEvent(new Event("hidden"));
      }
    }
  }
  async connectedCallback() {
    this.animating = false;
    this.setAttribute("hidden", "");
    this.animate(
      [
        {
          opacity: "0.0",
        }
      ],
      {
        duration: 0,
        fill: 'forwards',
      }
    );
    let _in = (this.attributes.in ? this.attributes.in.value : "none.0").split(".");
    let _out = (this.attributes.out ? this.attributes.out.value : "none.0").split(".");
    this.in = _in[0];
    this.out = _out[0];
    this.inDuration = Number(_in[1]);
    this.outDuration = Number(_out[1]);

    this.target = {};
    this.target.separator = this.attributes.separator ? this.attributes.separator.value : ".";
    this.target.path = this.attributes.target.value.split(this.target.separator);
    this.target.element = (() => {
      if (this.target.path[0] == "this") {
        return this;
      }
      if (this.target.path[0] == "window") {
        return window;
      }
      return document.querySelector(this.target.path[0]);
    })();
    this.target.property = this.target.path.slice(1).join(this.target.separator);
    this.target.object = this.getProperty(
      this.target.property,
      this.target.element,
      this.target.separator
    );
    this.target.events = JSON.parse(
      this.attributes.events
        ? this.attributes.events.value
        : '["change"]'
    );
    this.regex = new RegExp(this.attributes.regex?.value);

    let eventHandler = async () => {
      if (!this.animating) {
        this.animating = true;
        if (this.attributes.hidden) {
          await this[this.in]();
        } else if (!this.attributes.hidden) {
          await this[this.out]();
        }
        this.animating = false;
      }
    };
    this.target.events.forEach((eventType) => {
      this.target.element.addEventListener(eventType, eventHandler);
    });
    this.target.element.addEventListener("noAnimation", async () => {
      if (!this.animating) {
        this.animating = true;
        await this.none();
        this.animating = false;
      }
    });

    await eventHandler();
  }
});

