const {CSVEventEmitter} = require ('..')

test ('overflow 1', () => {

	const c = new CSVEventEmitter ({maxLength: 10, mask: 0xF})

	const e = [], cb = _ => {if (_) e.push (_)}	

	c.write ('12345', cb)
	c.write ('123456', cb)

	expect (e).toHaveLength (1)
	expect (e [0].message).toMatch ('overflow')
	
})

test ('overflow 2', () => {

	const c = new CSVEventEmitter ({maxLength: 10, mask: 0xF})

	const e = [], cb = _ => {if (_) e.push (_)}	

	c.end ('12345123456', cb)

	expect (e).toHaveLength (1)
	expect (e [0].message).toMatch ('overflow')

})

