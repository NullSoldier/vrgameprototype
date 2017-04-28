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

	getThreatAt(distance) {
		return _.find(this.game.threats, t => t.track === this && t.distance === distance);
	}

	render() {
		var result = `${this.vector}:\t`;

		for(var i=0; i < this.length; i++) {
			var ship = this.getThreatAt(i);

			if(ship) result += ship.render();
			else if(i == this.xPos) result += 'X';
			else if(i == this.yPos) result += 'Y';
			else if(i == this.zPos) result += 'Z';
			else result += '-';
		}

		return result;
	}
}

module.exports = Track;