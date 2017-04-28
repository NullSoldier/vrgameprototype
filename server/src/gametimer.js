class GameTimer {
	 constructor(waitForTime) {
	 	this.time = 0;
	 	this.waitForTime = waitForTime;
	}

	isElapsed() {
		return this.time >= this.waitForTime;
	}

	update(deltaMs) {
		this.time += deltaMs;
		return this.isElapsed();
	}

	reset() {
		this.time = 0;
	}
}

module.exports = GameTimer;