const {Transform}     = require ('stream')
const {StringDecoder} = require ('string_decoder')
const CSVEventEmitter = require ('./CSVEventEmitter')
const CSVColumn       = require ('./CSVColumn')

const ROW_NUM = Symbol ('ROW_NUM')

const ST_MARGIN = 0
const ST_HEADER = 10
const ST_BODY   = 20

class CSVReader extends Transform {

	static ROW_NUM   = ROW_NUM

	static ST_MARGIN = ST_MARGIN
	static ST_HEADER = ST_HEADER
	static ST_BODY   = ST_BODY

	#rowNum

	get rowNum () {

		return this.#rowNum

	}

	set rowNum (v) {

		this.record = new (this.recordClass) ()

		this.setRowNum (this.record, this.#rowNum = v)
	
	}

	constructor (options) {

		if (!('columns' in options)) throw Error ('columns not defined')

		const {columns} = options; if (!Array.isArray (columns)) throw Error ('Invalid columns: ' + columns)

		if ('skip' in options) {

			if (!Number.isSafeInteger (options.skip) || options.skip < 0) throw Error ('Invalid skip option: ' + skip)

		}
		else {

			options.skip = 0

		}

		const csvOptions = {}; for (const k of ['delimiter', 'empty', 'maxLength']) if (k in options) {

			csvOptions [k] = options [k]

			delete options [k]

		}

		options.readableObjectMode = true
		options.writableObjectMode = false

		super (options)

		this.skip = options.skip

		this.recordClass = options.recordClass ?? Object

		this.columns = columns.map (col => col ? new CSVColumn (this, typeof col === 'string' ? {name: col} : col) : null)

		const {length} = this.columns, unit = length > 32 ? 1n : 1

		let mask = unit - unit

		for (let i = 0, bit = unit; i < length; i ++, bit <<= unit) if (this.columns [i] != null) mask += bit

		csvOptions.mask = mask

		this.decoder = new StringDecoder ('utf8')

		const csv = new CSVEventEmitter (csvOptions)

		this.rowNumField = options.rowNumField ?? ROW_NUM

		this.rowNum = options.rowNumBase || 1 - options.skip

		csv.on ('c', n => {

			switch (this.state) {

				case ST_BODY:
					this.columns [n].copyValue ()
					break

			}

		})

		csv.on ('r', () => {

			switch (this.state) {

				case ST_MARGIN: 
					this.skip --
					break

				case ST_BODY:   
					this.onEndOfBodyLine ()
					break

			}

			this.rowNum ++

		})

		this.csv = csv

	}

	get state () {

		if (this.skip !== 0) return ST_MARGIN

		return ST_BODY

	}

	onEndOfBodyLine () {

		this.push (this.record)

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