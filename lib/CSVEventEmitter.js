const CH_QQ = '"'.charCodeAt (0)
const CH_CR = 13
const CH_LF = 10

const EventEmitter = require ('events')

class CSVEventEmitter extends EventEmitter {

	constructor (options = {}) {
	
		super ()

		if (!('empty' in options)) options.empty = ''

		this.empty = options.empty

	

		if (!('maxLength' in options)) options.maxLength = 1e6
		
		if (!Number.isSafeInteger (options.maxLength)) throw Error ('maxLength must be a safe integer')

		if (options.maxLength <= 0) throw Error ('maxLength must be positive')
		
		this.maxLength = options.maxLength



		if (!('delimiter' in options)) options.delimiter = ','
		
		if (typeof options.delimiter !== 'string') throw Error ('The delimiter must be a string')

		if (options.delimiter.length !== 1) throw Error ('The delimiter must be 1-char string')
				
		this.CH_COMMA = options.delimiter.charCodeAt (0)
		
		this.buf = ''
		this.from = 0

	}
	
	write (s) {

		if (this.buf.length + s.length > this.maxLength) throw Error ('Buffer overflow (maybe a wrongly quoted string)')

		this.buf += s

		const {length} = this.buf; if (length === 0) return
		
		const {buf, CH_COMMA} = this
		
		for (let i = 0, isBalanced = true; i < length; i ++) {
		
			const c = buf.charCodeAt (i)
			
			switch (c) {
			
				case CH_QQ:
					isBalanced = !isBalanced
					break

				case CH_LF:
				case CH_COMMA:				
					if (!isBalanced) break
					this.to = i
					this.emit ('c', buf.slice (this.from, i).trimRight ())
					if (c === CH_LF) this.emit ('r')
					this.from = i + 1
					break

			}
		
		}
		
		this.buf = this.buf.slice (this.from)
		this.from = 0
			
	}
	
	end (s = '') {
	
		if (s.length !== 0) this.write (s)

		const {buf} = this;	if (buf.length === 0) return

		this.emit ('c', buf)
		this.emit ('r')

	}
	
	get value () {
	
		let {buf, from, to} = this

		if (buf.charCodeAt (to) === CH_LF) to --

		if (buf.charCodeAt (from) === CH_QQ) {
		
			from ++
			
			to --
		
		}

		if (from === to) return this.empty
		
		const s = buf.slice (from, to)
	
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