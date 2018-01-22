import ava from 'ava';
import * as db from 'dynongo';
import { stub } from './fixtures/stub';
import * as base64 from '../lib/util/base64';
import m from '..';

const test = ava.serial;

stub(test);

test('retrieve all results', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 20,
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '1' },
			{ foo: 'bar', bar: '2' },
			{ foo: 'bar', bar: '3' }
		],
		paging: {}
	});
});

test('retrieve page with where', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 20,
		where: {
			bar: '1'
		},
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '1' }
		],
		paging: {}
	});
});

test('retrieve all results in reverse order', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 20,
		sort: -1,
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '3' },
			{ foo: 'bar', bar: '2' },
			{ foo: 'bar', bar: '1' }
		],
		paging: {}
	});
});

test('retrieve first page', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 1,
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '1' }
		],
		paging: {
			after: base64.encode(JSON.stringify({foo: 'bar', bar: '1'}))
		}
	});
});

test('retrieve second page with after', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 1,
		after: base64.encode(JSON.stringify({foo: 'bar', bar: '1'})),
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '2' }
		],
		paging: {
			after: base64.encode(JSON.stringify({foo: 'bar', bar: '2'})),
			before: base64.encode(JSON.stringify({foo: 'bar', bar: '2'}))
		}
	});
});

test('retrieve second page with before', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 2,
		before: base64.encode(JSON.stringify({foo: 'bar', bar: '3'})),
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '1' },
			{ foo: 'bar', bar: '2' }
		],
		paging: {
			after: base64.encode(JSON.stringify({foo: 'bar', bar: '2'}))
		}
	});
});

test('retrieve last page', async t => {
	const result = await m(t.context.table, {foo: 'bar'}, {
		limit: 1,
		after: base64.encode(JSON.stringify({foo: 'bar', bar: '2'})),
		elementIndex: () => ['foo', 'bar']
	});

	t.deepEqual(result, {
		items: [
			{ foo: 'bar', bar: '3' }
		],
		paging: {
			before: base64.encode(JSON.stringify({foo: 'bar', bar: '3'}))
		}
	});
});
