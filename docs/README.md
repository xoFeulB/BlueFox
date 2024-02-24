# ^.,.^ BlueFox

<div align="center">
    <img src="https://repository-images.githubusercontent.com/589325811/52c33fdb-ccbb-4be9-8e20-62f642102f3b">
</div>

<div>
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/xoFeulB/BlueFox?style=social">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/xoFeulB/BlueFox?style=social">
    <img alt="GitHub forks" src="https://img.shields.io/github/forks/xoFeulB/BlueFox?style=social">
    <img alt="GitHub watchers" src="https://img.shields.io/github/watchers/xoFeulB/BlueFox?style=social">
    <img alt="GitHub milestones" src="https://img.shields.io/github/milestones/open/xoFeulB/BlueFox?style=social">
    <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/xoFeulB/BlueFox?style=social">
</div>
<div>
    <img src="https://img.shields.io/badge/-Javascript-333.svg?logo=javascript&style=for-the-badge">
    <img src="https://img.shields.io/badge/-Html5-333.svg?logo=html5&style=for-the-badge">
    <img src="https://img.shields.io/badge/-Css3-333.svg?logo=css3&style=for-the-badge">
    <img src="https://img.shields.io/badge/-Microsoftedge-333.svg?logo=microsoftedge&style=for-the-badge">
    <img src="https://img.shields.io/badge/-Google%20chrome-333.svg?logo=google-chrome&style=for-the-badge">
    <img src="https://img.shields.io/badge/-Visual%20Studio%20Code-333.svg?logo=microsoft&style=for-the-badge">
</div>

<div>

[![CodeQL](https://github.com/xoFeulB/BlueFox/workflows/CodeQL/badge.svg)](https://github.com/xoFeulB/BlueFox/actions/workflows/github-code-scanning/codeql)
![GitHub top language](https://img.shields.io/github/languages/top/xoFeulB/BlueFox?style=flat-square)

</div>

<hr>

<div align="center">
    <img src="https://ooo.bluefox.ooo/media/BlueFox_tp.png" width="80">
    <img src="https://ooo.bluefox.ooo/media/tail.png" width="80">
    <h3>Agile Web Automation Software for Time-Starved Professionals</h3>
    <p>BlueFox to improve your productivity!</p>
</div>

## About The Project



## demo

<div>

https://user-images.githubusercontent.com/31212444/226794728-41125a6a-62d4-403f-9afb-cafab7ed400f.mp4

</div>
<div>

https://github.com/xoFeulB/BlueFox/assets/31212444/531675c7-80a0-4ba8-a680-f04672dbb2c6

</div>
<div>

https://github.com/xoFeulB/BlueFox/assets/31212444/41f42f93-9278-48e3-9269-2de870ceef85

</div>
<div>

https://github.com/xoFeulB/BlueFox/assets/31212444/6d7baa28-a60a-4c93-995c-8383247d7ecc

</div>

## JavaScript Example
<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.tabs.create("https://www.google.com");
  await tab.dispatch
    .tails()
    .target("textarea")
    .setProperty({ value: "^.,.^ BlueFox" })
    .target("[name='btnK'][tabindex='0']")
    .call("click", null)
    .run({ sleep: 50 });
  await sleep(1000);

  let search_result = await tab.dispatch.script(
    () => {
      return [...document.querySelectorAll("#search :is(a[data-jsarwt='1'],a[jsname])")]
        .filter((_) => {
          return _.querySelector("h3");
        })
        .map((_) => {
          return {
            href: _.href,
            title: _.querySelector("h3").textContent,
          }
        });
    }
  );

  window.alert(JSON.stringify(search_result.result.value, null, 4));
})();
```
</bluefoxscript>

<hr>

## Installation

```bash
git clone https://github.com/xoFeulB/BlueFox.git
```

or Download archive(ZIP) from releases page or repo top page this repo, and export files.  
releases : https://github.com/xoFeulB/BlueFox/releases  
DownloadZIP : https://github.com/xoFeulB/BlueFox/archive/refs/heads/main.zip

then, drag-and-drop BlueFox folder to Chrome extensions page (<a href="edge://extensions/" target="_blank">edge://extensions/</a>)

## Usage : in preparation
## ^.,.^ BlueFox-Chan fan arts
