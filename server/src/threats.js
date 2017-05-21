const GameTimer = require('./gametimer');
const VECTORS   = require('./constants').VECTORS;

const SHOW_FIRE_TIME = 1000;

class Threat {
	constructor(game, track) {
		this.id = game.generateId();
		this.name = 'ENEMY';
		this.game = game;
		this.defense = 0;
		this.health = 0;
		this.shields = 0;
		this.track = track;
		this.distance = track.length;
		this.triggers = [track.xPos, track.yPos, track.zPos];
		this.ignoreDamage = false;
		this.isVisible = true;
		this.showFired = false;
		this.showFiredTimer = null;
		this.showFiredColor = 'purple';
	}

	attackCurrentZone(game, damage) {
		game.ship.health[this.track.vector] -= damage;
		game.onShipHit(this, damage);

		this.showFired = true;
		this.showFiredTimer = new GameTimer(SHOW_FIRE_TIME);
	}

	attackAllZones(game, damage) {
		game.ship.health[VECTORS.LEFT] -= damage;
		game.ship.health[VECTORS.CENTER] -= damage;
		game.ship.health[VECTORS.RIGHT] -= damage;
		game.onShipHit(this, damage);

		this.showFired = true;
		this.showFiredTimer = new GameTimer(SHOW_FIRE_TIME);
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

		while(this.distance <= this.triggers[0]) {
			if(this.triggers[0] === this.track.xPos) this.attackX(this.game);
			if(this.triggers[0] === this.track.yPos) this.attackY(this.game);
			if(this.triggers[0] === this.track.zPos) this.attackZ(this.game);
			this.triggers.shift();
		}
	}

	update(deltaMs) {
		if(this.showFiredTimer && this.showFiredTimer.update(deltaMs)) {
			this.showFiredTimer = null;
			this.showFired = false;
		}
	}

	serialize() {
		return {
			id            : this.id,
			name          : this.name,
			health        : this.health,
			speed         : this.speed,
			shields       : this.shields,
			track         : this.track.vector,
			triggers      : this.triggers,
			distance      : this.distance,
			isVisible     : this.isVisible,
			ignoreDamage  : this.ignoreDamage,
			showFired     : this.showFired,
			showFiredColor: this.showFiredColor,
		};
	}
}

class Destroyer extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Destroyer';
		this.speed = 2;
		this.health = 5;
		this.shields = 2;
		this.showFiredColor = 'red';
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
		this.name = 'Pulse Ball';
		this.speed = 2;
		this.health = 5;
		this.shields = 1;
		this.showFiredColor = 'purple';
	}

	attackX(game) {this.attackAllZones(this.game, 1)}
	attackY(game) {this.attackAllZones(this.game, 1)}
	attackZ(game) {this.attackAllZones(this.game, 2)}
}

class Fighter extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Fighter';
		this.speed = 3;
		this.health = 4;
		this.shields = 2;
		this.showFiredColor = 'yellow';
	}

	attackX(game) {this.attackCurrentZone(this.game, 1)}
	attackY(game) {this.attackCurrentZone(this.game, 2)}
	attackZ(game) {this.attackCurrentZone(this.game, 3)}
}

class Amobea extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Amobea';
		this.speed = 2;
		this.health = 8;
		this.shields = 0;
		this.showFiredColor = 'purple';
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
		this.name = 'Cryoshield Fighter';
		this.speed = 3;
		this.health = 4;
		this.shields = 1;
		this.ignoreDamage = true;
		this.showFiredColor = 'blue';
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
		this.name = 'Stealth Fighter';
		this.speed = 4;
		this.health = 4;
		this.shields = 2;
		this.ignoreDamage = true;
		this.isVisible = false;
		this.showFiredColor = 'blue';
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
		this.name = 'Meteoroid'
		this.speed = 5;
		this.health = 5;
		this.shields = 0;
		this.showFiredColor = 'transparent';
	}

	attackX(game) {}
	attackY(game) {}
	attackZ(game) {this.attackCurrentZone(this.game, 20)}
}

class Dummy extends Threat {
	constructor(game, track) {
		super(game, track);
		this.name = 'Dummy';
		this.speed = 2;
		this.health = 1;
		this.shields = 0;
	}

	attackX(game) {}
	attackY(game) {}
	attackZ(game) {}
}

module.exports = {
	Destroyer        : Destroyer,
	CryoshieldFighter: CryoshieldFighter,
	StealthFighter   : StealthFighter,
	Amobea           : Amobea,
	Fighter          : Fighter,
	PulseBall        : PulseBall,
	Meteoroid        : Meteoroid,
	Dummy            : Dummy,
};