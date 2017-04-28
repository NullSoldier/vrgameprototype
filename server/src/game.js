const Destroyer = require('./threats/destroyer');
const GameTimer = require('./gametimer');
const Ship      = require('./ship');
const Track     = require('./track');
const VECTORS   = require('./constants').VECTORS;
const GAME_STATE   = require('./constants').GAME_STATE;


const TURN_LENGTH = 200;

class Game {
	constructor() {
		this.turn = 0;
		this.turnTimer = new GameTimer(TURN_LENGTH);
		this.ship = new Ship();
		this.threats = [];
		this.state = GAME_STATE.WAITING;
		this.nextState = null;
		
		this.tracks = {};
		this.tracks[VECTORS.LEFT] = new Track(this, VECTORS.LEFT, 15, 12, 8, 0);
		this.tracks[VECTORS.CENTER] = new Track(this, VECTORS.CENTER, 15, 12, 8, 0);
		this.tracks[VECTORS.RIGHT] = new Track(this, VECTORS.RIGHT, 15, 12, 8, 0);
	}

	start() {
		this.goToState(GAME_STATE.PLAYING);
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
			this.render(true);
		}
	}

	PLAYING_enter() {
		console.log('Starting the game...');
	}

	FAIL_enter() {
		console.log('Players lose the game');
	}

	nextTurn() {
		this.turn++;
		console.log('Turn ' + this.turn)

		this.threats.forEach(t => t.move());

		if(this.turn === 1)
			this.spawnThreat(VECTORS.LEFT);

		if(this.turn === 6)
			this.spawnThreat(VECTORS.RIGHT);

		if(this.turn === 4)
			this.spawnThreat(VECTORS.LEFT);

		if(this.isShipDead())
			this.goToState(GAME_STATE.FAIL);
	}

	isShipDead() {
		return (
			this.ship.health[VECTORS.LEFT] <= 0 ||
			this.ship.health[VECTORS.CENTER] <= 0 ||
			this.ship.health[VECTORS.RIGHT] <= 0);
	}

	spawnThreat(vector) {
		this.threats.push(new Destroyer(this, this.tracks[vector]));
	}

	render(clear) {
		var buffer = [];

		for(var threat of this.threats) {
			buffer.push(threat.renderStats() + '\n' + threat.renderAttacks() + '\n');
		}

		buffer.push('');
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