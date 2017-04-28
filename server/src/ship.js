const VECTORS = require('./constants').VECTORS;

class Ship {
	constructor() {
		this.health = {}
		this.health[VECTORS.LEFT] = 6;
		this.health[VECTORS.CENTER] = 6;
		this.health[VECTORS.RIGHT] = 6;
	}

	renderRoom(buffer, originX, originY, width, height) {
		for(var i=0; i <= width - 1; ++i) {
			buffer[originY][originX + i] = 'X';
			buffer[originY + height - 1][originX + i] = 'X';
		}

		for(var i=0; i <= height - 1; ++i) {
			buffer[originY + i][originX] = 'X';
			buffer[originY + i][originX + width] = 'X';
		}

	}

	renderFront(buffer, width) {
		for(var x=0; x <= width; ++x) {
			buffer[0][x] = '^';
		}
	}

	render() {
		const WIDTH = 36;
		const HEIGHT = 11;
		var buffer = [];

		for(var y=0; y <= HEIGHT; ++y) {
			for(var x=0; x <= WIDTH; ++x) {
				if(!buffer[y])
					buffer[y] = [];
				buffer[y][x] = '.';
			}
		}

		var result = '';
		result += `LEFT HP:   ${this.health[VECTORS.LEFT]}\n`
		result += `CENTER HP: ${this.health[VECTORS.CENTER]}\n`
		result += `RIGHT HP:  ${this.health[VECTORS.RIGHT]}\n`

		this.renderFront(buffer, WIDTH);
		this.renderRoom(buffer, 0, 1, 12, 6); // TOP LEFT
		this.renderRoom(buffer, 12, 1, 12, 6); // TOP MIDDLE
		this.renderRoom(buffer, 24, 1, 12, 6); // TOP RIGHT
		this.renderRoom(buffer, 0, 6, 12, 6); // TOP LEFT
		this.renderRoom(buffer, 12, 6, 12, 6); // TOP MIDDLE
		this.renderRoom(buffer, 24, 6, 12, 6); // TOP RIGHT

		buffer[2][3] = 'A';
		buffer[2][9] = 'B';

		buffer[2][3 + 24] = 'A';
		buffer[2][9 + 24] = 'B';

		result += buffer.reduce((acc, val) => acc + '\n' + val.join(''), '');

		return result;
	}
}

module.exports = Ship;