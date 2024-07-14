# MMM-SpeedtestTracker

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module displays the last measured values from the speed test tracker. The module uses the REST interface of the application and does not take any measurements itself.

_Required:_ https://github.com/alexjustesen/speedtest-tracker

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
  modules: [
    {
      module: "MMM-SpeedtestTracker",
      config: {
        url: "http://192.168.0.1",
        // See below for configurable options
      },
    },
  ],
};
```

## Configuration options

| Option               | Description                                                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | _Required_ Url to the speed test tracker <br><br>**Type:** `string` <br>**Example:** `http://192.168.0.1`                                                                                                                                                                                |
| `showDownload`       | _Optional_ Display the latest Download Speed <br><br>**Type:** `boolean` <br> **Default:** `true`                                                                                                                                                                                        |
| `showUpload`         | _Optional_ Display the latest Upload Speed <br><br>**Type:** `boolean` <br> **Default:** `true`                                                                                                                                                                                          |
| `showPing`           | _Optional_ Display the latest Ping in milliseconds<br><br>**Type:** `boolean` <br> **Default:** `true`                                                                                                                                                                                   |
| `showServerName`     | _Optional_ Display the latest used server name<br><br>**Type:** `boolean` <br> **Default:** `false`                                                                                                                                                                                      |
| `showDate`           | _Optional_ Display the date time from the latest result<br><br>**Type:** `boolean` <br> **Default:** `false`                                                                                                                                                                             |
| `updateInterval`     | _Optional_ The interval in milliseconds at which new data should be retrieved by the application <br><br> **Default:** `60000` milliseconds (1 minute)                                                                                                                                   |
| `retryDelay`         | _Optional_ The time to wait if a request for data has failed in milliseconds <br><br> **Default:** `5000` milliseconds (5 seconds)                                                                                                                                                       |
| `dateFromatOptions`  | _Optional_ Here you can define the formatting of the datetime of the last result, using the function Date.toLocaleString for more details please read here: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) <br><br> **Default**: |
| `speedFormatOptions` | _Optional_ Here you can define the formatting of the download and upload, the function Intl.NumberFormat is used for more details please read here: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) <br><br> **Default**:           |
| `pingFormatOptions`  | _Optional_ Here you can define the formatting of the ping, the function Intl.NumberFormat is used for more details please read on here: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) <br><br> **Default**:                       |

dateFromatOptions:

```json
{
  "localeMatcher": "best fit",
  "timeZone": "Europe/Berlin",
  "hour12": false,
  "formatMatcher": "best fit",
  "weekday": undefined,
  "era": undefined,
  "year": "numeric",
  "month": "long",
  "day": "numeric",
  "hour": "2-digit",
  "minute": "2-digit",
  "second": "2-digit",
  "timeZoneName": "short"
}
```

speedFormatOptions:

```json
{
  "style": "unit",
  "unit": "megabit-per-second",
  "unitDisplay": "short",
  "notation": "standard",
  "minimumFractionDigits": 2,
  "maximumFractionDigits": 2
}
```

pingFormatOptions:

```json
{
  "style": "unit",
  "unit": "millisecond",
  "unitDisplay": "short",
  "minimumFractionDigits": 0,
  "maximumFractionDigits": 0
}
```
