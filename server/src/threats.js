const VECTORS = require('./constants').VECTORS;

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
		this.ignoreDamage = false;
		this.isVisible = true;
	}

	attackCurrentZone(game, damage) {
		game.ship.health[this.track.vector] -= damage;
		game.onShipHit();
	}

	attackAllZones(game, damage) {
		game.ship.health[VECTORS.LEFT] -= damage;
		game.ship.health[VECTORS.CENTER] -= damage;
		game.ship.health[VECTORS.RIGHT] -= damage;
		game.onShipHit();
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

	onHit() {
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

	serialize() {
		return {
			id          : this.id,
			name        : this.name,
			health      : this.health,
			speed       : this.speed,
			shields     : this.shields,
			track       : this.track.vector,
			triggers    : this.triggers,
			distance    : this.distance,
			isVisible   : this.isVisible,
			ignoreDamage: this.ignoreDamage
		};
	}
}

class Destroyer extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Destroyer#' + this.id;
		this.speed = 2;
		this.health = 5;
		this.shields = 2;
	}

	attackX(game) {this.attackCurrentZone(this.game, 1)}
	attackY(game) {this.attackCurrentZone(this.game, 2)}
	attackZ(game) {this.attackCurrentZone(this.game, 2)}

	renderAttacks() {
		return [
			'[X] Do 1 damage to zone',
			'[Y] Do 2 damage to zone',
			'[Z] Do 2 damage to zone',
		].join('\n');
	}
}

class PulseBall extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Pulse Ball #' + this.id;
		this.speed = 2;
		this.health = 5;
		this.shields = 1;
	}

	attackX(game) {this.attackAllZones(this.game, 1)}
	attackY(game) {this.attackAllZones(this.game, 1)}
	attackZ(game) {this.attackAllZones(this.game, 2)}
}

class Fighter extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Fighter #' + this.id;
		this.speed = 3;
		this.health = 4;
		this.shields = 2;
	}

	attackX(game) {this.attackCurrentZone(this.game, 1)}
	attackY(game) {this.attackCurrentZone(this.game, 2)}
	attackZ(game) {this.attackCurrentZone(this.game, 3)}
}

class Amobea extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Amobea #' + this.id;
		this.speed = 2;
		this.health = 8;
		this.shields = 0;
	}

	heal(amount, max) {
		this.health = Math.min(this.health + amount, max);
	}

	attackX(game) {this.heal(2, 8) }
	attackY(game) {this.heal(2, 8) }
	attackZ(game) {this.attackCurrentZone(this.game, 5)}
}

class CryoshieldFighter extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Cryoshield Fighter #' + this.id;
		this.speed = 3;
		this.health = 4;
		this.shields = 1;
		this.ignoreDamage = true;
	}

	onHit() {
		this.ignoreDamage = false;
	}

	attackX(game) {this.attackCurrentZone(this.game, 1)}
	attackY(game) {this.attackCurrentZone(this.game, 2)}
	attackZ(game) {this.attackCurrentZone(this.game, 2)}
}


class StealthFighter extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Stealth Fighter #' + this.id;
		this.speed = 4;
		this.health = 4;
		this.shields = 2;
		this.ignoreDamage = true;
		this.isVisible = false;
	}

	attackX(game) {
		this.isVisible = true;
		this.ignoreDamage = false;
	}

	attackY(game) {this.attackCurrentZone(this.game, 2)}
	attackZ(game) {this.attackCurrentZone(this.game, 2)}
}

class Meteoroid extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Meteoroid #' + this.id;
		this.speed = 5;
		this.health = 5;
		this.shields = 0;
	}

	attackX(game) {}
	attackY(game) {}
	attackZ(game) {this.attackCurrentZone(this.game, 20)}
}

module.exports = {
	Destroyer        : Destroyer,
	CryoshieldFighter: CryoshieldFighter,
	StealthFighter   : StealthFighter,
	Amobea           : Amobea,
	Fighter          : Fighter,
	PulseBall        : PulseBall,
	Meteoroid        : Meteoroid,
};