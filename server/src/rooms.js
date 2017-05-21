const ElectricGun    = require('./guns').ElectricGun;
const EnergyGun      = require('./guns').EnergyGun;
const ROOMS          = require('./constants').ROOMS;
const ShortRangeWave = require('./guns').ShortRangeWave;

class Room {
	constructor(game, ship, room, track) {
		this.game = game;
		this.ship = ship;
		this.room = room;
	}

	tryAction(player, action, data) {
	}

	serialize() {
		return {};
	}
}

class WeaponRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new EnergyGun(ship, track);
	}

	getBatteryRoom() {
		if(this.room === ROOMS.TOP_LEFT)
			return this.ship.rooms[ROOMS.BOTTOM_LEFT];
		if(this.room === ROOMS.TOP_RIGHT)
			return this.ship.rooms[ROOMS.BOTTOM_RIGHT];
		if(this.room === ROOMS.TOP_CENTER)
			return this.ship.rooms[ROOMS.BOTTOM_CENTER];
		throw new Error('Weapon room not attached to battery room');
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.gun.trigger(this.getBatteryRoom());
	}

	serialize() {
		return {
			gun: this.gun.serialize(),
		}
	}
}

class ReactorRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new ShortRangeWave(ship, game);
		this.cores = 3;
		this.power = 4;
		this.maxPower = 6;
	}

	consumePower(powerNeeded) {
		if(this.power < powerNeeded)
			return false;

		this.power -= powerNeeded;
		return true;
	}

	replenishPower() {
		if(this.cores <= 0)
			return;
		this.cores -= 1;
		this.power = this.maxPower;
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.gun.trigger(this);
		if(action.name === 'replenish')
			this.replenishPower();
	}

	serialize() {
		return {
			cores: this.cores,
			power: this.power,
			maxPower: this.maxPower,
			gun: this.gun.serialize(),
		}
	}
}

class BatteryRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new ElectricGun(ship, track);
		this.power = 2;
		this.maxPower = 3;
	}

	consumePower(powerNeeded) {
		if(this.power < powerNeeded)
			return false;

		this.power -= powerNeeded;
		return true;
	}

	getReactor() {
		return this.ship.rooms[ROOMS.BOTTOM_CENTER];
	}

	replenishPower() {
		if(this.getReactor().consumePower(this.maxPower))
			this.power = this.maxPower;
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.gun.trigger();
		if(action.name === 'replenish')
			this.replenishPower();
	}

	serialize() {
		return {
			power: this.power,
			maxPower: this.maxPower,
			gun: this.gun.serialize(),
		}
	}
}

module.exports = {
	BatteryRoom: BatteryRoom,
	ReactorRoom: ReactorRoom,
	WeaponRoom: WeaponRoom,
}
