const {Transform}     = require ('stream')
const {StringDecoder} = require ('string_decoder')
const CSVEventEmitter = require ('./CSVEventEmitter')

const ROW_NUM = Symbol ('ROW_NUM')

const ST_MARGIN = 0
const ST_HEADER = 10
const ST_BODY   = 20

const ST2F = []; ST2F [ST_MARGIN] = 'skip'; ST2F [ST_HEADER] = 'header'

class CSVReader extends Transform {

	static ROW_NUM   = ROW_NUM

	static ST_MARGIN = ST_MARGIN
	static ST_HEADER = ST_HEADER
	static ST_BODY   = ST_BODY

	#rowNum = 0

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

			const {header} = options; if (!Number.isSafeInteger (header) || header < 0) throw Error ('Invalid header option: ' + header)

		}
		else {

			options.header = 0

		}

		if ('columns' in options) {

			const {columns} = options; if (!Array.isArray (columns)) throw Error ('Invalid columns: ' + columns)

			this.columns = columns

			options.skip   += options.header
			options.header  = 0

		}
		else if (options.header === 0) {

			throw Error ('No expicit `columns` nor positive `header` defined')

		}
		else {

			this.columns = []
			
		}

		const csvOptions = {}; for (const k of ['delimiter', 'empty', 'maxLength', 'mask']) if (k in options) {

			csvOptions [k] = options [k]

			delete options [k]

		}

		this.rowNumBase  = options.rowNumBase  ?? 1
		this.rowNumField = options.rowNumField ?? ROW_NUM

		this.skip   = options.skip
		this.header = options.header

		this.decoder = new StringDecoder ('utf8')

		this.csv = new CSVEventEmitter (csvOptions)
			.on ('c',  n  => this.onEndOfCell (n))
			.on ('r', ( ) => this.onEndOfLine ( ))

		if (this.state === ST_BODY) this.onStartOfBody ()

	}

	onStartOfBody () {

		this.rowNum = this.rowNumBase

		this.columns = this.columns.map (col => col ? new (this.columnClass) (this, Array.isArray (col) ? col : [col]) : null)

		const {csv, columns} = this, {length} = columns, unit = length > 32 ? 1n : 1

		csv.mask = unit - unit

		for (let i = 0, bit = unit; i < length; i ++, bit <<= unit) if (columns [i] != null) csv.mask += bit

	}

	get state () {

		if (this.skip !== 0) return ST_MARGIN

		if (this.header !== 0) return ST_HEADER

		return ST_BODY

	}

	onEndOfBodyLine () {

		this.push (this.record)

		this.rowNum ++

	}

	onEndOfCell (n) {

		switch (this.state) {

			case ST_HEADER:
				if (!this.columns [n]) this.columns [n] = []
				this.columns [n] [this.rowNum] = this.csv.value
				break

			case ST_BODY:
				this.columns [n].copyValue ()
				break

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

		record [this.rowNumField] = rowNum

	}

	_transform (chunk, _, callback) {

		this.csv.write (this.decoder.write (chunk), callback)

	}

	_flush (callback) {

		this.csv.end (this.decoder.end (), callback)

	}

}

module.exports = CSVReader