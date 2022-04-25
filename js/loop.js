let inLoopMode = false;
let bpm = playlist[songIndex].bpm || 120;
let beatDuration = 60/bpm*1000;// Milliseconds per beat
// Index of the location of the dot moving horizontally
const horizArray = ['left_4', 'left_3', 'left_2', 'left_1', 'right_1', 'right_2', 'right_3', 'right_4'];
let horizLoopTracker = 0;
let loopTick;
let vertLoopIndex;
let loopDuration = 7;
//let loopStart = 0; // Time in song where loop starts (should this be rounded to the nearest beat?), var not used, use source.loopStart
let inLoop = false;
const vertArray = ['bottom_4', 'bottom_3', 'bottom_2', 'bottom_1', 'top_1', 'top_2', 'top_3', 'top_4'];

const handleTick = () => {
	let nextLight = $(horizArray[horizLoopTracker]);
	nextLight.classList.add("loopLight", "lightBright");
	loopTick = setTimeout(() => {
		// Horizontal
		if (inLoopMode && nowPlaying) {
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
		if (loopDuration < 7) {
			let nextLight = $(vertArray[vertLoopIndex]);
			let prevVertIndex = vertLoopIndex == 0 ? loopDuration : vertLoopIndex - 1;
			$(vertArray[prevVertIndex]).classList.remove("lightBright");
			secondsElapsedFromStart += beatDuration/1000;
			if (vertLoopIndex < loopDuration) {
				vertLoopIndex++;
			} else {
				vertLoopIndex = 0;
			}
			nextLight.classList.add("loopLight", "lightBright");
		}
		// Send next tick
		handleTick();
	}, beatDuration)
}

const enterLoopMode = () => {
	allLightsOff();
	inLoopMode = true;
	bpm = playlist[songIndex].bpm || 120;
	beatDuration = 60/bpm*1000;// Milliseconds per beat
	// Init loop mode
	["top", "bottom"].forEach((dir) => {
		for(let i=1; i<5; i++) {
			$(`${dir}_${i}`).classList.add("loopLight");
		}
	})
	handleTick();
	loopDuration = 7;
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
		let pbRate = 1;
		if (lightIndex == 1) pbRate = 0.5;
		else if (lightIndex == 2) pbRate = 1;
		else if (lightIndex == 3) pbRate = 1.5;
		else if (lightIndex == 4) pbRate = 2;
		beatDuration = 60/bpm*1000/pbRate;
		sources.forEach((source) => {
			source.playbackRate.value = pbRate;
		})
		$(horizArray[speedDotIndex]).classList.remove("loopLight");
		speedDotIndex = 3 + lightIndex;
		$(horizArray[speedDotIndex]).classList.add("loopLight");
	}
}

const setLoopStart = (lightNum) => {
	// TODO: add optional parameter to set difference from current time
	sources.forEach((source) => {
		source.loopStart = audioCtx.currentTime - secondsElapsedFromStart;
		source.loopEnd = source.loopStart + beatDuration/1000 * (lightNum + 1);
		source.loop = true;
	})
}

const loopHandleLightTap = (sliderName, lightIndex) => {
	let nextLight;
	if (["top","bottom"].includes(sliderName)) {
		let lightId = `${sliderName}_${lightIndex}`;
		let lightPosition = vertArray.indexOf(lightId);
		if (loopDuration === 7) {
			// enter loop if loopDuration is initially 7
			setLoopStart(lightPosition);
		}
		let maxFound = false;
		for(let i=0; i<vertArray.length; i++) {
			if (maxFound) {
				$(vertArray[i]).classList.remove("loopLight", "lightBright");
			} else if (vertArray[i] === lightId) {
				maxFound = true;
				$(vertArray[i]).classList.add("loopLight");
				if (vertLoopIndex > i) {
					nextLight = $(vertArray[vertLoopIndex]);
					nextLight.classList.remove("loopLight", "lightBright");
					vertLoopIndex = 0;
					setLoopStart(lightPosition);
				}
			} else {
				$(vertArray[i]).classList.add("loopLight");
			}
		}
		loopDuration = lightPosition;
		if (loopDuration == 7) {
			sources.forEach((source) => {source.loop = false});
			vertArray.forEach((light) => {
				// Not the most efficient way of removing the brightened light
				$(light).classList.remove("lightBright");
			})
			vertLoopIndex = 0;
		}
	} else if (["left", "right"].includes(sliderName)) {
		setSpeed(sliderName, lightIndex);
	}
}
