const QQ = '"'.charCodeAt (0)

class CSVEventEmitter {

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