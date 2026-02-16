const {CSVEventEmitter} = require ('..')

test ('edge cases', () => {

	const c = new CSVEventEmitter ({mask: 0xF})

	const e = [], cb = _ => {if (_) e.push (_)}

	c.write ('', cb)
	c.end ('', cb)

	expect (e).toHaveLength (0)

})

test ('one line no quotes', async () => {

	const RESULT = ['1', '', 'supervisor']

	const p = s => new Promise (ok => {

		const c = new CSVEventEmitter ({mask: 0xF})
	
		const a = []; c.on ('c', () => a.push (c.value))

		c.write (s, e => e ? fail (e) : '')
		c.end ('', () => ok (a))

	})
	
	expect (await p ('1,,supervisor')).toStrictEqual (RESULT)
	expect (await p ('1,,supervisor\n')).toStrictEqual (RESULT)
	expect (await p ('1,,supervisor\r\n')).toStrictEqual (RESULT)

})