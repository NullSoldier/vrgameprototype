class Threat {
	constructor(game, track) {
		this.id = game.generateId();
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
		return `${this.name}, ${this.health} (HP) ${this.speed} (SP) ${this.shields} (SH)`;
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

class Destroyer extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Destroyer#' + this.id;
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

module.exports = {
	Destroyer: Destroyer,
};