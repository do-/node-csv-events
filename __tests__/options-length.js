const {CSVEventEmitter} = require ('..')

test ('default delimiter', () => {
	expect (new CSVEventEmitter ().maxLength).toBe (1e6)
})

test ('explicit delimiter', () => {
	expect (new CSVEventEmitter ({maxLength: 100}).maxLength).toBe (100)
})

test ('bad delimiter value', () => {
	expect (() => new CSVEventEmitter ({maxLength: 0})).toThrow ()
	expect (() => new CSVEventEmitter ({maxLength: 1e100})).toThrow ()
})

test ('bad delimiter type', () => {
	expect (() => new CSVEventEmitter ({maxLength: '100'})).toThrow ()
})
