const express  = require('express');
const Game     = require('./game');
const http     = require('http');
const socketIo = require('socket.io');

const settings = {
	PORT: 3002,
	PUBLIC_ROOT: `${__dirname}/../client/dist`
};


class Server {
	constructor() {
		this.express = express();
		this.http    = http.createServer(this.express);
		this.socket  = socketIo(this.http).of('socket');
		this.game    = new Game(this.socket);

		this.lastTime = null;
		this.express.use(express.static(settings.PUBLIC_ROOT));
	}

	start() {
		console.log('Server starting at port %d', settings.PORT);

		var self = this;
		this.http.listen(settings.PORT, function() {
			console.log(`Server started...`);
			self.isRunning = true;
			self.lastTime = Date.now();
			self.game.start();
			self.run();
		});
	}

	stop() {
		this.socket.emit('tweet', 'goodbye world');
		this.isRunning = false;
		this.http.close();
	}

	run() {
		if(!this.isRunning)
			return;

		var time = Date.now();
		this.game.update(time - this.lastTime);
		this.lastTime = time;
		
		setTimeout(this.run.bind(this));
	}
}

module.exports = Server;