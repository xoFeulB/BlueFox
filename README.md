# ^.,.^ BlueFox

<div align="center">
  <img src="https://ooo.bluefox.ooo/media/SocialPreview_1.png">
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
    <h3>Web Automation Software for Time-Starved Professionals</h3>
    <p>BlueFox to improve your productivity!</p>
</div>

## About The Project

BlueFox is a web front-end test automation and operational knowledge sharing solution designed to increase the productivity of web developers, especially those responsible for various areas such as design, development, unit testing, integration testing, and E2E testing.

## Table of Contents

- [Demo](#demo)
- [JavaScript Example](#javascript-example)
- [Manual installation](#manual-installation)
- [BlueFoxServer and BlueFoxScript examples](#bluefoxserver-and-bluefoxscript-examples)
  - [BlueFoxServer](#bluefoxserver)
  - [BlueFoxScript examples](#bluefoxscript-examples)

## Demo

### X(Twitter)

`/tweet.js`
<img src="https://ooo.bluefox.ooo/media/Demo/demo1.gif" width="100%">

### KeyEvent

`/key.js`
<img src="https://ooo.bluefox.ooo/media/Demo/demo2.gif" width="100%">

### Google search

`/google-search.js`
<img src="https://ooo.bluefox.ooo/media/Demo/demo3.gif" width="100%">

### input type="file" upload

`/file-upload.js`
<img src="https://ooo.bluefox.ooo/media/Demo/demo4.gif" width="100%">

### assert test (Failed)

`/8bit-pattern-test.js`
<img src="https://ooo.bluefox.ooo/media/Demo/demo5.gif" width="100%">

### assert test (Passed)

`Temporary script editor`
<img src="https://ooo.bluefox.ooo/media/Demo/demo6.gif" width="100%">

### EventListener callback

`/8bit-pattern-event-listener.js`
<img src="https://ooo.bluefox.ooo/media/Demo/demo8.gif" width="100%">

## JavaScript Example

<bluefoxscript>

```javascript
(async () => {
  let blueFoxScript = await new BlueFoxScript();

  let tab = await blueFoxScript.createWindow("https://www.google.com");
  await tab
    .tails()
    .target("textarea")
    .setProperty({ value: "^.,.^ BlueFox" })
    .target("[name='btnK'][tabindex='0']")
    .call("click", null)
    .runTillNextOnLoad({ sleep: 50 });

  let search_result = await tab.dispatchScript(() => {
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

<hr>

## Manual installation

```bash
git clone https://github.com/xoFeulB/BlueFox.git
```

or Download archive(ZIP) from releases page or repo top page this repo, and export files.  
releases : https://github.com/xoFeulB/BlueFox/releases  
DownloadZIP : https://github.com/xoFeulB/BlueFox/archive/refs/heads/main.zip

then, drag-and-drop BlueFox folder that having "manifest.json" to Chrome(Edge) developper-mode extensions page (<a href="edge://extensions/" target="_blank">edge://extensions/</a> or <a href="chrome://extensions/" target="_blank">chrome://extensions/</a>)

### Manual update

in cloned BlueFox.git directory

```bash
git pull
```

## BlueFoxServer and BlueFoxScript examples

BlueFoxServer, a VSCode extension, shares files on workspaces opened in VSCode with BlueFox, allowing script execution, retrieval of original data for file upload using automation, and temporary editing of scripts.

### BlueFoxServer

[Download and Install BlueFoxServer to use the VSCode integration feature (marketplace.visualstudio.com)](https://marketplace.visualstudio.com/items?itemName=BlueFoxEnterprise.BlueFoxServer)

### BlueFoxScript examples

```bash
git clone https://github.com/xoFeulB/BlueFoxScript-Examples.git
```

or Download archive(ZIP) from releases page or repo top page this repo, and export files.  
DownloadZIP : https://github.com/xoFeulB/BlueFoxScript-Examples/archive/refs/heads/main.zip

<div align="center">
    <img src="https://ooo.bluefox.ooo/media/Demo/demo7.gif" width="60%">
    <h4>1. Open BlueFoxScript-Examples With VSCode</h4>
    <img src="https://ooo.bluefox.ooo/media/Demo/vscs1.png" width="60%">
    <h4>2. Bring BlueFoxServer online</h4>
    <img src="https://ooo.bluefox.ooo/media/Demo/vscs2.png" width="60%">
    <img src="https://ooo.bluefox.ooo/media/Demo/vscs3.png" width="60%">
</div>

#### RunScript

<div align="center">
    <img src="https://ooo.bluefox.ooo/media/Demo/vscs4.png" width="60%">
</div>

#### Temporary edit

<div align="center">
    <img src="https://ooo.bluefox.ooo/media/Demo/vscs5.png" width="60%">
    <img src="https://ooo.bluefox.ooo/media/Demo/vscs6.png" width="60%">
</div>

## ^.,.^ BlueFox-chan fan arts

<div align="center">
    <img src="https://ooo.bluefox.ooo/media/FanArts/art3.png" width="300">
</div>
<div align="center">
    <h4>CREDITS</h4>
    <div>
        <a href="https://x.com/painting_ape">ぷらすあるふぁ(https://x.com/painting_ape)</a>
    </div>
</div>
