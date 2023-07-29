(async () => {
  window.BlueFoxScanner ? null : (window.BlueFoxScanner = {});
  let log = (...args) => {
    console.log("blue-fox-scanner.js", ...args);
  };
  log("loaded");
  window.BlueFoxScanner.scanner = async () => {
    let R = {
      Strings: new Set(),
      Attribute: {
        href: new Set(),
        src: new Set(),
        action: new Set(),
        content: new Set(),
        cite: new Set(),
        code: new Set(),
        codebase: new Set(),
        ping: new Set(),
        poster: new Set(),
        srcset: new Set(),
      },
      StackTrace: [],
    };

    let scriptCheck = (javascript_str, script_element) => {
      log("?", script_element.getAttribute("src"), script_element);

      let code = javascript_str;
      let ast = esprima.parseScript(code, {
        jsx: false,
        range: true,
        loc: true,
        tolerant: false,
        tokens: false,
        comment: false,
      });
      log(ast);

      let lines = code.split(/\r\n|\n/);

      let isSame = (a, b) => {
        return a.toLowerCase() == b.toLowerCase();
      };
      let enter_handler = {
        Identifier: (node, parent) => {
          // log("Identifier", node);
        },
        AssignmentExpression: (node, parent) => {
          // log("AssignmentExpression", node);
          if (["innerHTML", "outerHTML"].includes(node.left.property.name)) {
            let strings = esprima
              .tokenize(code.substring(node.range[0], node.range[1]))
              .filter((_) => {
                if (_.type == "String") {
                  return true;
                }
              });
            console.log(
              `%c${script_element.getAttribute("src")} | ${
                node.loc.start.line
              }:${node.loc.start.column}-${node.loc.end.line}:${
                node.loc.end.column
              } | ${node.left.property.name} >>> ${strings
                .map((_) => {
                  return _.value;
                })
                .join(" ")}`,
              "font-weight: bold;color:red"
            );
            console.log(
              code.substring(node.range[0], node.range[1]),
              node,
              parent
            );
          }
        },
        CallExpression: (node, parent) => {
          if (
            [
              isSame("document", node.callee.object.name) &&
                isSame("write", node.callee.property.name),
            ].some((_) => {
              return _;
            })
          ) {
            console.log(
              `%c>>> document.write | ${node.loc.start.line}:${node.loc.start.column}-${node.loc.end.line}:${node.loc.end.column} | `,
              "font-weight: bold;color:red",
              lines[node.loc.start.line - 1].substring(
                node.loc.start.column,
                node.loc.end.column
              ),
              node,
              parent
            );
          }

          if (
            ["fetch", "post", "get", "open"].includes(node.callee.property.name)
          ) {
            let strings = esprima
              .tokenize(code.substring(node.range[0], node.range[1]))
              .filter((_) => {
                if (_.type == "String") {
                  return true;
                }
              });
            console.log(
              `%c${script_element.getAttribute("src")} | ${
                node.loc.start.line
              }:${node.loc.start.column}-${node.loc.end.line}:${
                node.loc.end.column
              } | ${node.callee.property.name} >>> ${strings
                .map((_) => {
                  return _.value;
                })
                .join(" ")}`,
              "font-weight: bold;color:blue"
            );
            console.log(
              code.substring(node.range[0], node.range[1]),
              node,
              parent
            );
          }
        },

        ExpressionStatement: (node, parent) => {
          // log("ExpressionStatement", node);
        },
        FunctionDeclaration: (node, parent) => {
          console.log(
            `%c>>> FunctionDeclaration | ${node.loc.start.line}:${node.loc.start.column}-${node.loc.end.line}:${node.loc.end.column} | `,
            "font-weight: bold;color:gold",
            code.substring(node.range[0], node.range[1]),
            node,
            parent
          );
        },
        ArrowFunctionExpression: (node, parent) => {
          console.log(
            `%c>>> ArrowFunctionExpression | ${node.loc.start.line}:${node.loc.start.column}-${node.loc.end.line}:${node.loc.end.column} | `,
            "font-weight: bold;color:green",
            lines[node.loc.start.line - 1].substring(
              node.loc.start.column,
              node.loc.end.column
            ),
            node,
            parent
          );
        },
        Literal: (node, parent) => {
          // log("Literal", node.value);
        },
        OTHER: (node, parent) => {
          // log("OTHER", node.type);
        },
      };

      estraverse.traverse(ast, {
        enter: (node, parent) => {
          try {
            enter_handler[node.type](node, parent);
          } catch (err) {
            enter_handler["OTHER"](node, parent);
          }
        },
        // leave: function (node, parent) {
        //     console.log('[leave] ', node.type, ':', get_node_info(node))
        // }
      });

      esprima.tokenize(code).forEach((_) => {
        if (["String", "Template"].includes(_.type)) {
          R.Strings.add(_.value);
        }
      });
    };

    let elements = {
      html: {},
      base: {},
      head: {},
      link: {},
      meta: {},
      style: {},
      title: {},
      body: {},
      address: {},
      article: {},
      aside: {},
      footer: {},
      header: {},
      h1: {},
      h2: {},
      h3: {},
      h4: {},
      h5: {},
      h6: {},
      main: {},
      nav: {},
      section: {},
      blockquote: {},
      dd: {},
      div: {},
      dl: {},
      dt: {},
      figcaption: {},
      figure: {},
      hr: {},
      li: {},
      menu: {},
      ol: {},
      p: {},
      pre: {},
      ul: {},
      a: {},
      href: {},
      abbr: {},
      b: {},
      bdi: {},
      bdo: {},
      br: {},
      cite: {},
      code: {},
      data: {},
      dfn: {},
      em: {},
      i: {},
      kbd: {},
      mark: {},
      q: {},
      rp: {},
      rt: {},
      ruby: {},
      s: {},
      samp: {},
      small: {},
      span: {},
      strong: {},
      sub: {},
      sup: {},
      time: {},
      u: {},
      var: {},
      wbr: {},
      area: {},
      audio: {},
      img: {},
      map: {},
      track: {},
      video: {},
      embed: {},
      iframe: {},
      object: {},
      picture: {},
      portal: {},
      source: {},
      svg: {},
      canvas: {},
      noscript: {},
      script: {},
      del: {},
      ins: {},
      caption: {},
      col: {},
      colgroup: {},
      table: {},
      tbody: {},
      td: {},
      tfoot: {},
      th: {},
      thead: {},
      tr: {},
      button: {},
      datalist: {},
      fieldset: {},
      form: {},
      input: {},
      label: {},
      legend: {},
      meter: {},
      optgroup: {},
      option: {},
      output: {},
      progress: {},
      select: {},
      textarea: {},
      details: {},
      dialog: {},
      summary: {},
      slot: {},
      template: {},
    };
    let deprecated_elements = {
      acronym: {},
      applet: {},
      bgsound: {},
      big: {},
      blink: {},
      center: {},
      content: {},
      dir: {},
      font: {},
      frame: {},
      frameset: {},
      image: {},
      keygen: {},
      marquee: {},
      menuitem: {},
      nobr: {},
      noembed: {},
      noframes: {},
      param: {},
      plaintext: {},
      rb: {},
      rtc: {},
      shadow: {},
      spacer: {},
      strike: {},
      tt: {},
      xmp: {},
    };
    let deprecated_attributes = {
      onabort: {},
      onafterprint: {},
      onbeforeprint: {},
      onbeforeunload: {},
      onblur: {},
      oncancel: {},
      oncanplay: {},
      oncanplaythrough: {},
      onchange: {},
      onclick: {},
      oncuechange: {},
      ondbclick: {},
      ondurationchange: {},
      onemptied: {},
      onended: {},
      onerror: {},
      onfocus: {},
      onhashchange: {},
      oninput: {},
      oninvalid: {},
      onkeydown: {},
      onkeypress: {},
      onkeyup: {},
      onload: {},
      onloadeddata: {},
      onloadedmetadata: {},
      onloadstart: {},
      onmessage: {},
      onmousedown: {},
      onmouseenter: {},
      onmouseleave: {},
      onmousemove: {},
      onmouseout: {},
      onmouseover: {},
      onmouseup: {},
      onmousewheel: {},
      onoffline: {},
      ononline: {},
      onpagehide: {},
      onpageshow: {},
      onpause: {},
      onplay: {},
      onplaying: {},
      onpopstate: {},
      onprogress: {},
      onratechange: {},
      onresize: {},
      onreset: {},
      onscroll: {},
      onseeked: {},
      onseeking: {},
      onselect: {},
      onshow: {},
      onstalled: {},
      onstorage: {},
      onsubmit: {},
      onsuspend: {},
      ontimeupdate: {},
      onunload: {},
      onvolumechange: {},
      onwaiting: {},
    };
    let simpleDict = {
      "*:not(script)": async (e) => {
        if (elements[e.tagName.toLowerCase()]) {
        } else if (deprecated_elements[e.tagName.toLowerCase()]) {
          log(
            e.tagName.toLowerCase(),
            "Deprecated or obsolete Element, Attributes",
            e
          );
        } else {
          if (!e.closest("svg")) {
            log(e.tagName.toLowerCase(), "Non Standard Element, Attributes", e);
          }
        }

        e.getAttributeNames().forEach((attribute_name) => {
          if (deprecated_attributes[attribute_name.toLowerCase()]) {
            log(
              e.tagName.toLowerCase(),
              `${attribute_name} JavaScript in Attribute`,
              e
            );
            scriptCheck(e.getAttribute(attribute_name), e);
          }
        });
      },
      "a[href^='javascript:']": async (e) => {
        log(e.tagName.toLowerCase(), "JavaScript in href", e);
        scriptCheck(e.getAttribute("href"), e);
      },
      iframe: async (e) => {
        log("iframe detected", e);
      },
      form: async (e) => {
        log(`form >>> ${e.getAttribute("action")}`, e);
        [...e.querySelectorAll("*")].forEach((_) => {
          if (_.form) {
            log(
              ` param: ${_.tagName} ${_.getAttribute("type")} ${_.getAttribute(
                "name"
              )}`
            );
          }
        });
      },
      script: async (e) => {
        if (e.textContent) {
          scriptCheck(e.textContent, e);
        } else {
          let src = e.getAttribute("src");
          let data = await (await fetch(src)).text();
          scriptCheck(data, e);
        }
      },
      "*": async (e) => {
        e.getAttributeNames().forEach((attribute_name) => {
          R.Strings.add(e.getAttribute(attribute_name));
        });
        Object.keys(R.Attribute).forEach((attribute_name) => {
          if (e.getAttribute(attribute_name)) {
            R.Attribute[attribute_name].add(e.getAttribute(attribute_name));
          }
        });
      },
    };

    let queryWalker = new QueryWalker(simpleDict, document);
    await queryWalker.do();
    log("ScanResult:", R);
    return R;
  };
})();
