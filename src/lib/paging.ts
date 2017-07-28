import * as base64 from './util/base64';

export interface Options {
	limit: number;
	after?: string;
	before?: string;
	from?: string;
	to?: string;
	indexName?: string;
	select?: string;
	sort?: 1 | -1;
	elementIndex(indexName?: string): string[];
}

export interface Paging {
	after?: string;
	before?: string;
}

const firstElement = (items: any[]) => items[0];
const lastElement = (items: any[]) => items[items.length - 1];

const buildIndex = (item: any, index: string[]) => {
	const ret = Object.create(null);

	for (const prop of index) {
		ret[prop] = item[prop];
	}

	return ret;
};

export async function paging(table: any, index: any, options: Options) {
	const paging: Paging = {};

	options = Object.assign({
		sort: 1
	}, options);

	const sort = (options.before && !options.after ? -1 : 1) * options.sort;

	let findQuery = table
		.find(index, options.indexName)
		.select(options.select)
		.limit(options.limit + 1)
		.sort(sort);

	if (options.after || options.before) {
		// If `after` or `before` is provided, start from that token
		findQuery = findQuery.startFrom(JSON.parse(base64.decode(options.after || options.before)));
	}

	const items = await findQuery.exec();

	const indexProperties = options.elementIndex(options.indexName);

	if (items.length > options.limit) {
		// If we have more data, pop off the last element because it is part of the following page
		items.pop();

		if (options.before) {
			// If `before` is provided, the previous page is before the last element because the array is reversed
			paging.before = base64.encode(JSON.stringify(buildIndex(lastElement(items), indexProperties)));
		} else {
			// If `after` or nothing is provided, the next page is after the last element
			paging.after = base64.encode(JSON.stringify(buildIndex(lastElement(items), indexProperties)));
		}
	}

	if (options.after) {
		// If `after` is provided, we are likely to have a page before this one
		paging.before = base64.encode(JSON.stringify(buildIndex(firstElement(items), indexProperties)));
	} else if (options.before) {
		// If `before` is provided, we are likely to have a page after this one
		paging.after = base64.encode(JSON.stringify(buildIndex(firstElement(items), indexProperties)));

		// If `before` is provided, the data was retrieved in reverse order so the only thing left to do is reverse again
		items.reverse();
	}

	return {
		items,
		paging
	};
}
