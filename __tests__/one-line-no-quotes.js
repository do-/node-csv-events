const {CSVEventEmitter} = require ('..')

test ('edge cases', () => {

	const c = new CSVEventEmitter ({mask: 0xF})

	const e = [], cb = _ => {if (_) e.push (_)}

	c.write ('', cb)
	c.end ('', cb)

	expect (e).toHaveLength (0)

})

test ('one line no quotes', () => {

	const RESULT = ['1', '', 'supervisor']
	const e = [], cb = _ => {if (_) e.push (_)}

	const p = s => {

		const c = new CSVEventEmitter ({mask: 0xF})
	
		const a = []; c.on ('c', () => a.push (c.value))

		c.end (s, cb)

		return a
	
	}

	expect (e).toHaveLength (0)
	
	expect (p ('1,,supervisor')).toStrictEqual (RESULT)
	expect (p ('1,,supervisor\n')).toStrictEqual (RESULT)
	expect (p ('1,,supervisor\r\n')).toStrictEqual (RESULT)

})

