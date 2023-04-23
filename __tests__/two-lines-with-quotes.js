const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () => {

	const c = new CSVEventEmitter ({empty: null})
	
	let all = [], cur = [] 

	c.on ('r', () => {all.push (cur); cur = []})
	c.on ('c', s => {
		cur.push (c.value)
	})
	
	c.write ('"",2')
	c.write ('2,"""..."\r\n')

	c.end ('4,"5\r,5\n""5"",5\r\n""",6\r\n')

	expect (all).toStrictEqual ([
		[null, '22', '"...'],
		['4', '5\r,5\n"5",5\r\n"', '6'],
	])

})

