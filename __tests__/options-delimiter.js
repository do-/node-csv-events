const {CSVEventEmitter} = require ('..')

test ('bad delimiter type', () => {
	expect (() => new CSVEventEmitter ({delimiter: 0, mask: 0xF})).toThrow ()
})

test ('bad delimiter length', () => {
	expect (() => new CSVEventEmitter ({delimiter: '', mask: 0xF})).toThrow ()
	expect (() => new CSVEventEmitter ({delimiter: '??', mask: 0xF})).toThrow ()
})

test ('default delimiter', () => {
	expect (new CSVEventEmitter ({mask: 0xF}).CH_COMMA).toBe (44)
})

test ('default delimiter', () => {
	expect (new CSVEventEmitter ({delimiter: ';', mask: 0xF}).CH_COMMA).toBe (59)
})
