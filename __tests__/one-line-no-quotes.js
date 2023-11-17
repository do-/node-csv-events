const {CSVEventEmitter} = require ('..')

test ('edge cases', () => {

	const c = new CSVEventEmitter ({mask: 0xF})

	c.write ('')
	c.end ()

})

test ('one line no quotes', () => {

	const c = new CSVEventEmitter ({mask: 0xF})
	
	const a = []; c.on ('c', () => a.push (c.value))
	
	c.end ('1,,3')

	expect (a).toStrictEqual (['1', '', '3'])

})

