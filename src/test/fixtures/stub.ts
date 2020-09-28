import * as db from 'dynongo';
import * as sinon from 'sinon';

const base = {
	TableName: 'Table',
	KeyConditionExpression: '#k_foo=:v_foo',
	ExpressionAttributeNames: {
		'#k_foo': 'foo'
	},
	ExpressionAttributeValues: {
		':v_foo': 'bar'
	},
	ScanIndexForward: true
};

const whereBase = {
	...base,
	ExpressionAttributeNames: {
		'#k_foo': 'foo',
		'#k_bar': 'bar'
	},
	ExpressionAttributeValues: {
		':v_foo': 'bar',
		':v_bar': '1'
	},
	FilterExpression: '#k_bar=:v_bar'
};

const items = [
	{ foo: 'bar', bar: '1' },
	{ foo: 'bar', bar: '2' },
	{ foo: 'bar', bar: '3' }
];

const reversedItems = items.slice().reverse();

export function stub(test) {
	test.before(t => {
		db.connect();

		const queryStub = sinon.stub(db.dynamodb, 'query');
		queryStub.withArgs(Object.assign({}, base, {Limit: 21})).yields(undefined, {Items: items});
		queryStub.withArgs(Object.assign({}, whereBase, {Limit: 21})).yields(undefined, {Items: items.filter(x => x.bar === '1')});
		queryStub.withArgs(Object.assign({}, base, {Limit: 21, ScanIndexForward: false})).yields(undefined, {Items: reversedItems});
		queryStub.withArgs(Object.assign({}, base, {Limit: 2})).yields(undefined, { Items: items.slice(0, 2) });
		queryStub.withArgs(Object.assign({}, base, {Limit: 2, ExclusiveStartKey: {foo: 'bar', bar: '1'}})).yields(undefined, {Items: items.slice(1, 3)});
		queryStub.withArgs(Object.assign({}, base, {Limit: 2, ExclusiveStartKey: {foo: 'bar', bar: '2'}})).yields(undefined, {Items: items.slice(2, 4)});
		queryStub.withArgs(Object.assign({}, base, {Limit: 2, ScanIndexForward: false, ExclusiveStartKey: {foo: 'bar', bar: '3'}})).yields(undefined, {Items: items.slice(1, 3)});
		queryStub.withArgs(Object.assign({}, base, {Limit: 3, ScanIndexForward: false, ExclusiveStartKey: {foo: 'bar', bar: '3'}})).yields(undefined, {Items: reversedItems.slice(1, 3)});

		// If no `Limit` is provided, we want to test if `LastEvaluatedKey` is used to calculate the next page correctly
		queryStub.withArgs(base).yields(undefined, {Items: items.slice(0, 2), LastEvaluatedKey: '1234'});
	});

	test.beforeEach(t => {
		t.context.table = db.table('Table');
	});
}
