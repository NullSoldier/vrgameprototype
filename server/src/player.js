class Player {
	constructor(socket) {
		this.socket = socket;
		this.id = socket.id;
		this.name = 'Player'
		this.color = 'red';
		this.room = null;
	}

	move(room) {
		this.room = room;
	}

	serialize() {
		return {
			id   : this.socket.id,
			name : this.name,
			color: this.color,
			room : this.room ? this.room.room : null,
		}
	}
}

module.exports = Player;