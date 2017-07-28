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
	Limit: 21,
	ScanIndexForward: true
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
		queryStub.withArgs(base).yields(undefined, {Items: items});
		queryStub.withArgs(Object.assign({}, base, {ScanIndexForward: false})).yields(undefined, {Items: reversedItems});
		queryStub.withArgs(Object.assign({}, base, {Limit: 2})).yields(undefined, { Items: items.slice(0, 2) });
		queryStub.withArgs(Object.assign({}, base, {Limit: 2, ExclusiveStartKey: {foo: 'bar', bar: '1'}})).yields(undefined, {Items: items.slice(1, 3)});
		queryStub.withArgs(Object.assign({}, base, {Limit: 2, ExclusiveStartKey: {foo: 'bar', bar: '2'}})).yields(undefined, {Items: items.slice(2, 4)});
		queryStub.withArgs(Object.assign({}, base, {Limit: 3, ScanIndexForward: false, ExclusiveStartKey: {foo: 'bar', bar: '3'}})).yields(undefined, {Items: reversedItems.slice(1, 3)});
	});

	test.beforeEach(t => {
		t.context.table = db.table('Table');
	});
}
