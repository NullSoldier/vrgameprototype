	const _        = require('lodash');
	const express  = require('express');
	const Game     = require('./game');
	const http     = require('http');
	const Player   = require('./player');
	const socketIo = require('socket.io');

const settings = {
	PORT: process.env.PORT || 8000,
	PUBLIC_ROOT: `${__dirname}/../../client/dist`
};


class Server {
	constructor() {
		this.express = express();
		this.http    = http.createServer(this.express);
		this.sockets  = socketIo(this.http);
		this.game    = new Game(this.sockets);

		this.lastTime = null;
		this.express.use(express.static(settings.PUBLIC_ROOT));

		this.express.get('/*', function(req, res) {
			res.sendFile(path.resolve(settings.PUBLIC_ROOT + '/index.html'));
		});
	}

	start() {
		this.game.log.write(`Server starting at port ${settings.PORT}`);
		this.game.log.write(`Serving assets at ${settings.PUBLIC_ROOT}`);

		var self = this;
		this.http.listen(settings.PORT, function() {
			self.game.log.write('Server started...');
			self.isRunning = true;
			self.lastTime = Date.now();
			self.run();

			self.sockets.on('connection', function(socket) {
				self.game.log.write('Connected ' + socket.id);
				socket.on('disconnect', self.socket_disconnect.bind(self, socket));
				socket.on('join', self.socket_join.bind(self, socket));
				socket.on('start', self.bindPlayerAction(self.socket_start, socket));
				socket.on('action', self.bindPlayerAction(self.socket_action, socket));
			})
		});
	}

	stop() {
		this.isRunning = false;
		this.http.close();
	}

	bindPlayerAction(socketFn, socket) {
		return (function(data) {
			var player = this.game.getPlayer(socket.id);
			if(player)
				socketFn.call(this, socket, player, data);
		}).bind(this);
	}

	run() {
		if(!this.isRunning)
			return;

		const time = Date.now();
		this.game.update(time - this.lastTime);
		this.lastTime = time;

		setTimeout(this.run.bind(this));
	}

	socket_disconnect(socket) {
		this.game.log.write('Disconnected ' + socket.id);

		var player = this.game.getPlayer(socket.id);
		if(player)
			this.game.removePlayer(player);
	}

	socket_join(socket) {
		this.game.addPlayer(new Player(socket));
	}

	socket_start(socket, player, data) {
		this.game.start(data.mission);
	}

	socket_action(socket, player, data) {
		if(data.name === 'move')
			this.game.movePlayer(player, data.room);
		else if(data.name === 'gun')
			this.game.doAction(player, data);
		else if(data.name === 'replenish')
			this.game.doAction(player, data);
		else
			this.game.queueAction(player, data);
	}
}

module.exports = Server;