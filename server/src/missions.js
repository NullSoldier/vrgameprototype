const _          = require('lodash');
const GAME_STATE = require('./constants').GAME_STATE;
const GameTimer  = require('./gametimer');
const threats    = require('./threats');
const Track      = require('./track');
const VECTORS    = require('./constants').VECTORS;

const TRACK_CONFIGS = {
	LONG: [17, 13, 06, 03],
	MEDIUM: [15, 11, 04, 02],
	SHORT: [10, 08, 05, 01],
	TUTORIAL: [15, 15, 08, 04],
	TUTORIAL_EMPTY: [17, 15, 08, 04],
}

class Mission {
	constructor(game) {
		this.game = game;
		this.leftTrack = TRACK_CONFIGS.LONG;
		this.centerTrack = TRACK_CONFIGS.LONG;
		this.rightTrack = TRACK_CONFIGS.LONG;
	}

	spawnRandomThreat() {
		var threatClass = threats[_.sample(_.keys(threats))];
		var vector = _.sample(_.keys(vectors));
		return this.spawnThreat(threatClass, vector);
	}

	spawnRandomThreatAt(vector) {
		var threatClass = threats[_.sample(_.keys(threats))];
		return this.spawnThreat(threatClass, vector);
	}

	spawnThreat(threatClass, vector) {
		var threat = new threatClass(this.game, this.game.tracks[vector]);
		this.game.log.write(`Threat ${threat.name} incoming at ` + vector);
		this.game.threats.push(threat);
		return threat;
	}

	checkWinAt(turn, winAtTurn) {
		if(turn >= winAtTurn && this.game.threats.length === 0) {
			this.game.log.write('Players win the mission');
			this.game.goToState(GAME_STATE.WAITING);
		}
	}

	update(deltaMs) {
	}

	onThreatKilled(threat) {	
	}

	getTracks() {
		var tracks = {};

		tracks[VECTORS.LEFT] = new Track(this.game, VECTORS.LEFT,
			this.leftTrack[0],
			this.leftTrack[1],
			this.leftTrack[2],
			this.leftTrack[3]);

		tracks[VECTORS.CENTER] = new Track(this.game, VECTORS.CENTER,
			this.centerTrack[0],
			this.centerTrack[1],
			this.centerTrack[2],
			this.centerTrack[3]);

		tracks[VECTORS.RIGHT] = new Track(this.game, VECTORS.RIGHT,
			this.rightTrack[0],
			this.rightTrack[1],
			this.rightTrack[2],
			this.rightTrack[3]);

		return tracks;
	}
}

class Tutorial extends Mission {
	constructor(game) {
		super(game);
		this.spawnDummyTimer = new GameTimer(2000, true);
		this.killCount = 0;
		this.maxKillCount = 3;
	}

	update(deltaMs) {
		if(this.spawnDummyTimer.update(deltaMs)) {
			this.spawnDummyTimer.reset();
			this.spawnThreat(threats.Dummy, VECTORS.CENTER);
		}

		const noEnergyLeft = (
			this.game.ship.rooms.BOTTOM_CENTER.cores === 0 &&
			this.game.ship.rooms.BOTTOM_CENTER.power <= 1)

		if(noEnergyLeft) {
			this.game.log.write('Players lose because they ran out of energy');
			this.game.goToState(GAME_STATE.WAITING);
		}
	}

	onThreatKilled(threat) {
		this.killCount += 1;

		if(this.killCount >= this.maxKillCount) {
			this.game.log.write('Players win the mission');
			this.game.goToState(GAME_STATE.WAITING);
		}
	}

	getTracks() {
		this.leftTrack = TRACK_CONFIGS.TUTORIAL;
		this.centerTrack = TRACK_CONFIGS.TUTORIAL;
		this.rightTrack = TRACK_CONFIGS.TUTORIAL;
		return super.getTracks();
	}
}

class Level1 extends Mission {
	update(deltaMs) {
		// if(turn === 2)
		// 	this.spawnThreat(threats.PulseBall, VECTORS.RIGHT);
		// if(turn === 4)
		// 	this.spawnThreat(threats.Destroyer, VECTORS.CENTER);
		// if(turn === 6)
		// 	this.spawnThreat(threats.StealthFighter, VECTORS.LEFT);

		// this.checkWinAt(turn, 6);
	}

	getTracks() {
		this.leftTrack = TRACK_CONFIGS.LONG;
		this.centerTrack = TRACK_CONFIGS.SHORT;
		this.rightTrack = TRACK_CONFIGS.MEDIUM;
		return super.getTracks();
	}
}

class Level2 extends Mission {
	update(deltaMs) {
		// if(turn === 2)
		// 	this.spawnThreat(threats.Meteoroid, VECTORS.LEFT);
		// if(turn === 3)
		// 	this.spawnThreat(threats.Meteoroid, VECTORS.RIGHT);
		// if(turn === 4)
		// 	this.spawnThreat(threats.Meteoroid, VECTORS.CENTER);
		// if(turn === 6)
		// 	this.spawnThreat(threats.StealthFighter, VECTORS.LEFT);
		// if(turn === 7)
		// 	this.spawnThreat(threats.StealthFighter, VECTORS.RIGHT);

		// this.checkWinAt(turn, 7);
	}

	getTracks() {
		this.leftTrack = TRACK_CONFIGS.MEDIUM;
		this.centerTrack = TRACK_CONFIGS.MEDIUM;
		this.rightTrack = TRACK_CONFIGS.SHORT;
		return super.getTracks();
	}
}

class Random extends Mission {
	update(deltaMs) {
		// if(turn === 1)
		// 	this.spawnRandomThreatAt(VECTORS.LEFT);
		// if(turn === 3)
		// 	this.spawnRandomThreatAt(VECTORS.RIGHT);
		// if(turn === 6)
		// 	this.spawnRandomThreatAt(VECTORS.CENTER);
		// if(turn === 7)
		// 	this.spawnRandomThreatAt(VECTORS.CENTER);
		// if(turn === 7)
		// 	this.spawnRandomThreatAt(VECTORS.LEFT);
	}

	getTrackConfigs() {
		return {
			LEFT: _.sample(TRACK_CONFIGS),
			CENTER: _.sample(TRACK_CONFIGS),
			RIGHT: _.sample(TRACK_CONFIGS),
		}
	}
}

module.exports = {
	tutorial: Tutorial,
	random: Random,
	level1: Level1,
	level2: Level2,
}