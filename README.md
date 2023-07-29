# ^.,.^ BlueFox

<div align="center">
<img src="https://user-images.githubusercontent.com/31212444/232337954-73feac2d-c27d-4a6c-b0b5-63ae5ccd9cab.png">
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

BlueFoxは、プロフェッショナルのためのWeb自動化ツールです。

## BOT demo (Experimental stage)
in this video, BlueFox-chan is not a bot account.  
BlueFox can act like a normal human more easily, and communicate web via web.
<div>

https://github.com/LobeliaSecurity/BlueFox/assets/31212444/531675c7-80a0-4ba8-a680-f04672dbb2c6

</div>

BlueFox makes your test definitions highly available and portable, taking your productivity to the next level.  
BlueFox automation are "Data structuralable". Here is a simple example.  
It uses spreadsheets that engineers hate and a JSON format that can be easily generated from your favorite programming language.  
That's why I say "not scripts, It's data structures".

```JSON
{
    "meta": {
        "version": 0,
    },
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
