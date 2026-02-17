const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () =>  {

	const all = [], raw = []

	const c = new CSVEventEmitter ({empty: null, mask: 0xF})

	let cur = [], cr = []
	
	c.on ('r', () => {
		all.push (cur); cur = []
		raw.push (cr);  cr  = []
	})

	c.on ('c', s => {
		cur.push (c.value)
		cr.push (c.raw)
	})
	
	c.write ('"",2')
	c.write ('2,"""..."\n')
		
	c.end ('4,"5\r,5\n""5"",5\r\n""",6\n')

	expect (all).toStrictEqual ([
		[null, '22', '"...'],
		['4', '5\r,5\n"5",5\r\n"', '6'],
	])

	expect (raw).toStrictEqual ([
		[ '""', '22', '"""..."' ], 
		[ '4', '"5\r,5\n""5"",5\r\n"""', '6' ] 
	])

})