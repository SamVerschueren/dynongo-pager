# dynongo-pager [![Build Status](https://travis-ci.org/SamVerschueren/dynongo-pager.svg?branch=master)](https://travis-ci.org/SamVerschueren/dynongo-pager)

> Easy paging for DynamoDB with [dynongo](https://github.com/SamVerschueren)


## Install

```
$ npm install --save dynongo-pager
```

> Note: this package has a peer dependency on `dynongo@0.14.0` or higher.


## Usage

```js
const db = require('dynongo');
const pager = require('dynongo-pager');

// Connect with the database
db.connect();

const Document = db.table('Document');

pager(Document, {user: '1'}, {
	limit: 2,
	elementIndex: () => ['user', 'date']
}).then(page1 => {
	console.log(page1);
	/**
	 * {
	 *   items: [
	 *     { user: '1', date: '2017-07-28T18:33:12Z', src: 'foo.pdf' },
	 *     { user: '1', date: '2017-07-29T12:18:56Z', src: 'bar.pdf' }
	 *   ],
	 *   paging: {
	 *     after: 'eyJ1c2VyIjoiMSIsImRhdGUiOiIyMDE3LTA3LTI5VDEyOjE4OjU2WiJ9'
	 *   }
	 * }
	 */

	return pager(Document, {user: 1}, {
		limit: 2,
		after: page1.paging.after,
		elementIndex: () => ['user', 'date']
	});
}).then(page2 => {
	console.log(page2);
	/**
	 * {
	 *   items: [
	 *     { user: '1', date: '2017-07-30T06:26:11Z', src: 'unicorn.pdf' },
	 *     { user: '1', date: '2017-07-31T08:04:10Z', src: 'rainbow.pdf' }
	 *   ],
	 *   paging: {
	 *     before: 'eyJ1c2VyIjoiMSIsImRhdGUiOiIyMDE3LTA3LTMwVDA2OjI2OjExWiJ9',
	 *     after: 'eyJ1c2VyIjoiMSIsImRhdGUiOiIyMDE3LTA3LTMxVDA4OjA0OjEwWiJ9'
	 *   }
	 * }
	 */
});
```

In the example above, we query the `Documents` table to retrieve all the documents of the user with ID `1`. The `user` property is the partion key, and the `date` property is the sort key.

The `before` value is the base64 encoded representation of the index (partition key and sort key) of the first element in the items list. The `after` value is the base64 encode representation of the index of the last element in the items list.


## API

### pager(table, index, [options])

#### table

Type: `Table`

Dynongo table.

#### index

Type: `Object`

Partition key.

#### options

##### elementIndex

*Required*<br>
Type: `function`

Function that should return the properties being part of the index. The function accepts an argument being the name of the index that's being used to query the database.

##### limit

Type: `number`

Limit of items per page. If not provided, the page will retrieve as many items as possible which is 1MB in size.

##### after

Type: `string`

Token to retrieve the next page.

##### before

Type: `string`

Token to retrieve the previous page.

##### from

Type: `string` `number` `boolean`

Lower boundary of the sort key.

##### to

Type: `string` `number` `boolean`

Upper boundary of the sort key.

##### indexName

Type: `string`

Name of the index to use.

##### select

Type: `string`

Space separated list of the values you want to retrieve.

##### where

Type: `object`

Filter object.

##### sort

Type: `number`<br>
Options: `1` `-1`

Sort the values ascending (`1`) or descending (`-1`).


## Related

- [dynongo](https://github.com/SamVerschueren/dynongo) - MongoDB like syntax for DynamoDB


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
