const {CSVEventEmitter} = require ('..')

test ('ok', () => {
	expect (new CSVEventEmitter ({mask: 1}).mask).toBe (1)
	expect (new CSVEventEmitter ({}).mask).toBe (0)
})

test ('bad', () => {
	expect (() => new CSVEventEmitter ({mask: true})).toThrow ('mask')
	expect (() => new CSVEventEmitter ({mask: 3.14})).toThrow ('mask')
})

test ('int mask', () => {

	const c = new CSVEventEmitter ({delimiter: ';', mask: 0b101})
	const e = [], cb = _ => {if (_) e.push (_)}

	let all = [], r = {}
	
	c.on ('r', () => {
		all.push (r); r = {}
	})
	
	c.on ('c', k => {
		r [k] = (c.value)
	})

	c.write ('1;true;admin\n', cb)
	c.end ('2;false;user\n', cb)

	expect (all).toStrictEqual ([
		{0: '1', 2: 'admin'},
		{0: '2', 2: 'user'},
	])

	expect (e).toHaveLength (0)

})

test ('bigint mask', () => {

	const c = new CSVEventEmitter ({delimiter: ';', mask: 0b1010n})
	const e = [], cb = _ => {if (_) e.push (_)}
	
	let all = [], r = []
	
	c.on ('r', () => {
		all.push (r); r = []
	})
	
	c.on ('c', () => {
		r.push (c.value)
	})

	c.write (';1;true;admin\n', cb)
	c.write (';2;false;user\n', cb)
	c.end ('+', cb)

	expect (all).toStrictEqual ([
		['1', 'admin'],
		['2', 'user'],
		[],
	])

	expect (e).toHaveLength (0)

})