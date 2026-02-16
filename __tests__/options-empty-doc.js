const {CSVEventEmitter} = require ('..')

test ('bad emptyDoc type', () => {
	expect (() => new CSVEventEmitter ({emptyDoc: {}})).toThrow ()
})

test ('empty emptyDoc', () => {
	expect (new CSVEventEmitter ({emptyDoc: null}).emptyDoc).toBe ('')
	expect (new CSVEventEmitter ({emptyDoc: undefined}).emptyDoc).toBe ('')
	expect (new CSVEventEmitter ({}).emptyDoc).toBe ('\r\n')
})

test ('default emptyDoc', () => {
	expect (new CSVEventEmitter ({}).emptyDoc).toBe ('\r\n')
})
