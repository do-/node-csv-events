const {CSVReader} = require ('..')

test ('basic', async () =>  {

	const reader = new CSVReader ({
		empty: null,
		rowNumField: '#',
		columns: [
			'id',
			null, 
			['label'],
		]
	})

	expect (reader).toBeInstanceOf (CSVReader)

	const a = []

	await new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from (',true,\n', 'utf-8'))
		reader.write (Buffer.from ('"1",true,One\n', 'utf-8'))
		reader.end   (Buffer.from ('2,false,"Two"\n', 'utf-8'))

	})

	expect (a).toStrictEqual ([
		{id: null, label: null, '#': 1}, 
		{id: '1', label: 'One', '#': 2}, 
		{id: '2', label: 'Two', '#': 3},
	])

})

test ('array', async () =>  {

	const reader = new CSVReader ({
		empty: null,
		recordClass: Array,
		columns: [
			'id',
			null, 
			['label'],
		]
	})

	expect (reader).toBeInstanceOf (CSVReader)

	const a = []

	await new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from (',true,\n', 'utf-8'))
		reader.write (Buffer.from ('"1",true,One\n', 'utf-8'))
		reader.end   (Buffer.from ('2,false,"Two"\n', 'utf-8'))

	})

	expect (a).toStrictEqual ([
		[null, null], 
		['1', 'One'], 
		['2', 'Two'], 
	])

	expect (a.map (_ => _[CSVReader.ROW_NUM])).toStrictEqual ([1, 2, 3])

})

test ('skip', async () =>  {

	const reader = new CSVReader ({
		skip: 2,
		rowNumField: '#',
		columns: [
			'id',
			null, 
			['label'],
		]
	})

	expect (reader).toBeInstanceOf (CSVReader)

	const a = []

	await new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from ('-----------------\n', 'utf-8'))
		reader.write (Buffer.from ('id,is_active,name\n', 'utf-8'))
		reader.write (Buffer.from ('"1",true,One\n', 'utf-8'))
		reader.end   (Buffer.from ('2,false,"Two"\n', 'utf-8'))

	})

	expect (a).toStrictEqual ([
		{'#': 1, id: '1', label: 'One'}, 
		{'#': 2, id: '2', label: 'Two'},
	])

})

test ('header', async () =>  {

	const reader = new CSVReader ({
		skip: 1,
		header: 2,
		mask: 5,
		rowNumField: '#',
	})

	expect (reader).toBeInstanceOf (CSVReader)

	const a = []

	await new Promise ((ok, fail) => {

		reader.on ('error', fail)
		reader.on ('end', ok)
		reader.on ('data', r => a.push (r))

		reader.write (Buffer.from ('-----------------\n', 'utf-8'))
		reader.write (Buffer.from ('id,is_active,label\n', 'utf-8'))
		reader.write (Buffer.from ('int,bool,text\n', 'utf-8'))
		reader.write (Buffer.from ('"1",true,One\n', 'utf-8'))
		reader.end   (Buffer.from ('2,false,"Two"\n', 'utf-8'))

	})

	expect (a).toStrictEqual ([
		{'#': 1, id: '1', label: 'One'}, 
		{'#': 2, id: '2', label: 'Two'},
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
	expect (() => new CSVReader ({columns: [], skip: null})).toThrow ()
	expect (() => new CSVReader ({columns: [], skip: -1})).toThrow ()
	expect (() => new CSVReader ({columns: [], header: -1})).toThrow ()
	expect (() => new CSVReader ({columns: [], header: 'A'})).toThrow ()

})

test ('bad write', async () =>  {

	const reader = new CSVReader ({
		maxLength: 1,
		columns: [
			'id',
			null, 
			['label'],
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
			['label'],
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