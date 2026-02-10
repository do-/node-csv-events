const {CSVEventEmitter} = require ('..')

test ('edge cases', () => {

	const c = new CSVEventEmitter ({mask: 0xF})

	c.write ('')
	c.end ('')

})

test ('one line no quotes', () => {

	const RESULT = ['1', '', 'supervisor']

	const p = s => {

		const c = new CSVEventEmitter ({mask: 0xF})
	
		const a = []; c.on ('c', () => a.push (c.value))
		
		c.end (s)

		return a
	
	}
	
	expect (p ('1,,supervisor')).toStrictEqual (RESULT)
	expect (p ('1,,supervisor\n')).toStrictEqual (RESULT)
	expect (p ('1,,supervisor\r\n')).toStrictEqual (RESULT)

})

