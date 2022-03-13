let inLoopMode = false;
let bpm = 120; 
let beatDuration = 60/bpm*1000;// Milliseconds per beat
// Index of the location of the dot moving horizontally
const horizArray = ['left_4', 'left_3', 'left_2', 'left_1', 'right_1', 'right_2', 'right_3', 'right_4'];
let horizLoopTracker = 0;
let horizLoopTimeout;
const moveHorizDot = () => {
	let nextLight = $(horizArray[horizLoopTracker]);
	nextLight.style.backgroundColor = "var(--loopColor)";
	nextLight.style.boxShadow = "0px 0px 3px 3px var(--loopColor)";
	horizLoopTimeout = setTimeout(() => {
		// TODO: should also only show animation when the audio is currently playing
		if (inLoopMode && nowPlaying) {
			let lastLight = $(horizArray[horizLoopTracker]);
			if (horizLoopTracker !== speedDotIndex) {
				lastLight.style.backgroundColor = null;
			} 
			lastLight.style.boxShadow = null;
			if (horizLoopTracker < 7) {
				horizLoopTracker++;
			} else {
				horizLoopTracker = 0;
			}
		}
		moveHorizDot();
	}, beatDuration)
}

let vertLoopIndex;
let loopDuration = 7;
let loopStart = 0; // Time in song where loop starts (should this be rounded to the nearest beat?)
let inLoop = false;
let vertLoopTimeout;
const vertArray = ['bottom_4', 'bottom_3', 'bottom_2', 'bottom_1', 'top_1', 'top_2', 'top_3', 'top_4'];
const verticalLoop = () => {
	if (loopDuration < 7) {
		let nextLight = $(vertArray[vertLoopIndex]);
		nextLight.style.backgroundColor = "var(--loopColor)";
		nextLight.style.boxShadow = "0px 0px 3px 3px var(--loopColor)";
		vertLoopTimeout = setTimeout(() => {
			let lastLight = $(vertArray[vertLoopIndex]);
			lastLight.style.boxShadow = null;
			if (vertLoopIndex < loopDuration) {
				vertLoopIndex++;
			} else {
				vertLoopIndex = 0;
				tracksReady = [false, false, false, false];
				tracks.forEach((track) => {
					track.pause();
					track.fastSeek(loopStart);
				})
				playAudio();
			}
			verticalLoop();
		}, beatDuration)
	} else {
		vertLoopIndex = 0;
	}
}

$("menuButton").addEventListener("click", () => {
	if (!inLoopMode) {
		allLightsOff();
		inLoopMode = true;
		// Init loop mode
		["top", "bottom"].forEach((dir) => {
			for(let i=1; i<5; i++) {
				$(`${dir}_${i}`).style.backgroundColor = "var(--loopColor)";
			}
		})
		moveHorizDot();
		loopDuration = 7;
		vertLoopIndex = 0;
		verticalLoop();
		$(horizArray[speedDotIndex]).style.backgroundColor = "var(--loopColor)";
	} else {
		showStemLights();
		inLoopMode = false;
		// Clear manually set background colors
		// Could just apply a class and remove it instead
		["top", "bottom", "left", "right"].forEach((dir) => {
			for(let i=1; i<5; i++) {
				$(`${dir}_${i}`).style.backgroundColor = null;
				$(`${dir}_${i}`).style.boxShadow = null;
			}
		})
		clearTimeout(horizLoopTimeout);
		clearTimeout(vertLoopTimeout);
	}
})

let speedDotIndex = 5;
const setSpeed = (sliderName, lightIndex) => {
	lightIndex = parseInt(lightIndex);
	if (sliderName == "right") {
		let pbRate = 1;
		if (lightIndex == 1) pbRate = 0.5;
		else if (lightIndex == 2) pbRate = 1;
		else if (lightIndex == 3) pbRate = 1.5;
		else if (lightIndex == 4) pbRate = 2;
		beatDuration = 60/bpm*1000/pbRate;
		tracks.forEach((track) => {
			track.playbackRate = pbRate; 
		})
		$(horizArray[speedDotIndex]).style.backgroundColor = null;
		speedDotIndex = 3 + lightIndex;
		$(horizArray[speedDotIndex]).style.backgroundColor = "var(--loopColor)";
	}
}

const loopHandleLightTap = (sliderName, lightIndex) => {
	let nextLight;
	if (loopDuration === 7) {
		loopStart = tracks[0].currentTime;
	}
	if (["top","bottom"].includes(sliderName)) {
		let maxFound = false;
		let lightId = `${sliderName}_${lightIndex}`;
		for(let i=0; i<vertArray.length; i++) {
			if (maxFound) {
				$(vertArray[i]).style.backgroundColor = null;
				$(vertArray[i]).style.boxShadow = null;
			} else if (vertArray[i] === lightId) {
				maxFound = true;
				$(vertArray[i]).style.backgroundColor = "var(--loopColor)";
				loopDuration = i;
				if (vertLoopIndex > i) {
					nextLight = $(vertArray[vertLoopIndex]);
					nextLight.style.backgroundColor = null;
					nextLight.style.boxShadow = null;
					vertLoopIndex = 0;
					loopStart = tracks[0].currentTime;
				}
			} else {
				$(vertArray[i]).style.backgroundColor = "var(--loopColor)";
			}
		}
		if (loopDuration == 7) {
			nextLight = $(vertArray[vertLoopIndex]);
			nextLight.style.backgroundColor = "var(--loopColor)";
			nextLight.style.boxShadow = null;
		}
		clearTimeout(vertLoopTimeout);
		verticalLoop();
	} else if (["left", "right"].includes(sliderName)) {
		setSpeed(sliderName, lightIndex);
	}
}

