let inLoopMode = false;
let bpm = playlist[audio.songIndex].bpm || 120;
let beatDuration = 60/bpm*1000;// Milliseconds per beat
// Index of the location of the dot moving horizontally
const horizArray = ['left_4', 'left_3', 'left_2', 'left_1', 'right_1', 'right_2', 'right_3', 'right_4'];
let horizLoopTracker = 0;
let loopTick;
let vertLoopIndex;
let loopDuration = 8;
//let loopStart = 0; // Time in song where loop starts (should this be rounded to the nearest beat?), var not used, use source.loopStart
let inLoop = false;
const vertArray = ['bottom_4', 'bottom_3', 'bottom_2', 'bottom_1', 'top_1', 'top_2', 'top_3', 'top_4'];
let nextLoopDuration = 0;

const handleTick = () => {
	let nextLight = $(horizArray[horizLoopTracker]);
	nextLight.classList.add("loopLight", "lightBright");
	loopTick = setTimeout(() => {
		// Set loop
		if (nextLoopDuration) { //Does in loopmode and nowplaying need to be checked
			if (nextLoopDuration == 8) {
				sources.forEach((source) => {
					source.loop = false;
				});
			} else if (loopDuration == 8) {
				// TODO: add optional parameter to set difference from current time
				sources.forEach((source) => {
					source.loopStart = audioCtx.currentTime - trackStartTime;
					source.loopEnd = source.loopStart + beatDuration/1000 * (nextLoopDuration);
					source.loop = true;
				});
				vertLoopIndex = 0;
			} else {
				sources.forEach((source) => {
					source.loopEnd = source.loopStart + beatDuration/1000 * (nextLoopDuration);
					source.loop = true;
				});
			}
			loopDuration = nextLoopDuration;
			nextLoopDuration = 0;
		}
		// Horizontal
		if (inLoopMode && audio.nowPlaying) {
			let lastLight = $(horizArray[horizLoopTracker]);
			if (horizLoopTracker !== speedDotIndex) {
				lastLight.classList.remove("loopLight");
			}
			lastLight.classList.remove("lightBright");
			if (horizLoopTracker < 7) {
				horizLoopTracker++;
			} else {
				horizLoopTracker = 0;
			}
		}
		// Vertical
		if (loopDuration < 8) {
			let nextLight = $(vertArray[vertLoopIndex]);
			let prevVertIndex = vertLoopIndex == 0 ? loopDuration - 1 : vertLoopIndex - 1;
			$(vertArray[prevVertIndex]).classList.remove("lightBright");
			if (vertLoopIndex < loopDuration - 1) {
				vertLoopIndex++;
			} else {
				vertLoopIndex = 0;
				trackStartTime += loopDuration * beatDuration/1000;
			}
			nextLight.classList.add("loopLight", "lightBright");
		}
		// Send next tick
		handleTick();
	}, beatDuration)
}

const enterLoopMode = () => {
	lights.allLightsOff();
	inLoopMode = true;
	bpm = playlist[audio.songIndex].bpm || 120;
	beatDuration = 60/bpm*1000;// Milliseconds per beat
	// Init loop mode
	["top", "bottom"].forEach((dir) => {
		for(let i=1; i<5; i++) {
			$(`${dir}_${i}`).classList.add("loopLight");
		}
	})
	handleTick();
	loopDuration = 8;
	vertLoopIndex = 0;
	$(horizArray[speedDotIndex]).classList.add("loopLight");
}
const exitLoopMode = () => {
	showStemLights();
	inLoopMode = false;
	// Clear manually set background colors
	// Could just apply a class and remove it instead
	["top", "bottom", "left", "right"].forEach((dir) => {
		for(let i=1; i<5; i++) {
			$(`${dir}_${i}`).classList.remove("loopLight", "lightBright");
		}
	})
	clearTimeout(loopTick);
}
$("menuButton").addEventListener("click", () => {
	if (!inLoopMode) {
		enterLoopMode();
	} else {
		exitLoopMode();
	}
})

let speedDotIndex = 5;
const setSpeed = (sliderName, lightIndex) => {
	lightIndex = parseInt(lightIndex);
	if (sliderName == "right") {
		let pbRate = lightIndex * 0.5;
		beatDuration = 60/bpm*1000/pbRate;
		audio.wads.forEach((wad) => {wad.setRate(pbRate)});
		if (speedDotIndex !== horizLoopTracker) {
			$(horizArray[speedDotIndex]).classList.remove("loopLight");
		}
		speedDotIndex = 3 + lightIndex;
		$(horizArray[speedDotIndex]).classList.add("loopLight");
	}
}

const loopHandleLightTap = (sliderName, lightIndex) => {
	let nextLight;
	if (["top","bottom"].includes(sliderName)) {
		let lightId = `${sliderName}_${lightIndex}`;
		let lightPosition = vertArray.indexOf(lightId);
		nextLoopDuration = lightPosition+1;
		for (let i=0; i<=lightPosition; i++) $(vertArray[i]).classList.add("loopLight");
		for (let i=lightPosition+1; i<8; i++) $(vertArray[i]).classList.remove("loopLight", "lightBright");
		//let brightId = (vertLoopIndex==0) ? 7 : vertLoopIndex-1;
		//if (nextLoopDuration == 8) $(vertArray[brightId]).classList.remove("lightBright");
		if (vertLoopIndex==0 || lightPosition == 7 || lightPosition < vertLoopIndex) {
			vertArray.forEach((vertLightId) => {
				$(vertLightId).classList.remove("lightBright");
			})
		}
		if (vertLoopIndex > lightPosition) vertLoopIndex = 0;
	} else if (["left", "right"].includes(sliderName)) {
		setSpeed(sliderName, lightIndex);
	}
}
