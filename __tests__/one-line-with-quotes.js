const {CSVEventEmitter} = require ('..')

test ('one line with quotes', () => {

	const c = new CSVEventEmitter ({})
	
	const a = []; c.on ('c', () => a.push (c.value))
	
	c.end ('1,"2,3",4')

	expect (a).toStrictEqual (['1', '2,3', '4'])

})

