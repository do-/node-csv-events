const {CSVEventEmitter} = require ('..')

test ('overflow', () => {

	const c = new CSVEventEmitter ({maxLength: 10})
	
	c.write ('12345')

	expect (() => c.write ('123456')).toThrow ()

})

