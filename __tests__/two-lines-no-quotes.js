const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () => {

	const c = new CSVEventEmitter ({delimiter: ';'})
	const e = [], cb = _ => {if (_) e.push (_)}

	let all = []
	
	c.on ('c', () => {
		if (c.row === 0n && c.column === 1) all.push (c.value)
	})

	c.write ('1;21,', cb)
	c.write ('22,23;3\n', cb)

	c.end ('4;5;6\n', cb)

	expect (all).toStrictEqual (['21,22,23'])

	expect (e).toHaveLength (0)

})