# Scripting

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
