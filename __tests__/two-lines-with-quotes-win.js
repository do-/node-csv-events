const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () =>  {

	const all = [], raw = []
	
	const c = new CSVEventEmitter ({empty: null, mask: 0xF})
	const e = [], cb = _ => {if (_) e.push (_)}	
	
	let cur = [], cr = []
	
	c.on ('r', () => {
		all.push (cur); cur = []
		raw.push (cr);  cr  = []
	})

	c.on ('c', s => {
		cur.push (c.value)
		cr.push (c.raw)
	})

	c.write ('"",2', cb)
	c.write ('2,"""..."\r\n', cb)
		
	c.end ('4,"5\r,5\n""5"",5\r\n""",6\r\n', e => {cb, e ? fail (e) : ok ()})	

	expect (all).toStrictEqual ([
		[null, '22', '"...'],
		['4', '5\r,5\n"5",5\r\n"', '6'],
	])

	expect (raw).toStrictEqual ([
		[ '""', '22', '"""..."' ], 
		[ '4', '"5\r,5\n""5"",5\r\n"""', '6' ] 
	])

})