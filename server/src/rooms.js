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

	load() {
	}

	nextTurn(turn) {		
	}

	serialize() {
		return null;
	}
}

class WeaponRoom extends Room {
	constructor(game, ship, room, track) {
		super(game, ship, room, track);
		this.gun = new EnergyGun(ship, track);
	}

	load() {
		this.gun.fuelsource = this.getBatteryRoom();
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
			this.gun.trigger();
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
		this.filling = false;
	}

	load() {
		this.gun.fuelsource = this;
	}

	hasEnoughPower(powerNeeded) {
		return this.power >= powerNeeded;
	}

	consumePower(powerNeeded) {
		if(this.power < powerNeeded)
			return false;

		this.power -= powerNeeded;
		return true;
	}

	startFilling() {
		this.filling = true;
	}

	nextTurn(turn) {
		super.nextTurn(turn);

		if(this.filling && this.cores > 0) {
			this.cores -= 1;
			this.power = this.maxPower;
			this.filling = false;
		}
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.gun.trigger();
		if(action.name === 'replenish')
			this.startFilling();
	}

	serialize() {
		return {
			cores: this.cores,
			power: this.power,
			maxPower: this.maxPower,
			filling: this.filling,
			canFill: this.cores > 0,
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
		this.filling = false;
	}

	consumePower(powerNeeded) {
		if(this.power < powerNeeded)
			return false;

		this.power -= powerNeeded;
		return true;
	}

	hasEnoughPower(powerNeeded) {
		return this.power >= powerNeeded;
	}

	getReactor() {
		return this.ship.rooms[ROOMS.BOTTOM_CENTER];
	}

	startFilling() {
		this.filling = true;
	}

	nextTurn(turn) {
		super.nextTurn(turn);

		if(this.filling && this.getReactor().consumePower(this.maxPower)) {
			this.power = this.maxPower;
			this.filling = false;
		}
	}

	tryAction(player, action) {
		if(action.name === 'gun')
			this.gun.trigger();
		if(action.name === 'replenish')
			this.startFilling();
	}

	serialize() {
		return {
			power: this.power,
			maxPower: this.maxPower,
			gun: this.gun.serialize(),
			filling: this.filling,
			canFill: this.getReactor().hasEnoughPower(this.maxPower),
		}
	}
}

module.exports = {
	BatteryRoom: BatteryRoom,
	ReactorRoom: ReactorRoom,
	WeaponRoom: WeaponRoom,
}
