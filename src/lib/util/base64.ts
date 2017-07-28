export function encode(input) {
	return Buffer.from(input, 'utf8').toString('base64');
}

export function decode(input) {
	return Buffer.from(input, 'base64').toString('utf8');
}
