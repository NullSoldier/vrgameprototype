const Threat = require('./threat');

class Destroyer extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Destroyer';
		this.speed = 2;
		this.health = 5;
		this.shields = 1;
	}

	attackX(game) {
		this.attackCurrentZone(this.game, 1);
	}

	attackY(game) {
		this.attackCurrentZone(this.game, 2);
	}

	attackZ(game) {
		this.attackCurrentZone(this.game, 2);
	}

	renderAttacks() {
		return [
			'[X] Do 1 damage to zone',
			'[Y] Do 2 damage to zone',
			'[Z] Do 2 damage to zone',
		].join('\n');
	}
}

module.exports = Destroyer;