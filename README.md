# ^.,.^ BlueFox

<div align="center">
<img src="https://github.com/LobeliaSecurity/BlueFox/raw/main/media/SocialPreview.png">
</div>

<div>
<img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/LobeliaSecurity/BlueFox?style=social">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/LobeliaSecurity/BlueFox?style=social">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/LobeliaSecurity/BlueFox?style=social">
<img alt="GitHub watchers" src="https://img.shields.io/github/watchers/LobeliaSecurity/BlueFox?style=social">
<img alt="GitHub milestones" src="https://img.shields.io/github/milestones/open/LobeliaSecurity/BlueFox?style=social">
<img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/LobeliaSecurity/BlueFox?style=social">
</div>
<hr>

BlueFox is a web automation tools being developed with a focusing to repurposing several security related tools.

BlueFox makes your test definitions highly available and portable, taking your productivity to the next level.  
BlueFox automation are "Data structuralable". Here is a simple example.  
It uses spreadsheets that engineers hate and a JSON format that can be easily generated from your favorite programming language.  
That's why I say "not scripts, data structures".

```JSON
{
    "version": 0,
    "sleep": 0,
    "dispatchEvents": [
        "change"
    ],
    "actions": [
        {
            "type": "set",
            "target": "#target",
            "property": {
                "value": "new input"
            }
        },
        {
            "comment": "capture screen when debugger has active",
            "type": "capture",
            "target": "body",
            "fileName": "result",
            "format": "png"
        }
    ]
}
```

<hr>

## Installation

```bash
git clone https://github.com/LobeliaSecurity/BlueFox.git
```

or Download archive(ZIP) from releases page or repo top page this repo, and export files.  
releases : https://github.com/LobeliaSecurity/BlueFox/releases  
DownloadZIP : https://github.com/LobeliaSecurity/BlueFox/archive/refs/heads/main.zip

then, drag-and-drop BlueFox folder to Chrome extensions page (<a href="chrome://extensions/" target="_blank">chrome://extensions/</a>)

## Usage : check Wiki↓

<a href="https://github.com/LobeliaSecurity/BlueFox/wiki" target="_blank">https://github.com/LobeliaSecurity/BlueFox/wiki</a>

<hr>

## Road Map ^.,.^

- v0~ ✅ https://github.com/LobeliaSecurity/BlueFox/releases/tag/0.0.2
  - ✅ Draw BlueFox-chan illustration ^.,.^
  - ✅ Chrome extension for to do screenshots
  - ✅ Data structuralable (its mean not recorded or interactive) standard automation with JSON
    - ✅ Set Attribute to DOM
    - ✅ Set Property to DOM
    - ✅ Screenshot DOM to image
    - ✅ Take and save DOM addribute, property to JOSN
    - ✅ Dispatch event to DOM
    - ✅ Sleep while millisecond
  - ✅ Minimal user interface
  - ✅ Minimal Wiki
- v1~
  - Don't do "addEventListner" to target for safe
  - iframe support
  - Create, Inject element support
  - Endpoint scanner
  - Text relationship scanner
  - JavaScript HTML CSS : quality scanner
  - Web security scanner based on OWASP Top 10, codeQL
  - Keep automation when after page transitions
- v2~
  - AI implementation to make decisions based on visual information
  - Communication with python library to automate something on outside browser field
    - Nova ... web server
    - PhantomLilith ... windows aarch64 debugger
