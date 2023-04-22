const {CSVEventEmitter} = require ('..')

test ('one line with quotes', () => {

	const c = new CSVEventEmitter ({})
	
	const a = []; c.on ('c', s => a.push (s))
	
	c.end ('1,"2,3",4')

	expect (a).toStrictEqual (['1', '"2,3"', '4'])

})

