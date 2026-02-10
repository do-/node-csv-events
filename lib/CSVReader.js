const {Transform} = require ('stream')
const {StringDecoder} = require ('string_decoder')
const CSVEventEmitter = require ('./CSVEventEmitter');

class CSVReader extends Transform {

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

		const {length} = columns; this.columns = new Map ()

		const unit = length > 32 ? 1n : 1
		
		let mask = unit - unit

		for (let i = 0, bit = unit; i < length; i ++, bit <<= unit) {

			let col = columns [i]; if (col == null) continue

			if (typeof col === 'string') col = {name: col}

			this.columns.set (i, col)

			mask += bit

		}

		csvOptions.mask = mask

		this.decoder = new StringDecoder ('utf8')

		const csv = new CSVEventEmitter (csvOptions)		

		this.record = this.newRecord ()

		const {rowNumField} = options

		let rowNum = options.rowNumBase || 1 - options.skip

		csv.on ('c', n => {

			const {name, raw} = this.columns.get (n)

			this.record [name] = raw ? csv.raw : csv.value

		})

		csv.on ('r', () => {

			if (rowNumField != null) this.record [rowNumField] = rowNum

			if (this.skip > 0) this.skip --; else this.push (this.record)

			this.record = this.newRecord ()

			rowNum ++

		})

		this.csv = csv

	}

	newRecord () {

		return {}

	}

	_transform (chunk, _, callback) {

		this.csv.write (this.decoder.write (chunk), callback)

	}

	_flush (callback) {

		this.csv.end (this.decoder.end (), callback)

	}

}

module.exports = CSVReader