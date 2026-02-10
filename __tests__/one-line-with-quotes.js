const {CSVEventEmitter} = require ('..')

test ('one line with quotes', () => {

	const c = new CSVEventEmitter ({mask: 0xF})

	const e = [], cb = _ => {if (_) e.push (_)}
	
	const a = []; c.on ('c', () => a.push (c.value))
	
	c.end ('1,"2,3",4', cb)

	expect (a).toStrictEqual (['1', '2,3', '4'])
	expect (e).toHaveLength (0)

})

