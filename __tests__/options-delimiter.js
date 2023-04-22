const {CSVEventEmitter} = require ('..')

test ('bad delimiter type', () => {
	expect (() => new CSVEventEmitter ({delimiter: 0})).toThrow ()
})

test ('bad delimiter length', () => {
	expect (() => new CSVEventEmitter ({delimiter: ''})).toThrow ()
	expect (() => new CSVEventEmitter ({delimiter: '??'})).toThrow ()
})

test ('default delimiter', () => {
	expect (new CSVEventEmitter ().delimiterCode).toBe (44)
})

test ('default delimiter', () => {
	expect (new CSVEventEmitter ({delimiter: ';'}).delimiterCode).toBe (59)
})
