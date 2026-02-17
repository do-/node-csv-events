const CSVColumnBase = require ('./CSVColumnBase')

class CSVColumn extends CSVColumnBase {

	get value () {

		return this.reader.csv.value

	}

}

module.exports = CSVColumn