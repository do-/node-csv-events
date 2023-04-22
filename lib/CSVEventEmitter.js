const CH_QQ = '"'.charCodeAt (0)
const CH_CR = 13
const CH_LF = 10

const EventEmitter = require ('events')

class CSVEventEmitter extends EventEmitter {

	constructor (options = {}) {
	
		super ()

	

		if (!('maxLength' in options)) options.maxLength = 1e6
		
		if (!Number.isSafeInteger (options.maxLength)) throw Error ('maxLength must be a safe integer')

		if (options.maxLength <= 0) throw Error ('maxLength must be positive')
		
		this.maxLength = options.maxLength



		if (!('delimiter' in options)) options.delimiter = ','
		
		if (typeof options.delimiter !== 'string') throw Error ('The delimiter must be a string')

		if (options.delimiter.length !== 1) throw Error ('The delimiter must be 1-char string')
				
		this.delimiterCode = options.delimiter.charCodeAt (0)

		
		this.lastDelimiter = CH_LF
		this.buf = ''

	}
	
	cell (s, d) {
	
		if (this.lastDelimiter === CH_LF) this.emit ('r')
		
		this.emit ('c', s.trimRight ())
		
		this.lastDelimiter = d
	
	}
	
	write (s) {
		
		if (this.buf.length + s.length > this.maxLength) throw Error ('Buffer overflow (maybe a wrongly quoted string)')

		this.buf += s
		
		const {length} = this.buf; if (length === 0) return
		
		const {buf, delimiterCode} = this
		
		let pos = 0, isQuoted = false; for (let i = 0; i < length; i ++) {
		
			const c = buf.charCodeAt (i)
			
			if (isQuoted) {

				switch (c) {
				
					case CH_LF:
					case delimiterCode:

						if (
							i > 1
							&& buf.charCodeAt (i - 1) === CH_QQ
							&& buf.charCodeAt (i - 2) !== CH_QQ
						) {
							this.cell (buf.slice (pos, i), c)
							pos = i + 1
							isQuoted = false
						}

					break

				}			

			}
			else {

				switch (c) {
				
					case CH_LF:
					case delimiterCode:
						this.cell (buf.slice (pos, i), c)
						pos = i + 1
						break
						
					case CH_QQ:
						isQuoted = true
						break
				
				}
			
			}

		}
		
		this.buf = this.buf.slice (pos)
			
	}
	
	end (s = '') {
	
		if (s.length !== 0) this.write (s)

		const {buf} = this;	if (buf.length === 0) return

		this.emit ('c', buf)

	}

	static unquote (s) {
	
		if (s.length === 0 || s.charCodeAt (0) !== CH_QQ) return s
		
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