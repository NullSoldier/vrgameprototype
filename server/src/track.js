const _ = require('lodash');

class Track {
	constructor(game, vector, length, xPos, yPos, zPos) {
		this.game = game;
		this.vector = vector;
		this.length = length;
		this.xPos = xPos;
		this.yPos = yPos;
		this.zPos = zPos;
	}

	getThreatsWithin(distance) {
		return _.filter(this.game.threats, t => t.track === this && t.distance <= distance);
	}

	render() {
		var result = `${this.vector}:\t`;

		for(var i=0; i < this.length; i++) {
			if(i == this.xPos) result += 'X';
			else if(i == this.yPos) result += 'Y';
			else if(i == this.zPos) result += 'Z';
			else result += '-';
		}

		return result;
	}

	serialize() {
		return {
			xPos  : this.xPos,
			yPos  : this.yPos,
			zPos  : this.zPos,
			length: this.length,
			vector: this.vector,
		};
	}
}

module.exports = Track;