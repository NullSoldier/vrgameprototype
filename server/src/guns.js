const _         = require('lodash');
const VECTORS   = require('./constants').VECTORS;
const GameTimer = require('./gametimer');

class Gun {

	constructor(ship) {
		this.ship = ship;
		this.triggered = false;
		this.triggerTimer = new GameTimer(140);
		this.damage = 0;
		this.range = 0; // number of sectors
	}

	getTargets() {
		throw new Error('not implemented');
	}

	getTargetRange(track) {
		if(this.range === 1) return track.zPos;
		if(this.range === 2) return track.yPos;
		if(this.range === 3) return track.xPos;
		throw new Error('invalid range on ship', this.range);
	}

	getTargetInTrack(track) {
		if(!track)
			throw 'Track not provided';

		var range = this.getTargetRange(track);
		var threats = track.getThreatsWithin(range);
		return _.first(threats);
	}

	trigger() {
		if(this.triggered)
			return;
		this.triggered = true;
	}

	resolve() {
		return true;
	}

	update(deltaMs) {
		if(this.triggered && this.triggerTimer.update(deltaMs))
			this.ship.triggeredGuns.push(this);
	}

	reset() {
		this.triggered = false;
		this.triggerTimer.reset();
	}

	canFire() {
		return true;
	}

	serialize() {
		return {
			canFire: this.canFire(),
			fired: this.triggered,
			damage: this.damage,
			range: this.range,
		}
	}
}

class EnergyGun extends Gun {
	constructor(ship, track) {
		super(ship);
		this.track = track;
		this.damage = 4;
		this.range = 3;
		this.fuelsource = null;
	}

	resolve() {
		return this.fuelsource.consumePower(1);
	}

	canFire() {
		return this.fuelsource.hasEnoughPower(1);
	}

	getTargets() {
		return _.filter([this.getTargetInTrack(this.track)]);
	}
}

class ShortRangeWave extends Gun {
	constructor(ship, game) {
		super(ship);
		this.game = game;
		this.damage = 1;
		this.range = 2;
		this.fuelsource = null;
	}

	resolve() {
		return this.fuelsource.consumePower(1);
	}

	canFire() {
		return this.fuelsource.hasEnoughPower(1);
	}

	getTargets() {
		return _.filter([
			this.getTargetInTrack(this.game.tracks[VECTORS.LEFT]),
			this.getTargetInTrack(this.game.tracks[VECTORS.CENTER]),
			this.getTargetInTrack(this.game.tracks[VECTORS.RIGHT]),
		]);
	}
}

class ElectricGun extends Gun {
	constructor(ship, track) {
		super(ship);
		this.track = track;
		this.damage = 2;
		this.range = 3;
	}

	getTargets() {
		return _.filter([this.getTargetInTrack(this.track)]);
	}
}

module.exports = {
	EnergyGun     : EnergyGun,
	ShortRangeWave: ShortRangeWave,
	ElectricGun   : ElectricGun,
};