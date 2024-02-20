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
<hr>

BlueFoxは、プロフェッショナルのためのWeb自動化ツールです。

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

```javascript
(async () => {
  let blueFoxScript = new BlueFoxScript();
  await blueFoxScript.init();

  if (!(await blueFoxScript.tabs.get("https://www.google.com").length)) {
    await blueFoxScript.tabs.create("https://www.google.com");
    await sleep(1000);
  }

  let tab = await blueFoxScript.tabs.get("https://www.google.com")[0];
  ///////////////////////////////////////
  await tab.dispatch
    .tails()
    .target("textarea")
    .setProperty({ value: "^.,.^ BlueFox" })
    .target("[name='btnK'][tabindex='0']")
    .call("click", null)
    .run({ sleep: 50 });
  ///////////////////////////////////////
  await sleep(1000);

  let search_result = await tab.dispatch.script(
    () => {
      return JSON.stringify([...document.querySelectorAll("#search a[data-jsarwt='1']")]
        .filter((_) => {
          return _.querySelector("h3");
        })
        .map((_) => {
          return {
            href: _.href,
            title: _.querySelector("h3").textContent,
          }
        }))
    }
  );
  log(JSON.parse(search_result.result.value));
})();
```
<hr>

## JSON Example

BlueFox makes your test definitions highly available and portable, taking your productivity to the next level.  
BlueFox automation are "Data structuralable". Here is a simple example.  
It uses spreadsheets that engineers hate and a JSON format that can be easily generated from your favorite programming language.  
That's why I say "not scripts, It's data structures".

```JSON
{
    "meta": {
        "version": 1,
        "title": "v1 format",
        "description": "description"
    },
    "sleep": 0,
    "dispatchEvents": [
        {
            "comment": "",
            "option": {
                "eventObject": "path",
                "eventType": "event type",
                "eventArgs": "any"
            }
        }
    ],
    "actions": [
        {
            "comment": "",
            "type": "set",
            "target": {
                "selector": "css selector",
                "property": "property | null"
            },
            "option": {
                "property": {
                    "path": "value"
                },
                "attribute": {
                    "key": "value"
                }
            }
        },
        {
            "comment": "",
            "type": "push",
            "target": {
                "selector": "css selector",
                "property": "property | null"
            },
            "option": {
                "property": {
                    "path": "value"
                },
                "attribute": {
                    "key": "value"
                }
            }
        },
        {
            "comment": "",
            "type": "call",
            "target": {
                "selector": "css selector",
                "property": "property | null"
            },
            "option": "any"
        },
        {
            "comment": "",
            "type": "event",
            "target": {
                "selector": "css selector",
                "property": "property | null"
            },
            "option": {
                "eventObject": "path",
                "eventType": "event type",
                "eventArgs": "any"
            }
        },
        {
            "comment": "",
            "type": "sleep",
            "option": {
                "msec": "int"
            }
        },
        {
            "comment": "",
            "type": "open",
            "option": {
                "url": "http..."
            }
        },
        {
            "comment": "",
            "type": "focus",
            "target": {
                "selector": "css selector",
                "property": "property | null",
                "reset": "boolean"
            }
        },
        {
            "comment": "need for human",
            "type": "capture",
            "target": {
                "selector": "css selector",
                "property": "property | null"
            },
            "option": {
                "fileName": "fileName",
                "format": "jpeg|png|webp",
                "quality": "int | 0~100"
            }
        },
        {
            "comment": "need for human",
            "type": "save",
            "option": {
                "fileName": "fileName"
            }
        }
    ]
}
```

<hr>

## Installation

```bash
git clone https://github.com/xoFeulB/BlueFox.git
```

or Download archive(ZIP) from releases page or repo top page this repo, and export files.  
releases : https://github.com/xoFeulB/BlueFox/releases  
DownloadZIP : https://github.com/xoFeulB/BlueFox/archive/refs/heads/main.zip

then, drag-and-drop BlueFox folder to Chrome extensions page (<a href="chrome://extensions/" target="_blank">chrome://extensions/</a>)

## Usage : in preparation
