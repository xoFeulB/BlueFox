# Scripting

## Table of Contents

- [Global objects](#global-objects)
- [1. Inside async function](#1-inside-async-function)
- [2. Initialize](#2-initialize)
- [3. Open target window](#3-open-target-window)
- [4. Initialize tails](#4-initialize-tails)
- [5. Preparing tails](#5-preparing-tails)
- [6. Run tails](#6-run-tails)
- [7. Run script and get result](#7-run-script-and-get-result)
- [VSCode integration feature](#vscode-integration-feature)
  - [BlueFoxServer](#bluefoxserver)
  - [BlueFoxScript examples](#bluefoxscript-examples)

## Global objects

- `log` ... console.log
- `assert` ... console.assert
- `await sleep`
- `BlueFoxScript`
- `BlueFoxJs`

## 1. Inside async function

<bluefoxscript>

```javascript
(async () => {
  // Write your code here
})();
```

</bluefoxscript>

## 2. Initialize

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();
})();
```

</bluefoxscript>

## 3. Open target window

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");
})();
```

</bluefoxscript>

## 4. Initialize tails

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");

  let tails = await tab.dispatch.tails();
})();
```

</bluefoxscript>

## 5. Preparing tails

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

## 6. Run tails

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

## 7. Run script and get result

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
