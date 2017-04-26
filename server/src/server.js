const express  = require('express');
const http     = require('http');
const socketIo = require('socket.io');


const settings = {
	PORT: 3000,
	PUBLIC_ROOT: `${__dirname}/../client/dist`
};


var SESSION_STATE = {
	LOBBY: 'LOBBY',
	RUNNING: 'RUNNING',
};

var THREAT_VECTORS = {
	CENTER: 'CENTER'
	LEFT: 'LEFT',
	RIGHT: 'RIGHT',
};

var ROOMS = {
	TOP_WHITE   : 'WHITE',
	TOP_RED     : 'TOP_RED',
	TOP_BLUE    : 'TOP_BLUE',
	BOTTOM_WHITE: 'WHITE',
	BOTTOM_RED  : 'BOTTOM_RED',
	BOTTOM_BLUE : 'BOTTOM_BLUE',
};

class Player() {
	constructor() {
		this.name = 'Player'
		this.color = 'red';
	}
}

class Threat() {
	constructor() {
		this.speed = 0;
		this.defense = 0;
		this.health = 0;
		this.attacks = []
		this.vector = THREAT_VECTORS.CENTER;
	}
}

class Ship() {
	constructor() {
		this.health = {
			left: 5,
			right: 5,
			center: 5,
		}
	}

}
class Gun() {

}

class Session() {

}

class Server {
	constructor() {
		this.express = express();
		this.http    = http.createServer(this.express);
		this.socket  = socketIo(this.http).of('socket');

		this.express.use(express.static(settings.PUBLIC_ROOT));
	}

	start() {
		console.log('Server starting at port %d', settings.PORT);

		this.http.listen(settings.PORT, function() {
			console.log(`Server started...`);
		});
	}

	stop() {
		this.socket.emit('tweet', 'goodbye world');
		this.http.close();
	}
}

module.exports = Server;