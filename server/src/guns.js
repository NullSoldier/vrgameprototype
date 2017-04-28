const _       = require('lodash');
const VECTORS = require('./constants').VECTORS;

class Gun {

	constructor() {
		this.fired = false;
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

		for(var i=0; i <= this.getTargetRange(track); i++) {
			var target = track.getThreatAt(i);
			if(target)
				return target;
		}
		return null;
	}

	fire() {
		this.fired = true;
	}

	reset() {
		this.fired = false;
	}
}

class EnergyGun extends Gun {
	constructor(track) {
		super();
		this.track = track;
		this.damage = 5;
		this.range = 3;
	}

	getTargets() {
		return _.filter([this.getTargetInTrack(this.track)]);
	}
}

class ShortRangeWave extends Gun {
	constructor(game) {
		super();
		this.game = game;
		this.damage = 2;
		this.range = 2;
	}

	getTargets() {
		return _.filter([
			this.getTargetInTrack(this.game.tracks[VECTORS.LEFT]),
			this.getTargetInTrack(this.game.tracks[VECTORS.CENTER]),
			this.getTargetInTrack(this.game.tracks[VECTORS.RIGHT]),
		]);
	}
}

module.exports = {
	EnergyGun     : EnergyGun,
	ShortRangeWave: ShortRangeWave,
};