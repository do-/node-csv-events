const {CSVEventEmitter} = require ('..')

test ('overflow 1', () => {

	const c = new CSVEventEmitter ({maxLength: 10, mask: 0xF})

	c.write ('12345')	

	expect (() => c.write ('123456')).toThrow ('overflow')
	
})

test ('overflow 2', () => {

	const c = new CSVEventEmitter ({maxLength: 10, mask: 0xF})

	expect (() => c.end ('12345123456')).toThrow ('overflow')

})

