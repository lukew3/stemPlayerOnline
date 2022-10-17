class Loop {
	constructor() {
		this.horizArray = ['left_4', 'left_3', 'left_2', 'left_1', 'right_1', 'right_2', 'right_3', 'right_4'];
		this.vertArray = ['bottom_4', 'bottom_3', 'bottom_2', 'bottom_1', 'top_1', 'top_2', 'top_3', 'top_4'];

		this.loopMode = false;
		
		this.vertLoopIndex = 0;
		this.horizLoopIndex = 0;

		this.loopTickTimeout; // Timeout
		this.loopDuration = 8;
		this.nextLoopDuration = 0;
		this.looping = false;
		this.offset = 0;
		this.speedDotIndex = 5;
	}

	handleTick = () => {
		let nextHorizLight = $(this.horizArray[this.horizLoopIndex]);
		nextHorizLight.classList.add("lightBright");
		nextHorizLight.classList.remove("lightOff");
		this.loopTickTimeout = setTimeout(() => {
			// Set loop
			if (this.nextLoopDuration) { //Does in loopmode and nowplaying need to be checked
				if (this.loopDuration == 8) { // If loopDuration was 8, but now is not, set loop
					if (!audio.inReverse) {
						this.offset = Wad.audioContext.currentTime - audio.wads[0].lastPlayedTime;
					} else {
						this.offset = Wad.audioContext.currentTime - audio.reversedWads[0].lastPlayedTime;
					}
					this.vertLoopIndex = 0;
				}
				this.loopDuration = this.nextLoopDuration;
				this.nextLoopDuration = 0;
			}
			// Horizontal
			if (this.inLoopMode && audio.nowPlaying) {
				let lastLight = $(this.horizArray[this.horizLoopIndex]);
				// Turn off horizLoop light if not speedDot
				if (this.horizLoopIndex != this.speedDotIndex) lastLight.classList.add("lightOff");
				lastLight.classList.remove("lightBright");
				if (!audio.inReverse) {
					if (this.horizLoopIndex < 7) {
						this.horizLoopIndex++;
					} else {
						this.horizLoopIndex = 0;
					}
				} else {
					if (this.horizLoopIndex > 0) {
						this.horizLoopIndex--;
					} else {
						this.horizLoopIndex = 7;
					}
				}
			}
			// Vertical
			if (this.loopDuration < 8) {
				if (this.vertLoopIndex == 0) {
					Wad.stopAll();
					if (!audio.inReverse) {
						audio.wads.forEach((wad) => {
							wad.setRate(audio.playbackRate);
							wad.play({offset: this.offset});
						});
					} else {
						audio.reversedWads.forEach((reversedWad) => {
							reversedWad.setRate(audio.playbackRate);
							reversedWad.play({offset: this.offset});
						});
					}
				}
				let nextVertLight = $(this.vertArray[this.vertLoopIndex]);
				let prevVertIndex = this.vertLoopIndex == 0 ? this.loopDuration - 1 : this.vertLoopIndex - 1;
				$(this.vertArray[prevVertIndex]).classList.remove("lightBright");
				nextVertLight.classList.remove("lightOff");
				nextVertLight.classList.add("lightBright");
				if (this.vertLoopIndex < this.loopDuration - 1) {
					this.vertLoopIndex++;
				} else {
					this.vertLoopIndex = 0;
				}
			}
			// Send next tick
			this.handleTick();
		}, audio.beatDuration)
	}

	enterLoopMode = () => {
		this.inLoopMode = true;
		// Init loop mode
		lights.initLoopLights();
		this.handleTick();
		this.loopDuration = 8;
		this.vertLoopIndex = 0;
		$(this.horizArray[this.speedDotIndex]).classList.remove("lightOff");
	}

	exitLoopMode = () => {
		lights.removeLoopLights();
		showStemLights();
		this.inLoopMode = false;
		clearTimeout(this.loopTickTimeout);
	}

	setSpeed = (sliderName, lightIndex) => {
		lightIndex = parseInt(lightIndex);
		audio.playbackRate = lightIndex * 0.5;
		audio.beatDuration = 60/audio.bpm*1000/audio.playbackRate;
		if (this.speedDotIndex !== this.horizLoopIndex) {
			$(this.horizArray[this.speedDotIndex]).classList.add("lightOff");
		}
		if (sliderName == "right") {
			this.speedDotIndex = 3 + lightIndex;
			audio.setPlaybackDirection(false);
			audio.wads.forEach((wad) => {wad.setRate(audio.playbackRate)});
		} else if (sliderName == "left") {
			this.speedDotIndex = 4 - lightIndex;
			audio.setPlaybackDirection(true);
			audio.reversedWads.forEach((reversedWad) => {reversedWad.setRate(audio.playbackRate)});
		}
		$(this.horizArray[this.speedDotIndex]).classList.remove("lightOff");
	}

	loopHandleLightTap = (sliderName, lightIndex) => {
		if (["top","bottom"].includes(sliderName)) {
			let lightId = `${sliderName}_${lightIndex}`;
			let lightPosition = this.vertArray.indexOf(lightId);
			this.nextLoopDuration = lightPosition+1;
			// Turn on all lights below and at clicked light
			for (let i=0; i<=lightPosition; i++) {
				$(this.vertArray[i]).classList.remove("lightOff");
			}
			// Turn off all lights above clicked light and remove their brightness
			for (let i=lightPosition+1; i<8; i++) {
				$(this.vertArray[i]).classList.remove("lightBright");
				$(this.vertArray[i]).classList.add("lightOff");
			}
			//let brightId = (vertLoopIndex==0) ? 7 : vertLoopIndex-1;
			//if (nextLoopDuration == 8) $(vertArray[brightId]).classList.remove("lightBright");
			if (this.vertLoopIndex === 0 || lightPosition === 7 || lightPosition < this.vertLoopIndex) {
				this.vertArray.forEach((vertLightId) => {
					$(vertLightId).classList.remove("lightBright");
				})
			}
			if (this.vertLoopIndex > lightPosition) this.vertLoopIndex = 0;
		} else if (["left", "right"].includes(sliderName)) {
			this.setSpeed(sliderName, lightIndex);
		}
	}
}

let loop = new Loop();
