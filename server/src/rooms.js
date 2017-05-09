const ElectricGun    = require('./guns').ElectricGun;
const EnergyGun      = require('./guns').EnergyGun;
const ShortRangeWave = require('./guns').ShortRangeWave;

// class RoomComponent {
// 	constructor() {
// 		this.action = null;
// 	}

// 	handle() {
// 	}
// }

// class Gun extends RoomComponent {
// 	constructor() {
// 		this.action = 'gun';
// 		this.fired = false;
// 		this.damage = 0;
// 		this.range = 0; // number of sectors
// 	}

// 	getTargets() {
// 		throw new Error('Not Implemented');
// 	}

// 	getTargetRange(track) {
// 		if(this.range === 1) return track.zPos;
// 		if(this.range === 2) return track.yPos;
// 		if(this.range === 3) return track.xPos;
// 		throw new Error('invalid range on ship', this.range);
// 	}

// 	handle() {
// 		this.fired = true;
// 	}

// 	reset() {
// 		this.fired = false;
// 	}
// }

// class EnergyGun extends Gun {
// 	constructor(track) {
// 		super();
// 		this.track = track;
// 		this.damage = 5;
// 		this.range = 3;
// 	}

// 	getTargets() {
// 		return _.filter([this.getTargetInTrack(this.track)]);
// 	}
// }

// class ShortRangeWave extends Gun {
// 	constructor(game) {
// 		this.game = game;
// 		this.damage = 1;
// 		this.range = 2;
// 	}

// 	getTargets() {
// 		return _.filter([
// 			this.getTargetInTrack(this.game.tracks[VECTORS.LEFT]),
// 			this.getTargetInTrack(this.game.tracks[VECTORS.CENTER]),
// 			this.getTargetInTrack(this.game.tracks[VECTORS.RIGHT]),
// 		]);
// 	}
// }

// class ElectricGun extends Gun {
// 	constructor(track) {
// 		super();
// 		this.track = track;
// 		this.damage = 2;
// 		this.range = 3;
// 	}

// 	getTargets() {
// 		return _.filter([this.getTargetInTrack(this.track)]);
// 	}
// }

class Room {
	constructor(game, ship, room, track) {
		this.game = game;
		this.ship = ship;
		this.room = room;
	}

	tryAction(player, action, data) {
	}
}

class WeaponRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new EnergyGun(track);
	}

	fireGun() {
		this.gun.fire();
		this.ship.firedGuns.push(this.gun);
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.fireGun();
	}
}

class ReactorRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new ShortRangeWave(game);
	}

	fireGun() {
		this.gun.fire();
		this.ship.firedGuns.push(this.gun);
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.fireGun();
	}
}

class BatteryRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new ElectricGun(track);
	}

	fireGun() {
		this.gun.fire();
		this.ship.firedGuns.push(this.gun);
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.fireGun();
	}
}

module.exports = {
	BatteryRoom: BatteryRoom,
	ReactorRoom: ReactorRoom,
	WeaponRoom: WeaponRoom,
}
