class CSVColumn {

	constructor (reader, options) {

		this.reader  = reader

		this.options = options

	}

	get value () {

		return this.reader.csv.value

	}

	get name () {

		return this.options.name

	}

	copyValue () {

		const {reader: {record}, value} = this

		if (Array.isArray (record)) record.push (value); else record [this.name] = value

	}

}

module.exports = CSVColumn