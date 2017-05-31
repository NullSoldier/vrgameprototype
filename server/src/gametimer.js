class GameTimer {
	 constructor(waitForTime, startTriggered) {
	 	this.time = 0;
	 	this.waitForTime = waitForTime;

	 	if(startTriggered)
	 		this.time = waitForTime
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