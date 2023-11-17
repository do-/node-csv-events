const {CSVReader} = require ('..')

test ('basic', async () =>  {

	const reader = new CSVReader ({
		empty: null,
		columns: [
			'id',
			null, 
			{name: 'label', raw: true},
		]
	})

	expect (reader).toBeInstanceOf (CSVReader)

	const a = []

	await new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from ('"1",true,One\n', 'utf-8'))
		reader.end   (Buffer.from ('2,false,"Two"\n', 'utf-8'))

	})

	expect (a).toStrictEqual ([
		{id: '1', label: 'One'}, 
		{id: '2', label: '"Two"'},
	])

})

test ('bigint', () => {

	expect (new CSVReader ({columns: '_ '.repeat (32).trim ().split (' ')}).csv.unit).toBe (1)
	expect (new CSVReader ({columns: '_ '.repeat (33).trim ().split (' ')}).csv.unit).toBe (1n)

})


test ('bad options', () => {

	expect (() => new CSVReader ()).toThrow ()
	expect (() => new CSVReader ({})).toThrow ()
	expect (() => new CSVReader ({columns: {}})).toThrow ()

})

test ('bad write', async () =>  {

	const reader = new CSVReader ({
		maxLength: 1,
		columns: [
			'id',
			null, 
			{name: 'label', raw: true},
		]
	})

	expect (reader).toBeInstanceOf (CSVReader)

	await expect (new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from ('           ', 'utf-8'))

	})).rejects.toThrow ()

})

test ('bad end', async () =>  {

	const reader = new CSVReader ({
		maxLength: 1,
		columns: [
			'id',
			null, 
			{name: 'label', raw: true},
		]
	})

	expect (reader).toBeInstanceOf (CSVReader)

	await expect (new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from ([0xEF, 0xBB]))
		reader.end (Buffer.from ([0xBF]))

	})).rejects.toThrow ()

})