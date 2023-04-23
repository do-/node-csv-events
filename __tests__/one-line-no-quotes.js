const {CSVEventEmitter} = require ('..')

test ('edge cases', () => {

	const c = new CSVEventEmitter ({})

	c.write ('')
	c.end ()

})

test ('one line no quotes', () => {

	const c = new CSVEventEmitter ({})
	
	const a = []; c.on ('c', () => a.push (c.value))
	
	c.end ('1,,3')

	expect (a).toStrictEqual (['1', '', '3'])

})

