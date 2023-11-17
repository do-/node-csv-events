const {CSVEventEmitter} = require ('..')

test ('overflow', () => {

	const c = new CSVEventEmitter ({maxLength: 10, mask: 0xF})
	
	c.write ('12345')

	expect (() => c.write ('123456')).toThrow ()

})

