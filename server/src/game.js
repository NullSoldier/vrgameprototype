const _          = require('lodash');
const Destroyer  = require('./threats').Destroyer;
const GAME_STATE = require('./constants').GAME_STATE;
const GameTimer  = require('./gametimer');
const ROOMS      = require('./constants').ROOMS;
const Ship       = require('./ship');
const Track      = require('./track');
const VECTORS    = require('./constants').VECTORS;


const TURN_LENGTH = 1000

class Log {
	constructor() {
		this.maxSize = 10;
		this.items = [];
	}

	write(text) {
		console.log(text);
		this.items.push(text);

		if(this.items.length > this.maxSize)
			this.items.shift();
	}

	render(text) {
		return this.items.join('\n');
	}
}

class Game {
	constructor() {
		this.turn = 0;
		this.turnTimer = new GameTimer(TURN_LENGTH);
		this.threats = [];
		this.state = GAME_STATE.WAITING;
		this.nextState = null;
		this.lastId = 0;
		this.log = new Log();
		
		this.tracks = {};
		this.tracks[VECTORS.LEFT] = new Track(this, VECTORS.LEFT, 15, 12, 8, 0);
		this.tracks[VECTORS.CENTER] = new Track(this, VECTORS.CENTER, 15, 12, 8, 0);
		this.tracks[VECTORS.RIGHT] = new Track(this, VECTORS.RIGHT, 15, 12, 8, 0);

		// dependency on tracks
		this.ship = new Ship(this);
	}

	start() {
		this.goToState(GAME_STATE.PLAYING);
	}

	generateId() {
		return ++this.lastId;
	}

	goToState(state) {
		this.nextState = state;
	}

	update(deltaMs) {
		if(this.nextState) {
			this.state = this.nextState;
			this.nextState = null;
			if(this[this.state + '_enter'])
				this[this.state + '_enter']();
		}

		if(this[this.state + '_update'])
			this[this.state + '_update'](deltaMs);
	}

	PLAYING_update(deltaMs) {
		if(this.turnTimer.update(deltaMs)) {
			this.turnTimer.reset();
			this.nextTurn();
			 // foo
			this.render(true);
		}
	}

	PLAYING_enter() {
		this.log.write('Starting the game...');
	}

	FAIL_enter() {
		this.log.write('Players lose the game');
	}

	nextTurn() {
		this.turn++;

		// if(this.turn === 3)
		// 	this.ship.rooms[ROOMS.BOTTOM_CENTER].fireGun();
		if(this.turn === 4)
			this.ship.rooms[ROOMS.BOTTOM_CENTER].fireGun();
		if(this.turn === 4)
			this.ship.rooms[ROOMS.TOP_LEFT].fireGun();
		if(this.turn === 5)
			this.ship.rooms[ROOMS.BOTTOM_CENTER].fireGun();

		this.resolveGuns();

		this.threats.forEach(t => t.move());

		if(this.isShipDead()) {
			this.goToState(GAME_STATE.FAIL);
			return;
		}

		_.filter(this.threats, t => t.distance <= 0).forEach(t => this.surviveThreat(t));

		if(this.turn === 1) {
			this.spawnThreat(VECTORS.LEFT);
			this.spawnThreat(VECTORS.CENTER);
			this.spawnThreat(VECTORS.RIGHT);
		}
		// if(this.turn === 6)
		// 	this.spawnThreat(VECTORS.RIGHT);
		// if(this.turn === 4)
		// 	this.spawnThreat(VECTORS.LEFT);
	}

	resolveGuns() {
		if(this.ship.firedGuns.length < 0)
			return;

		var totals = {};

		while(this.ship.firedGuns.length) {
			var gun = this.ship.firedGuns.pop();
			for(var target of gun.getTargets()) {
				if(!totals[target.id])
					totals[target.id] = {threat: target, value: 0};
				totals[target.id].value += gun.damage;
			}
			gun.reset();
		}

		for(var threatId in totals) {
			var threat = totals[threatId].threat;
			var amount = totals[threatId].value;
			amount -= threat.shields;
			threat.health -= amount;
			this.log.write(`${amount} damage done to ${threat.name}`)

			if(threat.health <= 0)
				this.killThreat(threat);
		}
	}

	killThreat(threat) {
		this.log.write(`${threat.name} has been killed`);
		_.remove(this.threats, t => t === threat);
	}

	surviveThreat(threat) {
		this.log.write(`${threat.name} has been survived`);
		_.remove(this.threats, t => t === threat);
	}

	isShipDead() {
		return (
			this.ship.health[VECTORS.LEFT] <= 0 ||
			this.ship.health[VECTORS.CENTER] <= 0 ||
			this.ship.health[VECTORS.RIGHT] <= 0);
	}

	spawnThreat(vector) {
		this.log.write('Threat incoming at ' + vector);
		this.threats.push(new Destroyer(this, this.tracks[vector]));
	}

	render(clear) {
		var buffer = [];

		buffer.push(this.log.render());
		buffer.push('');

		for(var threat of this.threats) {
			buffer.push(threat.renderStats() + '\n' + threat.renderAttacks() + '\n');
		}

		buffer.push(`Turn ${this.turn}`);
		buffer.push(this.tracks[VECTORS.LEFT].render());
		buffer.push(this.tracks[VECTORS.CENTER].render());
		buffer.push(this.tracks[VECTORS.RIGHT].render());
		buffer.push('');
		buffer.push(this.ship.render());

		if(clear)
			console.log('\x1B[2J');
		console.log(buffer.join('\n'));
	}
}

module.exports = Game;