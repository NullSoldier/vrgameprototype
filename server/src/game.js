const _          = require('lodash');
const GAME_STATE = require('./constants').GAME_STATE;
const GameTimer  = require('./gametimer');
const Log        = require('./log');
const ROOMS      = require('./constants').ROOMS;
const Missions   = require('./missions');
const Ship       = require('./ship');
const Track      = require('./track');
const VECTORS    = require('./constants').VECTORS;

const TURN_LENGTH = 4000;
const STATE_DELAY = 100;
const WAIT_TO_END_DELAY = 10000;

class Game {
	constructor(sockets) {
		this.turnTimer = new GameTimer(TURN_LENGTH);
		this.stateTimer = new GameTimer(STATE_DELAY);
		this.failTimer = new GameTimer(WAIT_TO_END_DELAY);
		this.state = null;
		this.nextState = null;
		this.sockets = sockets;
		this.players = [];
		this.log = new Log();
		this.startRoom = ROOMS.TOP_CENTER;

		this.goToState(GAME_STATE.WAITING);
	}

	start(missionName) {
		this.log.write('Starting mission ' + missionName);
		this.mission = new Missions[missionName](this);
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

	WAITING_enter() {
		this.log.write('Waiting to start...');
		this.sendFullState();
	}

	WAITING_update(deltaMs) {
	}

	PLAYING_enter() {
		this.log.write('Starting the game...');

		this.turn = 0;
		this.lastId = 0;
		this.threats = [];
		this.playerActions = [];
		this.tracks = this.mission.getTracks();

		// dependency on tracks
		this.ship = new Ship(this);

		for(var player of this.players)
			player.move(this.ship.rooms[this.startRoom]);
	}

	PLAYING_update(deltaMs) {
		if(this.turnTimer.update(deltaMs)) {
			this.turnTimer.reset();
			this.nextTurn();
			this.sendFullState();
		}

		if(this.stateTimer.update(deltaMs)) {
			this.stateTimer.reset();
			this.sendFullState();
		}

		this.threats.forEach(t => t.update(deltaMs));
	}

	FAIL_enter() {
		this.log.write('Players lose the game');
		this.sendFullState();
	}

	FAIL_update(deltaMs) {
		if(this.failTimer.update(deltaMs)) {
			this.failTimer.reset();
			this.goToState(GAME_STATE.WAITING);
		}
	}

	nextTurn() {
		this.turn++;

		while(this.playerActions.length) {
			var action = this.playerActions.pop();
			action();
		}

		this.ship.nextTurn(this.turn);
		this.resolveGuns();
		this.threats.forEach(t => t.nextTurn(this.turn));

		if(this.isShipDead()) {
			this.goToState(GAME_STATE.FAIL);
			return;
		}

		_.filter(this.threats, t => t.distance <= 0).forEach(t => this.surviveThreat(t));

		this.mission.nextTurn(this.turn);
	}

	simulatePlayerActions() {
		// if(this.turn === 3)
		// 	this.ship.rooms[ROOMS.BOTTOM_CENTER].fireGun();
		// if(this.turn === 4)
		// 	this.ship.rooms[ROOMS.BOTTOM_CENTER].fireGun();
		// if(this.turn === 7)
		// 	this.ship.rooms[ROOMS.TOP_LEFT].fireGun();
		// if(this.turn === 7)
		// 	this.ship.rooms[ROOMS.BOTTOM_CENTER].fireGun();
		// if(this.turn === 8)
		// 	this.ship.rooms[ROOMS.TOP_RIGHT].fireGun();
		// if(this.turn === 10)
		// 	this.ship.rooms[ROOMS.TOP_RIGHT].fireGun();
	}

	resolveGuns() {
		if(this.ship.triggeredGuns.length < 0)
			return;

		var totals = {};

		while(this.ship.triggeredGuns.length) {
			var gun = this.ship.triggeredGuns.pop();

			if(gun.resolve()) {
				for(var target of gun.getTargets()) {
					if(!totals[target.id])
						totals[target.id] = {threat: target, value: 0};
					totals[target.id].value += gun.damage;
				}
			}

			gun.reset();
		}

		for(var threatId in totals) {
			var threat = totals[threatId].threat;
			var amount = totals[threatId].value;

			if(!threat.ignoreDamage) {
				amount -= threat.shields;
				threat.health -= amount;
				this.log.write(`${amount} damage done to ${threat.name}`)
			}

			threat.onHit(amount);

			if(threat.health <= 0)
				this.killThreat(threat);
		}
	}

	killThreat(threat) {
		this.log.write(`${threat.name} has been killed`);
		this.mission.onThreatKilled(threat);
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

	render(clear) {
		var buffer = [];

		if(this.state === GAME_STATE.PLAYING) {
			for(var threat of this.threats) {
				buffer.push(threat.renderStats() + '\n' + threat.renderAttacks() + '\n');
			}

			buffer.push(`Tick ${this.turn}`);
			buffer.push(this.tracks[VECTORS.LEFT].render());
			buffer.push(this.tracks[VECTORS.CENTER].render());
			buffer.push(this.tracks[VECTORS.RIGHT].render());
			// buffer.push('');
			// buffer.push(this.ship.render());
			buffer.push('');
		}

		buffer.push(this.log.render());

		if(clear)
			console.log('\x1B[2J');
		console.log(buffer.join('\n'));
	}

	movePlayer(player, roomName) {
		this.log.write(`Moving ${player.id} to ${roomName}`)
		var room = this.ship.rooms[roomName];
		player.room = room;
	}

	onShipHit(threat, damage) {
		this.log.write(`Ship hit for ${damage} by ${threat.name}`)
		this.sockets.emit('shiphit', {});
	}

	doAction(player, action) {
		this.log.write(`Player ${player.id} doing ${action.name} in ${action.room}`)
		this.ship.rooms[action.room].tryAction(player, action);
	}

	queueAction(player, action) {
		this.playerActions.push(this.doAction.bind(this, player, action));
	}

	getPlayer(playerId) {
		return _.find(this.players, {id: playerId});
	}

	addPlayer(player) {
		if(this.state !== GAME_STATE.WAITING) {
			player.socket.emit('alreadyinprogress');
			this.log.write('Rejected: already_in_progress');
			player.socket.disconnect();
			return;
		}

		this.log.write(`Player ${player.id} joined`)
		this.players.push(player);
		player.socket.emit('joined', player.serialize());
		this.sockets.emit('playerjoined', player.serialize());
		this.sendFullState();
	}

	removePlayer(player) {
		_.remove(this.players, (p) => p.id === player.id);
		this.log.write(`Player ${player.id} left`);
		this.sockets.emit('playerleft', player.serialize());
		this.sendFullState();

		if(this.state !== GAME_STATE.WAITING && this.players.length === 0)
			this.goToState(GAME_STATE.WAITING);
	}

	sendFullState() {
		if(this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.FAIL)
			this.sockets.emit('gamestate', {
				turnLength: TURN_LENGTH,
				turn      : this.turn,
				state     : this.state,
				ship      : this.ship.serialize(),
				players   : _.map(this.players, p => p.serialize()),
				threats   : _.map(this.threats, t => t.serialize()),
				tracks    : _.map(_.values(this.tracks), t => t.serialize()),
			});
		else if (this.state === 'WAITING')
			this.sockets.emit('gamestate', {
				state  : this.state,
				players: _.map(this.players, p => p.serialize())
			});
		else
			throw new Error('No serializer for state: ' + this.state);
	}
}

module.exports = Game;