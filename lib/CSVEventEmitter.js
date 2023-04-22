const QQ = '"'.charCodeAt (0)

class CSVEventEmitter {

	constructor (options = {}) {

		if (!('maxLength' in options)) options.maxLength = 1e6
		
		if (!Number.isSafeInteger (options.maxLength)) throw Error ('maxLength must be a safe integer')

		if (options.maxLength <= 0) throw Error ('maxLength must be positive')
		
		this.maxLength = options.maxLength



		if (!('delimiter' in options)) options.delimiter = ','
		
		if (typeof options.delimiter !== 'string') throw Error ('The delimiter must be a string')

		if (options.delimiter.length !== 1) throw Error ('The delimiter must be 1-char string')
				
		this.delimiterCode = options.delimiter.charCodeAt (0)
		

		
		this.buf = ''


	}
	
	write (s) {
		
		if (this.buf.length + s.length > this.maxLength) throw Error ('Buffer overflow (maybe a wrongly quoted string)')

		this.buf += s
	
	}

	static unquote (s) {
	
		if (s.length === 0 || s.charCodeAt (0) !== QQ) return s
		
		s = s.slice (1, -1)
		
		let pos = s.indexOf ('"'); if (pos === -1) return s
		
		const last = s.length - 1
		
		let result = '', cur = 0
		
		while (pos !== -1 && cur < last) {
		
			result += s.slice (cur, pos ++)
			
			cur = pos
			
			pos = s.indexOf ('"', cur + 1)
		
		}
		
		result += cur === last ? '"' : s.slice (cur)

		return result
	
	}

}

module.exports = CSVEventEmitter