![workflow](https://github.com/do-/node-csv-events/actions/workflows/main.yml/badge.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

`CSVEventEmitter` is a [CSV](https://datatracker.ietf.org/doc/html/rfc4180) parser implemented as an [event emitter](https://nodejs.org/dist/latest/docs/api/events.html).

```js
const {CSVEventEmitter} = require ('csv-events')

const ee = new CSVEventEmitter ({
// delimiter: ',',
// empty: null,
// maxLength: 1e6,
})

const names = []; ee.on ('c', () => {
  if (ee.row !== 0n && ee.column === 1) names.push (ee.value)
})

ee.write ('ID,NAME\r\n')
ee.write ('1,admin\n')
ee.end ('2,user\n') // `names` will be ['admin', 'user']
```

Incoming data in form of [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)s are supplied via the `write` and `end` synchronous methods (this API is loosely based on [StringDecoder](https://nodejs.org/dist/latest/docs/api/string_decoder.html)'s one) producing a sequence of `c` (_"cell"_) and `r` (_"row"_) events.

No event carries any payload, though the parsed content details such as
* row, column numbers;
* unquoted cell content

are available via the `CSVEventEmitter` instance properties. This approach lets the application read selected portions of incoming text avoiding some overhead related to data not in use.

# Installation
```
npm install csv-events
```

# Constructor Options
|Name|Default value|Description|
|-|-|-|
|`delimiter`|`','`|Column delimiter|
|`empty`|`null`|The `value` corresponding to zero length cell content|
|`maxLength`|1e6|The maximum `buf.length` allowed (inherently, the maximum length of `write` and `end` arguments)|

# Methods
|Name|Description|
|-|-|
|`write (s)`| Append `s` to the internal buffer `buf` and emit all events for its parseable part; leave last unterminated cell source in `buf`|
|`end (s)`| Execute `write (s)` and emit last events for the rest of `buf`|

# Events
|Name|Description|
|-|-|
|`c`| Emitted for each cell when its content is available (via the `value` property, see below)|
|`r`| Emitted for each row completed|

# Properties
|Name|Type|Description|
|-|-|-|
|`row`|BigInt|Number of the current row: `0n` for the CSV header, if present|
|`column`|Number|Number of the current column, `0` based|
|`buf`|String|The internal buffer containing unparsed portion of the text gathered from `write` arguments|
|`from`|Number|Starting position of the current cell in `buf`|
|`to`|Number|Ending position of the current cell in `buf`|
|`value`|String|Unquoted value of `buf.slice (from, to)`, replaced with `empty` for a zero length string (computed property)|

# Limitations
## Line Breaks
`CSVEventEmitter` always recognizes both:
* `CRLF` (`'\r\n'`, RFC 4180, Windows style) and
* `LF`  (`'\n'`, UNIX style)
as line breaks without explicit option setting.

There is no way to apply `CSVEventEmitter` directly to texts generated with MacOS pre-X, Commodore, Amiga etc. neither any plans to implement such compatibility features.

## CSV Validity
`CSVEventEmitter` doesn't make any attempt to restore data from broken CSV source. So, a single unbalanced double quote will make all the rest of file lost.

The best `CSVEventEmitter` can do in such case is not to waste too much memory keeping its internal buffer not bigger than `maxLength` characters.
