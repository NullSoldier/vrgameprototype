class Threat {
	constructor(game, track) {
		this.name = 'ENEMY';
		this.game = game;
		this.speed = 0;
		this.defense = 0;
		this.health = 0;
		this.shields = 0;
		this.track = track;
		this.distance = track.length - 1;
		this.triggers = [track.xPos, track.yPos, track.zPos];
	}

	attackCurrentZone(game, damage) {
		game.ship.health[this.track.vector] -= damage;
	}

	attackAllZones(game, damage) {
		game.ship.health[VECTORS.LEFT] -= damage;
		game.ship.health[VECTORS.CENTER] -= damage;
		game.ship.health[VECTORS.RIGHT] -= damage;
	}

	attackX(game) {
		throw new Error('attackX not implemented')
	}

	attackY(game) {
		throw new Error('attackY not implemented')
	}

	attackZ(game) {
		throw new Error('attackZ not implemented')
	}

	render() {
		return 'D';
	}

	renderStats() {
		return `${this.name} ${this.health} (HP) ${this.speed} (SP) ${this.shields} (SH)`;
	}

	renderAttacks() {
		return '';
	}

	move() {
		this.distance -= this.speed;

		if(this.distance <= this.triggers[0]) {
			if(this.triggers[0] === this.track.xPos) this.attackX(this.game);
			if(this.triggers[0] === this.track.yPos) this.attackY(this.game);
			if(this.triggers[0] === this.track.zPos) this.attackZ(this.game);
			this.triggers.shift();
		}
	}
}

module.exports = Threat;