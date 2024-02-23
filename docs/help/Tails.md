# Tails

## v0
```JSON
{
    "meta": {
        "version": 0,
        "title": "v0 format",
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
            "type": "set",
            "target": "#target",
            "property": {
                "dot separated property path (like ... style.color)" : "property value"
            },
            "attribute": {
                "attribute name" : "attribute value"
            }
        },
        {
            "type": "take",
            "target": "#target",
            "property": {
                "dot separated property path (like ... value)" : "property value"
            },
            "attribute": {
                "attribute name" : "attribute value"
            }
        },
        {
            "type": "eval",
            "target": "#target",
            "property": {
                "dot separated property path (like ... click)" : "property value"
            }
        },
        {
            "type": "capture",
            "target": "#target",
            "fileName": "target_capture",
            "format": "jpeg | png | webp ... default:jpeg",
            "quality": "0~100 (jpeg only) ... default:50"
        },
        {
            "type": "sleep",
            "target": "0~ ... sleep millisecond"
        },
        {
            "type": "event",
            "target": "#target",
            "dispatchEvent": "mouseover"
        },
        {
            "type": "save",
            "fileName": "save_taken_values ... save type:take values to json"
        }
    ]
}
```

## v1
```JSON
{
    "meta": {
        "version": 1,
        "title": "v1 format",
        "description": [
            "description"
        ]
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
                "property": "property | null",
                "all": "bool | true, false"
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
                "property": "property | null",
                "all": "bool | true, false",
                "as": "name"
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
                "property": "property | null",
                "all": "bool | true, false"
            },
            "option": {
                "eventObject": "path",
                "eventType": "event type",
                "eventArgs": "any"
            }
        },
        {
            "comment": "",
            "type": "key",
            "option": "any (https://chromedevtools.github.io/devtools-protocol/1-3/Input/#method-dispatchKeyEvent)"
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
            "comment": "",
            "type": "file",
            "target": {
                "selector": "css selector"
            },
            "files": [
                {
                    "name": "fileName",
                    "type": "mime",
                    "blob": [],
                    "object": "String|Uint8Array"
                }
            ]
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

## Scenario
```JSON
{
    "meta": {
        "title": "scenario format",
        "description": "description"
    },
    "tails": [
        {
            "sleep": 0,
            "tail": {},
            "when": {
                "css selector": {
                    "ownerDocument.hash": "regex | null",
                    "ownerDocument.host": "regex | null",
                    "ownerDocument.hostname": "regex | null",
                    "ownerDocument.href": "regex | null",
                    "ownerDocument.origin": "regex | null",
                    "ownerDocument.pathname": "regex | null",
                    "ownerDocument.port": "regex | null",
                    "ownerDocument.protocol": "regex | null",
                    "ownerDocument.search": "regex | null",
                    "innerText": "regex | null",
                    "...": "regex | null"
                }
            }
        }
    ]
}
```
