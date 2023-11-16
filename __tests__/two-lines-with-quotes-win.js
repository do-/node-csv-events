const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', async () =>  {

	const all = [], raw = []

	await new Promise ((ok, fail) => {

		const c = new CSVEventEmitter ({empty: null})
	
		let cur = [], cr = []

		c.once ('end', ok)
	
		c.on ('r', () => {
			all.push (cur); cur = []
			raw.push (cr);  cr  = []
		})

		c.on ('c', s => {
			cur.push (c.value)
			cr.push (c.raw)
		})

		try {

			c.write ('"",2')
			c.write ('2,"""..."\r\n')
		
			c.end ('4,"5\r,5\n""5"",5\r\n""",6\r\n')	
	
		}
		catch (err) {

			fail (err)

		}

	}) 

	expect (all).toStrictEqual ([
		[null, '22', '"...'],
		['4', '5\r,5\n"5",5\r\n"', '6'],
	])

	expect (raw).toStrictEqual ([
		[ '""', '22', '"""..."' ], 
		[ '4', '"5\r,5\n""5"",5\r\n"""', '6' ] 
	])

})