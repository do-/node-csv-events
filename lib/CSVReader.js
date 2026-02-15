const {Transform}     = require ('stream')
const {StringDecoder} = require ('string_decoder')
const CSVEventEmitter = require ('./CSVEventEmitter')

const ST_MARGIN = 0
const ST_HEADER = 10
const ST_BODY   = 20

const DEFAULT_MAX_COLUMNS = 16384

const ST2F = []; ST2F [ST_MARGIN] = 'skip'; ST2F [ST_HEADER] = 'header'

class CSVReader extends Transform {

	static ST_MARGIN = ST_MARGIN
	static ST_HEADER = ST_HEADER
	static ST_BODY   = ST_BODY

	#rowNum = 0
	#buf
	#bufEmpty = false

	get rowNum () {

		return this.#rowNum

	}

	set rowNum (v) {

		this.#rowNum = v

		this.record = new (this.recordClass) ()

		this.setRowNum (this.record, this.#rowNum)
	
	}

	constructor (options) {

		options.readableObjectMode = true
		options.writableObjectMode = false

		super (options)

		this.columnClass = options.columnClass ?? require ('./CSVColumn')
		this.recordClass = options.recordClass ?? Object

		if ('skip' in options) {

			if (!Number.isSafeInteger (options.skip) || options.skip < 0) throw Error ('Invalid skip option: ' + skip)

		}
		else {

			options.skip = 0

		}

		if ('header' in options) {

			const {header} = options
			
			if (!Number.isSafeInteger (header) || header < 0) throw Error ('Invalid header option: ' + header)

			if ('maxColumns' in options) {

				const {maxColumns} = options

				if (!Number.isSafeInteger (maxColumns) || maxColumns <= 0) throw Error ('Invalid maxColumns option: ' + maxColumns)

			}
			else {

				options.maxColumns = DEFAULT_MAX_COLUMNS

			}

		}
		else {

			options.header = 0

		}

		if ('columns' in options) {

			const {columns} = options; if (!Array.isArray (columns)) throw Error ('Invalid columns: ' + columns)

			this.columnDefinitions = columns

			options.skip   += options.header
			options.header  = 0

		}
		else if (options.header === 0) {

			throw Error ('No expicit `columns` nor positive `header` defined')

		}
		else {

			this.columnDefinitions = []
			
		}

		const csvOptions = {}; for (const k of ['delimiter', 'empty', 'maxLength', 'mask']) if (k in options) {

			csvOptions [k] = options [k]

			delete options [k]

		}

		this.rowNumBase  = options.rowNumBase  ?? 1
		this.rowNumField = options.rowNumField

		this.skip   = options.skip
		this.header = options.header
		this.maxColumns = options.maxColumns

		this.decoder = new StringDecoder ('utf8')

		this.csv = new CSVEventEmitter (csvOptions)
			.on ('c',  n  => this.onEndOfCell (n))
			.on ('r', ( ) => this.onEndOfLine ( ))

		if (this.state === ST_BODY) this.onStartOfBody ()

	}

	createColumn (i) {

		let arg = this.columnDefinitions [i]

		if (!arg) return null

		if (!Array.isArray (arg)) arg = [arg]

		return new (this.columnClass) (this, arg)

	}

	onStartOfBody () {

		this.rowNum = this.rowNumBase; this.columns = []

		const {csv} = this, {length} = this.columnDefinitions, unit = length > 32 ? 1n : 1

		csv.mask = unit - unit

		for (let i = 0, bit = unit; i < length; i ++, bit <<= unit) {
			
			if ((this.columns [i] = this.createColumn (i)) == null) continue

			csv.mask += bit

		}

	}

	get state () {

		if (this.skip !== 0) return ST_MARGIN

		if (this.header !== 0) return ST_HEADER

		return ST_BODY

	}

	onEndOfBodyLine () {

		if (this.#buf != null) this.push (this.#buf)

		this.#buf      = this.record
		this.#bufEmpty = (this.csv.to === 0)

		this.rowNum ++

	}

	onEndOfHeaderCell (n) {

		if (n >= this.maxColumns) return this.destroy (Error (`Maximum number of columns (${this.maxColumns}) exceeded`))

		const {columnDefinitions} = this

		if (!columnDefinitions [n]) columnDefinitions [n] = []

		columnDefinitions [n] [this.rowNum] = this.csv.value

	}

	onEndOfBodyCell (n) {

		this.columns [n].copyValue ()

	}

	onEndOfCell (n) {

		switch (this.state) {

			case ST_HEADER: return this.onEndOfHeaderCell (n)

			case ST_BODY: return this.onEndOfBodyCell (n)

		}

	}

	onEndOfLine () {

		const oldState = this.state; if (oldState === ST_BODY) return this.onEndOfBodyLine ()

		this [ST2F [oldState]] --; switch (this.state) {

			case oldState : return this.#rowNum ++

			case ST_BODY  : return this.onStartOfBody ()

			default       : return this.#rowNum = 0

		}

	}

	setRowNum (record, rowNum) {

		const {rowNumField} = this; if (rowNumField == null) return

		record [rowNumField] = rowNum

	}

	_transform (chunk, _, callback) {

		this.csv.write (this.decoder.write (chunk), callback)

	}

	_flush (callback) {

		this.csv.end (this.decoder.end (), err => {

			if (!err && this.#buf != null && (!this.#bufEmpty || this.rowNum !== this.rowNumBase + 1)) this.push (this.#buf)

			callback (err)

		})

	}

}

module.exports = CSVReader