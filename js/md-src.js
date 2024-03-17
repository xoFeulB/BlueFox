// © BlueFoxEnterprise
// https://github.com/xoFeulB

import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { marked } from "/modules/marked/marked.esm.js";
import { default as highlight } from "/modules/highlight/es/highlight.min.js";

import bash from "/modules/highlight/es/languages/bash.min.js";
highlight.registerLanguage("language-bash", bash);
highlight.registerLanguage("language-sh", bash);
import css from "/modules/highlight/es/languages/css.min.js";
highlight.registerLanguage("language-css", css);
import javascript from "/modules/highlight/es/languages/javascript.min.js";
highlight.registerLanguage("language-bluefoxscript", javascript);
highlight.registerLanguage("language-javascript", javascript);
highlight.registerLanguage("language-js", javascript);
import json from "/modules/highlight/es/languages/json.min.js";
highlight.registerLanguage("language-json", json);
import markdown from "/modules/highlight/es/languages/markdown.min.js";
highlight.registerLanguage("language-markdown", markdown);
import powershell from "/modules/highlight/es/languages/powershell.min.js";
highlight.registerLanguage("language-powershell", powershell);
import sql from "/modules/highlight/es/languages/sql.min.js";
highlight.registerLanguage("language-sql", sql);
import xml from "/modules/highlight/es/languages/xml.min.js";
highlight.registerLanguage("language-xml", xml);

window.customElements.define("mark-down", class extends HTMLElement {
  constructor() {
    let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

    (async () => {
      super();
      let div = Object.assign(
        document.createElement("div"),
        {
          textContent: "^.,.^ < Oh, something went wrong."
        }
      );
      try {
        let r = await fetch(this.attributes.src.value);
        let text = await r.text();
        if (r.ok) {
          div.innerHTML = marked.parse(text);
        }
        await BlueFoxJs.Walker.walkHorizontally({
          _scope_: div,
          "h1,h2,h3,h4,h5": async ($) => {
            $.element.setAttribute("header-anchor", `#${$.element.textContent.toLocaleLowerCase().replaceAll(/[\(\)\.]/g, "").replaceAll(/[ ]/g, "-")}`);
          },
          "h1,h2,h3": async ($) => {
            $.element.classList.add("uk-heading-divider");
          },
          "h4,h5": async ($) => {
            $.element.classList.add("uk-heading-bullet");
          },
          "img": async ($) => {
            $.element.classList.add("radius");
            $.element.classList.add("uk-margin-bottom");
          },
          "a": async ($) => {
            if ($.element.getAttribute("href")[0] == "#") {
              let href = $.element.getAttribute("href");
              $.element.removeAttribute("href");
              $.element.addEventListener("click", (event) => {
                $.self._scope_.querySelector(`[header-anchor="${href}"]`);
                UIkit.scroll($.self._scope_).scrollTo($.self._scope_.querySelector(`[header-anchor="${href}"]`));
              })
            } else {
              $.element.setAttribute("target", "_blank");
              $.element.setAttribute("rel", "noopener noreferrer");
            }
          },
          "table": async ($) => {
            $.element.classList.add("uk-table", "uk-table-divider", "uk-table-small");
          },
          "code": async ($) => {
            $.element.closest("pre")?.classList?.add("radius");
            $.element.innerHTML = highlight.highlight(
              $.element.textContent,
              {
                language: $.element.className ? $.element.className : "language-sh",
              }
            ).value;

            let menu = Object.assign(
              document.createElement($.element.className ? "div" : "span"),
              {
                className: "code-menu"
              }
            );
            let menu_container = Object.assign(
              document.createElement($.element.className ? "div" : "span"),
              {
                className: $.element.className ? "code-menu-container-absolute" : "code-menu-container-relative"
              }
            );

            if ($.element.closest("bluefoxscript")) {
              let run_button = Object.assign(
                document.createElement("button"),
                {
                  className: "uk-icon-link uk-margin-small-right",
                }
              );
              run_button.setAttribute("uk-icon", "play-circle");
              run_button.setAttribute("title", "RunScript");
              run_button.setAttribute("uk-tooltip", "");
              run_button.addEventListener("click", async (event) => {
                run_button.classList.add("uk-spinner");
                await chrome.runtime.sendMessage({
                  type: "Runtime.evaluate",
                  object: {
                    expression: $.element.textContent,
                    objectGroup: "BlueFox-js-lanch",
                    awaitPromise: true,
                    returnByValue: true,
                  },
                });
                run_button.classList.remove("uk-spinner");
              });
              menu_container.append(run_button);
            }

            let copy_button = Object.assign(
              document.createElement("button"),
              {
                className: "uk-icon-link",
              }
            );
            copy_button.setAttribute("uk-icon", "copy");
            copy_button.setAttribute("title", "copy");
            copy_button.setAttribute("uk-tooltip", "");
            copy_button.addEventListener("click", async (event) => {
              navigator.clipboard.writeText($.element.textContent);
              copy_button.classList.add("uk-spinner");
              await sleep(930);
              copy_button.classList.remove("uk-spinner");
            });
            let copy_button_2 = Object.assign(document.createElement("bt2"));
            menu_container.append(copy_button);
            menu_container.append(copy_button_2);
            menu.append(menu_container);
            $.element.className ? $.element.parentElement.prepend(menu) : $.element.append(menu);
          }
        });
      } catch (e) { }
      this.appendChild(div);
    })();
  }
});
