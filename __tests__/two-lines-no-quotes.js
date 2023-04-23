const {CSVEventEmitter} = require ('..')

test ('two lines no quotes', () => {

	const c = new CSVEventEmitter ({delimiter: ';'})
	
	let all = [], cur = [] 
	
	c.on ('r', s => {all.push (cur); cur = []})
	c.on ('c', s => cur.push (s))
	
	c.write ('1;2,')
	c.write ('2,2;3\r\n')

	c.end ('4;5;6\r\n')

	expect (all).toStrictEqual ([
		['1', '2,2,2', '3'],
		['4', '5', '6'],
	])

})

