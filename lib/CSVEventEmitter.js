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
		this.row = 0n
		this.column = 0
		this.isBalanced = true

	}
	
	write (s) {
	
		const oldLength = this.buf.length; if (oldLength + s.length > this.maxLength) throw Error ('Buffer overflow (maybe a wrongly quoted string)')

		this.buf += s
		
		const {buf, CH_COMMA} = this, {length} = buf; if (length === 0) return
		
		for (let i = oldLength; i < length; i ++) {
		
			const c = buf.charCodeAt (i)
			
			switch (c) {
			
				case CH_QQ:
					this.isBalanced = !this.isBalanced
					break

				case CH_LF:
				case CH_COMMA:
					if (!this.isBalanced) break
					this.to = i
					this.emit ('c')
					this.from = i + 1
					if (c === CH_LF) {
						this.emit ('r')
						this.row ++
						this.column = 0
					}
					else {
						this.column ++
					}
					break

			}
		
		}
		
		this.buf = buf.slice (this.from)
		
		this.from = 0
			
	}
	
	end (s = '') {
	
		if (s.length !== 0) this.write (s)

		if (this.buf.length !== 0) {
			this.emit ('c')
			this.emit ('r')	
		}

		this.emit ('end')

	}

	get raw () {
	
		let {buf, from, to} = this

		if (buf.charCodeAt (to) === CH_LF && buf.charCodeAt (to - 1) === CH_CR) to --

		return buf.slice (from, to)

	}
		
	get value () {
	
		let {buf, from, to} = this

		if (buf.charCodeAt (to) === CH_LF && buf.charCodeAt (to - 1) === CH_CR) to --

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