const {CSVEventEmitter} = require ('..')

test ('default delimiter', () => {
	expect (new CSVEventEmitter ({mask: 0xF}).maxLength).toBe (1e6)
})

test ('explicit delimiter', () => {
	expect (new CSVEventEmitter ({maxLength: 100, mask: 0xF}).maxLength).toBe (100)
})

test ('bad delimiter value', () => {
	expect (() => new CSVEventEmitter ({maxLength: 0, mask: 0xF})).toThrow ()
	expect (() => new CSVEventEmitter ({maxLength: 1e100, mask: 0xF})).toThrow ()
})

test ('bad delimiter type', () => {
	expect (() => new CSVEventEmitter ({maxLength: '100', mask: 0xF})).toThrow ()
})
