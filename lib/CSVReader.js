const {Transform} = require ('stream')
const {StringDecoder} = require ('string_decoder')
const CSVEventEmitter = require ('./CSVEventEmitter');

class CSVReader extends Transform {

	constructor (options) {

		if (!('columns' in options)) throw Error ('columns not defined')

		const {columns} = options; if (!Array.isArray (columns)) throw Error ('Invalid columns: ' + columns)

		const csvOptions = {}; for (const k of ['delimiter', 'empty', 'maxLength']) if (k in options) {

			csvOptions [k] = options [k]

			delete options [k]

		}

		options.readableObjectMode = true
		options.writableObjectMode = false

		super (options)

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

		this.record = {}

		csv.on ('c', n => {

			const {name, raw} = this.columns.get (n)

			this.record [name] = raw ? csv.raw : csv.value

		})

		csv.on ('r', () => {

			this.push (this.record)

			this.record = {}

		})

		this.csv = csv

	}

	_transform (chunk, encoding, callback) {

		try {

			this.csv.write (this.decoder.write (chunk))

			callback ()

		}
		catch (err) {

			callback (err)

		}

	}

	_flush (callback) {

		try {

			this.csv.end (this.decoder.end ())

			callback ()

		}
		catch (err) {

			callback (err)

		}

	}

}

module.exports = CSVReader