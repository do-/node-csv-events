const {Transform}     = require ('stream')
const {StringDecoder} = require ('string_decoder')
const CSVEventEmitter = require ('./CSVEventEmitter')

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

		this.record = this.newRecord ()

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

		const {length} = columns; this.columns = []

		const unit = length > 32 ? 1n : 1
		
		let mask = unit - unit

		for (let i = 0, bit = unit; i < length; i ++, bit <<= unit) {

			let col = columns [i]; if (col == null) continue

			if (typeof col === 'string') col = {name: col}

			this.columns [i] = col

			mask += bit

		}

		csvOptions.mask = mask

		this.decoder = new StringDecoder ('utf8')

		const csv = new CSVEventEmitter (csvOptions)

		this.rowNumField = options.rowNumField ?? ROW_NUM

		this.rowNum = options.rowNumBase || 1 - options.skip

		csv.on ('c', n => {

			const col = this.getColumn (n)

			this.record [col.name] = col.raw ? csv.raw : csv.value

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

	getColumn (n) {

		return this.columns [n]

	}

	onEndOfBodyLine () {

		this.push (this.record)

	}

	newRecord () {

		return {}

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