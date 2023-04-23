const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () => {

	const c = new CSVEventEmitter ({})
	
	const a = []; 
	
	c.on ('r', s => a.push ([]))
	c.on ('c', s => a [a.length - 1].push (s))
	
	c.write ('"",2')
	c.write ('2,3\r\n')

	c.end ('4,"5,5\n""5"",5",6\r\n')

	expect (a).toStrictEqual ([
		['""', '22', '3'],
		['4', '"5,5\n""5"",5"', '6'],
	])

})

