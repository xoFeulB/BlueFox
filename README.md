# BlueFox

BlueFox is a web automation tools being developed with a focusing to repurposing several security related tools.

<div align="center">

![](https://github.com/LobeliaSecurity/BlueFox/raw/main/logo.png)

</div>

## Example / 0.0.0-alpha

```json
{
  "version": 0,
  "sleep": 0,
  "dispatchEvents": ["change"],
  "actions": [
    {
      "type": "set",
      "target": "#textarea",
      "property": {
        "value": "value1"
      },
      "attribute": {
        "name": "name"
      }
    },
    {
      "type": "take",
      "target": "#textarea",
      "property": {
        "value": 0
      },
      "attribute": {
        "name": 0
      }
    },
    {
      "type": "capture",
      "target": "#myForm",
      "fileName": "myForm"
    },
    {
      "type": "save",
      "fileName": "myForm"
    },
    {
      "type": "set",
      "target": "#textarea",
      "property": {
        "value": "value2"
      },
      "attribute": {
        "name": "name"
      }
    },
    {
      "type": "take",
      "target": "#textarea",
      "property": {
        "value": 0
      },
      "attribute": {
        "name": 0
      }
    },
    {
      "type": "capture",
      "target": "#myForm",
      "fileName": "myForm"
    },
    {
      "type": "save",
      "fileName": "myForm"
    }
  ]
}
```
