class CSVColumnBase {

	constructor (reader, options) {

		this.reader = reader

		this.name = (this.options = options) [0]

	}

	copyValue () {

		const {reader: {record}, value} = this

		if (Array.isArray (record)) record.push (value); else record [this.name] = value

	}

}

module.exports = CSVColumnBase