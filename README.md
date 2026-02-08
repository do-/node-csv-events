![workflow](https://github.com/do-/node-csv-events/actions/workflows/main.yml/badge.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

[`csv-events`](https://github.com/do-/node-csv-events) is a node.js library for reading [CSV](https://datatracker.ietf.org/doc/html/rfc4180) files featuring two classes:

* `CSVEventEmitter`: a low level event emitter;
* `CSVReader`: an application level object stream transformer.

# Installation
```
npm install csv-events
```

# `CSVReader` 

This is an asynchronous [CSV](https://datatracker.ietf.org/doc/html/rfc4180) parser implemented as a [stream.Transform](https://nodejs.org/docs/latest/api/stream.html#class-streamtransform) from a binary readable stream representing utf-8 encoded input into a readable object stream.

Each CSV line read produces one output object. The mapping is defined when creating the `CSVReader` instance.

```js
const {CSVReader} = require ('csv-events')

const csv = CSVReader ({
//  delimiter: ',',
//  skip: 0,           // header lines
//  rowNumField: '#',  // how to name the line # property
//  rowNumBase: 1,     // what # has the 1st not skipped line
//  empty: null,
    columns: [
      'id',            // 1st column: read as `id`, unquote
      null,            // 2nd column: to ignore
      {
        name: 'name',  // 3rd column: read as `name`
//      raw: true      // if you prefer to leave it quoted
      }, 
    ]
})

myReadUtf8CsvTextStream.pipe (csv)

for await (const {id, name} of csv) {
// do something with `id` and `name` 
}
```

## Constructor Options
|Name|Default value|Description|
|-|-|-|
|`columns`| |Array of column definitions (see below)|
|`delimiter`|`','`|Column delimiter|
|`skip`|`0`|Number of header lines to ignore|
|`rowNumField`|`null`|The name of the line # property (`null` for no numbering)|
|`rowNumBase`|`1 - skip`|The 1st output record line # |
|`empty`|`null`|The `value` corresponding to zero length cell content|
|`maxLength`|1e6|The maximum cell length allowed (to prevent a memory overflow)|
### More on `columns`
Specifying `columns` is mandatory to create a `CSVReader`. It must be an array which every element is:
* either `null` (for columns to bypass)
* or a `{name, raw}` object
  * that can be shortened to a string `name`.

`name`s are used as keys when constructing output objects.

Corresponding values are `string`s, except for the zero length case when the `empty` option value is used instead, `null` by default.

Normally, those string values come unquoted, but by using the `raw` option, one can turn off this processing. This may have sense in two cases:
* the values read are immediately printed into another CSV stream, so quotes are reused;
* for data guaranteed to be printed as is, reading raw cells content is slightly faster.

For CSV rows with less cells than `columns.length`, properties my be missing. The `\n` CSV will be read as a single `{}` object.

# `CSVEventEmitter` 

This is a synchronous [CSV](https://datatracker.ietf.org/doc/html/rfc4180) parser implemented as an [event emitter](https://nodejs.org/dist/latest/docs/api/events.html).

```js
const {CSVEventEmitter} = require ('csv-events')

const ee = new CSVEventEmitter ({
   mask: 0b101 // only 1st and 3rd column will be signaled
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
|`mask`|`0`|Bit mask of required fields, `0` means 'all'|
|`delimiter`|`','`|Column delimiter|
|`empty`|`null`|The `value` corresponding to zero length cell content|
|`maxLength`|1e6|The maximum `buf.length` allowed (inherently, the maximum length of `write` and `end` arguments)|

# Methods
|Name|Description|
|-|-|
|`write (s)`| Append `s` to the internal buffer `buf` and emit all events for its parseable part; leave last unterminated cell source in `buf`|
|`end (s)`| Execute `write (s)` and emit last events for the rest of `buf` and, finally, emits `'end'`|

# Events
|Name|Payload|Description|
|-|-|-|
|`c`|`column`| Emitted for each cell which number satisfies `mask` when its content is available (via `value` and `raw` properties, see below)|
|`r`| | Emitted for each row completed|
|`end`| | Emitted by `end (s)`|

# Properties
|Name|Type|Description|
|-|-|-|
|`unit`|Number or Bigint|`1` corresponding to `mask` by type|
|`row`|BigInt|Number of the current row: `0n` for the CSV header, if present|
|`column`|Number|Number of the current column, `0` based|
|`index`|Number or Bigint|Single bit mask corresponding to `column` (2**column)|
|`buf`|String|The internal buffer containing unparsed portion of the text gathered from `write` arguments|
|`from`|Number|Starting position of the current cell in `buf`|
|`to`|Number|Ending position of the current cell in `buf`|
|`raw`|String|Verbatim copy of `buf` between `from` and `to`, except row delimiters (computed property)|
|`value`|String|Unquoted `raw`, replaced with `empty` for a zero length string (computed property)|

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

The best `csv-events` can do in such case is not to waste too much memory keeping its internal buffer not bigger than `maxLength` characters.
