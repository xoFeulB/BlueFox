import { BlueFoxJs } from "/modules/BlueFoxJs/bluefox.es.min.js";
import { marked } from "/modules/marked/marked.esm.js";
import { default as highlight } from "/modules/highlight/es/highlight.min.js";

import bash from "/modules/highlight/es/languages/bash.min.js";
highlight.registerLanguage("language-bash", bash);
import css from "/modules/highlight/es/languages/css.min.js";
highlight.registerLanguage("language-css", css);
import javascript from "/modules/highlight/es/languages/javascript.min.js";
highlight.registerLanguage("language-javascript", javascript);
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

customElements.define("mark-down", class extends HTMLElement {
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
            $.element.classList.add("uk-heading-divider");
          },
          "img": async ($) => {
            $.element.classList.add("radius");
          },
          "code": async ($) => {
            $.element.closest("pre").classList.add("radius");
            $.element.innerHTML = highlight.highlight(
              $.element.textContent,
              {
                language: $.element.className
              }
            ).value;
            let button = Object.assign(
              document.createElement("button"),
              {
                className: "uk-icon-link copy-code"
              }
            );
            button.setAttribute("uk-icon", "copy");
            button.setAttribute("title", "copy");
            button.setAttribute("uk-tooltip", "");
            button.addEventListener("click", async (event) => {
              navigator.clipboard.writeText($.element.textContent);
              button.classList.add("uk-spinner");
              await sleep(930);
              button.classList.remove("uk-spinner");
            });
            let menu = Object.assign(
              document.createElement("div"),
              {
                className: "code-menu"
              }
            );
            menu.append(button);
            $.element.parentElement.prepend(menu);
          }
        });
      } catch (e) {

      }
      this.appendChild(div);
    })();
  }
});
