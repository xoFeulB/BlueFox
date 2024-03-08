# Scripting

Automate with javascript

## Table of Contents

- [Global objects](#global-objects)
- [Scripting Reference](#scripting-reference)
- [Step by Step](#step-by-step)
  - [1. Inside async function](#1-inside-async-function)
  - [2. Initialize](#2-initialize)
  - [3. Open target window](#3-open-target-window)
  - [4. Initialize tails](#4-initialize-tails)
  - [5. Preparing tails](#5-preparing-tails)
  - [6. Run tails](#6-run-tails)
  - [7. Run script and get result](#7-run-script-and-get-result)
- [VSCode integration feature](#vscode-integration-feature)
  - [BlueFoxServer](#bluefoxserver)
  - [BlueFox Scripting examples](#bluefox-scripting-examples)

## Global objects

- `log` ... console.log
- `assert` ... console.assert
- `await sleep`
- `BlueFoxScript`
- `BlueFoxJs`

## Scripting Reference

### BlueFoxScript.runScript()

Run String:script

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let script = await (
    await fetch("https://ooo.bluefox.ooo/BlueFoxDemo/js/confirm.js")
  ).text();
  window.alert(
    `Confirmed: ${(await blueFoxScript.runScript(script)).result.value}`
  );
})();
```

</bluefoxscript>

### BlueFoxScript.runWorkspaceScript()

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  await blueFoxScript.runWorkspaceScript("/alert.js");
})();
```

</bluefoxscript>

### BlueFoxScript.getWorkspaceFile()

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let file = await blueFoxScript.getWorkspaceFile("/img/BlueFox.png");

  // Property
  file.name;
  file.type;
  file.blob;
  file.object;
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n]

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  tab = await blueFoxScript.tabs.info[0];
  tab = await blueFoxScript.tabs.create(
    "https://ooo.bluefox.ooo/BlueFoxDemo/8bit.html"
  );

  await blueFoxScript.tabs.reload();
  tab = await blueFoxScript.tabs.get(
    "https://ooo.bluefox.ooo/BlueFoxDemo/8bit.html"
  )[0];

  // Property
  tab.url;
  tab.dispatch;
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].dispatch.tails() ... Method chaining

<bluefoxscript>

```javascript
(async () => {
  let tails = tab.dispatch.tails({
    sleep: 100,
    dispatchEvents: [
      {
        option: {
          eventObject: "Event",
          eventType: "change",
          eventArgs: {
            bubbles: true,
          },
        },
      },
      {
        option: {
          eventObject: "Event",
          eventType: "input",
          eventArgs: {
            bubbles: true,
          },
        },
      },
    ],
  });
})();
```

</bluefoxscript>

#### .init()

<bluefoxscript>

```javascript
(async () => {
  tails.init({ sleep: 100 });
})();
```

</bluefoxscript>

#### .target()

<bluefoxscript>

```javascript
(async () => {
  tails.target(`CSS Selector or XPath`);
})();
```

</bluefoxscript>

#### .defined()

same as .target(\``:is([data-testid="${UI Name}"],[bluefox-label="${UI Name}"],[aria-description="${UI Name}"],[aria-label="${UI Name}"])`\`)

<bluefoxscript>

```javascript
(async () => {
  tails.defined(`UI Name`);
})();
```

</bluefoxscript>

#### .set()

<bluefoxscript>

```javascript
(async () => {
  tails.set({
    property: {
      path: "value",
    },
    attribute: {
      key: "value",
    },
  });
})();
```

</bluefoxscript>

#### .setProperty()

<bluefoxscript>

```javascript
(async () => {
  tails.setProperty({
    path: "value",
  });
})();
```

</bluefoxscript>

#### .setAttribute()

<bluefoxscript>

```javascript
(async () => {
  tails.setAttribute({
    key: "value",
  });
})();
```

</bluefoxscript>

#### .push()

<bluefoxscript>

```javascript
(async () => {
  tails.push({
    property: {
      path: "value",
    },
    attribute: {
      key: "value",
    },
  });
})();
```

</bluefoxscript>

#### .call()

<bluefoxscript>

```javascript
(async () => {
  tails.call(`click`, null);
})();
```

</bluefoxscript>

#### .event()

<bluefoxscript>

```javascript
(async () => {
  tails.event({
    eventObject: "path",
    eventType: "event type",
    eventArgs: "any",
  });
})();
```

</bluefoxscript>

#### .focus()

move into Shadow DOM, iframe

<bluefoxscript>

```javascript
(async () => {
  tails.focus(`Property`, (reset = false));
})();
```

</bluefoxscript>

#### .capture()

<bluefoxscript>

```javascript
(async () => {
  tails.capture(
    (selector = `CSS Selector or XPath`),
    (object = {
      fileName: "capture",
      format: "png",
      quality: 100,
    })
  );
})();
```

</bluefoxscript>

#### .key()

Argument Reference
https://chromedevtools.github.io/devtools-protocol/1-3/Input/#method-dispatchKeyEvent

<bluefoxscript>

```javascript
(async () => {
  tails.key({
    type: "keyDown",
    windowsVirtualKeyCode: 65,
  });
})();
```

</bluefoxscript>

#### .open()

<bluefoxscript>

```javascript
(async () => {
  tails.open("URL");
})();
```

</bluefoxscript>

#### .sleep()

sleep millisecond

<bluefoxscript>

```javascript
(async () => {
  tails.sleep(1000);
})();
```

</bluefoxscript>

#### .file()

<bluefoxscript>

```javascript
(async () => {
  tails.file([
    {
      name: "FileName",
      type: "MIME",
      blob: [...Uint8Array],
      object: "Uint8Array",
    },
  ]);
})();
```

</bluefoxscript>

#### .getProperties()

<bluefoxscript>

```javascript
(async () => {
  let properties = await tails.getProperties(`CSS Selector or XPath`);
})();
```


</bluefoxscript>

#### .run()

run Tails

<bluefoxscript>

```javascript
(async () => {
  await tails.run({ sleep: 100 });
})();
```

</bluefoxscript>

#### .runTillNextOnLoad()

run Tails and await till next window.onload

<bluefoxscript>

```javascript
(async () => {
  await tails.runTillNextOnLoad({ sleep: 100 });
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].dispatch.addEventListeners()

<bluefoxscript>

```javascript
(async () => {
  let listener_info = await tab.dispatch.addEventListeners(
    `[data-testid="bit-1"]`,
    "click",
    async (object) => {
      log(object);

      // Property
      object.event;
      object.properties;
      listener_info[0].uuid == object.event.uuid;
      listener_info[0].selector == object.event.target;
    }
  );
  // Property
  listener_info[0].uuid;
  listener_info[0].selector;
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].dispatch.script()

<bluefoxscript>

```javascript
(async () => {
  await tab.dispatch.script(() => {
    window.alert("^.,.^ BlueFox");
  });
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].dispatch.tillScriptTrue()

<bluefoxscript>

```javascript
(async () => {
  await tab.dispatch.tillScriptTrue(() => {
    return true;
  }, (max_polling = 5000));
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].dispatch.action()

run Tails

<bluefoxscript>

```javascript
(async () => {
  await tab.dispatch.action(tails.tail);
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].dispatch.screenshot()

<bluefoxscript>

```javascript
(async () => {
  let base64_png_image = await tab.dispatch.screenshot(
    (config = {
      format: "png",
      captureBeyondViewport: true,
    })
  );
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].close()

<bluefoxscript>

```javascript
(async () => {
  await tab.close();
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].reload()

<bluefoxscript>

```javascript
(async () => {
  await tab.reload();
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].getCookies()

https://developer.chrome.com/docs/extensions/reference/api/cookies#method-getAll

<bluefoxscript>

```javascript
(async () => {
  await tab.getCookies({ domain: "domain" });
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].removeCookie()

https://developer.chrome.com/docs/extensions/reference/api/cookies#method-remove

<bluefoxscript>

```javascript
(async () => {
  await tab.removeCookie({ name: "name" });
})();
```

</bluefoxscript>

### BlueFoxScript.tabs.info[n].setCookie()

https://developer.chrome.com/docs/extensions/reference/api/cookies#method-set

<bluefoxscript>

```javascript
(async () => {
  await tab.setCookie({ name: "name", value: "value" });
})();
```

</bluefoxscript>


## Step by Step

### 1. Inside async function

<bluefoxscript>

```javascript
(async () => {
  // Write your code here
})();
```

</bluefoxscript>

### 2. Initialize

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();
})();
```

</bluefoxscript>

### 3. Open target window

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");
})();
```

</bluefoxscript>

### 4. Initialize tails

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");

  let tails = await tab.dispatch.tails();
})();
```

</bluefoxscript>

### 5. Preparing tails

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");

  let tails = await tab.dispatch.tails();
  tails
    .target("textarea")
    .setProperty({ value: "^.,.^ BlueFox" })
    .target("[name='btnK'][tabindex='0']")
    .call("click", null);
})();
```

</bluefoxscript>

### 6. Run tails

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");

  let tails = await tab.dispatch.tails();
  tails
    .target("textarea")
    .setProperty({ value: "^.,.^ BlueFox" })
    .target("[name='btnK'][tabindex='0']")
    .call("click", null);

  await tails.run({ sleep: 50 });
})();
```

</bluefoxscript>

### 7. Run script and get result

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");

  let tails = await tab.dispatch.tails();
  tails
    .target("textarea")
    .setProperty({ value: "^.,.^ BlueFox" })
    .target("[name='btnK'][tabindex='0']")
    .call("click", null);

  await tails.run({ sleep: 50 });

  await sleep(1000);
  let search_result = await tab.dispatch.script(() => {
    return [
      ...document.querySelectorAll("#search :is(a[data-jsarwt='1'],a[jsname])"),
    ]
      .filter((_) => {
        return _.querySelector("h3");
      })
      .map((_) => {
        return {
          href: _.href,
          title: _.querySelector("h3").textContent,
        };
      });
  });
  window.alert(JSON.stringify(search_result.result.value, null, 4));
})();
```

</bluefoxscript>

<mark-down src="/docs/help/BlueFoxServer.md"></mark-down>
