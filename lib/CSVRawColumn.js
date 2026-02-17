const CSVColumnBase = require ('./CSVColumnBase')

class CSVRawColumn extends CSVColumnBase {

	get value () {

		return this.reader.csv.raw

	}

}

module.exports = CSVRawColumn