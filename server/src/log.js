const _ = require('lodash');

class Log {
	constructor() {
		this.items = [];
		this.prefix = '| ';
		this.delim =  '\n' + this.prefix;
	}

	write(text) {
		console.info(text);
		this.items.push(text);
	}

	render(lineItemCount) {
		var expectedCount = lineItemCount || 8;
		var items = _.takeRight(this.items, expectedCount)

		while(items.length < expectedCount)
			items.unshift('');

		return this.prefix + items.join(this.delim);
	}
}

module.exports = Log;