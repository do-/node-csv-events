const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () => {

	const c = new CSVEventEmitter ({delimiter: ';'})
	
	let all = []
	
	c.on ('c', () => {
		if (c.column === 1) all.push (c.value)
	})

	c.write ('1;21,')
	c.write ('22,23;3\r\n')

	c.end ('4;5;6\r\n')

	expect (all).toStrictEqual (['21,22,23', '5'])

})