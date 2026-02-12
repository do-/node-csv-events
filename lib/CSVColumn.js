class CSVColumn {

	constructor (reader, options) {

		this.reader  = reader

		this.options = options

	}

	get value () {

		return this.reader.csv.value

	}

	copyValue () {

		this.reader.record [this.options.name] = this.value

	}

}

module.exports = CSVColumn