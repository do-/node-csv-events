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

This is an asynchronous [CSV](https://datatracker.ietf.org/doc/html/rfc4180) parser implemented as an object mode [stream.Transform](https://nodejs.org/docs/latest/api/stream.html#class-streamtransform).

```js
const {CSVReader, CSVColumn} = require ('csv-events')

const csv = CSVReader ({
//  delimiter: ',',
//  skip: 0,             // header lines
//  rowNumField: '#',    // how to name the line # property
//  rowNumBase: 1,       // what # has the 1st not skipped line
//  empty: null,         // how to interpret empty values (`''`)

//  recordClass: Array   // to get [id, name] instead of {id, name}

//  columnClass: class extends CSVColumn {...}
    columns: [
      'id',              // 1st column: read as `id`
      null,              // 2nd column: to ignore
      [
        'name',          // 3rd column: read as `name`
//      'VARCHAR2',      // may be used by the custom `columnClass`
//      ...
      ]

//    header: 2,         // to read `columns` from first two CSV lines 
//    mask: 0b101,       // only the 1st and 3rd column will be read
//    maxColumns: 16384, // leak protection: 16384 is the Excel limit

})

myReadUtf8CsvTextStream.pipe (csv)

for await (const {id, name} of csv) {
// do something with `id` and `name` 
}
```

# Description

The input stream must be a utf-8 encoded CSV text with either `CRLF` (`'\r\n'`) or `LF` (`'\n'`) line breaks.

In general, this text may contain:
* first, `${skip} >= 0` totally ignored lines (the margin);
* then, `${header} >= 0` lines describing the column model (e. g. one line with column names, but maybe more to specify types etc.);
* finally, the body: a sequence of uniformly formatted lines.

`CSVReader` skips the margin, reads the header and then yields one record object for each line of the body. The one exception is for a source consisting of a single line break (this is how MS Excel saves empty sheets) — in this case, no record is yielded at all.

Records may represent lines as plain `Array`s of values or as key-value dictionary objects: it's configurable via the `recordClass` option. Custom classes are allowed.

Each record may be augmented with an extra property containing the row number: this is configured via `rowNumField` and `rowNumBase` options.

It's presumed that all body lines have the same structure: at least, the same number of cells. The data model is either provided as the `columns` option, or is read from the first `${header}` lines (only `${mask}`ed columns, when set). In all cases, for each definition provided, a [CSVColumn](https://github.com/do-/node-csv-events/wiki/CSVColumn) or its descendant instance is created.

Custom `columnClass`es may carry extra metainformation (e. g. column type, default value etc.) and use it to alter output records content by overloading the `value` property getter.

# Constructor Options
## Low Level 
These options are passed to the internal [CSVEventEmitter](https://github.com/do-/node-csv-events/wiki/CSVEventEmitter) instance:
|Name|Default value|Description|
|-|-|-|
|`delimiter`|`','`|Column delimiter|
|`empty`|`null`|The `value` corresponding to zero length cell content|
|`maxLength`|1e6|The maximum cell length allowed (to prevent a memory overflow)|

## Row Selection and Numbering
|Name|Default value|Description|
|-|-|-|
|`recordClass`|`Object`|May be set as `Array`|
|`rowNumBase`|`1`|The 1st output record line # |
|`rowNumField`|`null`|The name of the line # property (`null` for no numbering)|
|`skip`|`0`|Number of top lines to ignore (before `header`, if any)|

## Column Definitions
|Name|Default value|Description|
|-|-|-|
|`columnClass`|[CSVColumn](https://github.com/do-/node-csv-events/wiki/CSVColumn)||
|`columns`||Explicit column definitions|
|`mask`|`0`|Unless `0` with `header` set, only `mask`ed columns will be read|
|`maxColumns`|`16384`|Maximum # of columns in the `header` (to prevent a memory overflow)|
|`header`|`0`|Number of lines to gather `columns` definition|
# `CSVEventEmitter` 

This is an [events](https://nodejs.org/dist/latest/docs/api/events.html) based synchronous [CSV](https://datatracker.ietf.org/doc/html/rfc4180) parser.

```js
const {CSVEventEmitter} = require ('csv-events')

const ee = new CSVEventEmitter ({
   mask: 0b101 // only 1st and 3rd column will be signaled
// delimiter: ',',
// empty: null,
// maxLength: 1e6,
})

const names = []

ee.on ('c', () => {
  if (ee.row !== 0n && ee.column === 1) names.push (ee.value)
})

ee.on ('r', () => {
  console.log (`The row #${ee.row} consisted of ${ee.column} cell(s)`)
})

ee.write ('ID,NAME\r\n')
ee.write ('1,admin\n')
ee.end   ('2,user\n') // `names` will be ['admin', 'user']
```

Incoming data are supplied as [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) arguments to `write ()` and `end ()` methods.

During each of that calls, a series of `'c'` (_"cell"_) and `'r'` (_[end of] "row"_) events is emitted.

No event carries any payload. Subscribers have access to the current cell's `value` along with its `row` and `column` number via the emitter's properties.

So, each one chunk of a CSV source is processed synchronously. Parsing а huge text at once may lead to a considerable performance degradation. In applications, using [CSVReader](https://github.com/do-/node-csv-events/wiki/CSVReader) or a similar streaming wrapper is strongly encouraged.

# Constructor Options
|Name|Default value|Description|
|-|-|-|
|`mask`|`0`|Bit mask of required fields, `0` means 'all'|
|`delimiter`|`','`|Column delimiter|
|`empty`|`null`|The `value` corresponding to zero length cell content|
|`emptyDoc`|`\r\n`|If this equals the complete CSV text, no event is emitted at all|
|`maxLength`|1e6|The maximum `buf.length` allowed (inherently, the maximum length of `write` and `end` arguments)|

# Events
|Name|Payload|Description|
|-|-|-|
|`c`|`column`| Emitted for each cell which number satisfies `mask` when its content is available (via `value` and `raw` properties, see below)|
|`r`| | Emitted for each row completed|

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
|`value`|String|Unquoted `raw`, replaced with `empty` for an unquoted zero length string (computed property)|

# Methods
## `end ([s])`
A wrapper for `write (s)` (see below) called for the last text portion `s` or without arguments which means `s === ''`.

Guarantees the last CSV line parsed to be `'\n'` terminated.

## `write (s)`
Appends `s` to the internal buffer and emits all events for its parseable part, unless `maxLength` is exceeded in wich case an error is thrown.

The unparsed text is keept buffered.

# Limitations
## Line Breaks
`CSVEventEmitter` always recognizes both:
* `CRLF` (`'\r\n'`, RFC 4180, Windows style) and
* `LF`  (`'\n'`, UNIX style)

as line breaks without explicit option setting.

There is no way to apply `CSVEventEmitter` directly to texts generated with MacOS pre-X, Commodore, Amiga etc. neither any plans to implement such compatibility features.

## CSV Validity
`CSVEventEmitter` doesn't make any attempt to restore data from broken CSV source. So, a single unbalanced double quote will mess up the rest of file.

The best `CSVEventEmitter` can do in such case is not to waste too much memory by keeping its internal buffer limited with `maxLength`.
