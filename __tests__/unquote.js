const {CSVEventEmitter} = require ('..')

test ('empty', () => {
	expect (CSVEventEmitter.unquote ('')).toBe ('')
})

test ('unquoted', () => {
	expect (CSVEventEmitter.unquote ('A spade')).toBe ('A spade')
})

test ('just quoted', () => {
	expect (CSVEventEmitter.unquote ('"reality"')).toBe ('reality')
})

test ('quotes in the middle', () => {
	expect (CSVEventEmitter.unquote ('"The ""best"" man"')).toBe ('The "best" man')
})

test ('quote at start', () => {
	expect (CSVEventEmitter.unquote ('"""123"')).toBe ('"123')
})

test ('quote at end', () => {
	expect (CSVEventEmitter.unquote ('"123"""')).toBe ('123"')
})

test ('quotes everywhere', () => {
	expect (CSVEventEmitter.unquote ('"""The ""best"" man"""')).toBe ('"The "best" man"')
})
