let inLoopMode = false;
let beatDuration = 500; // Milliseconds per beat
// Index of the location of the dot moving horizontally
const horizArray = ['left_4', 'left_3', 'left_2', 'left_1', 'right_1', 'right_2', 'right_3', 'right_4'];
let horizLoopTracker = 0;
let horizLoopTimeout;
const moveHorizDot = () => {
	let nextLight = $(horizArray[horizLoopTracker]);
	setLightBrightness(nextLight, 2);
	nextLight.style.backgroundColor = "var(--loopColor)";
	nextLight.style.boxShadow = "0px 0px 3px 3px var(--loopColor)";
	horizLoopTimeout = setTimeout(() => {
		// TODO: should also only show animation when the audio is currently playing
		if (inLoopMode) {
			let lastLight = $(horizArray[horizLoopTracker]);
			lastLight.style.boxShadow = null;
			setLightBrightness(lastLight, 0);
			lastLight.style.backgroundColor = null;
			if (horizLoopTracker < 7) {
				horizLoopTracker++;
			} else {
				horizLoopTracker = 0;
			}
			moveHorizDot();
		}
	}, beatDuration)
}

let vertLoopIndex;
let loopDuration = 8;
let inLoop = false;
let vertLoopTimeout;
const vertArray = ['bottom_4', 'bottom_3', 'bottom_2', 'bottom_1', 'top_1', 'top_2', 'top_3', 'top_4'];
const verticalLoop = () => {
	if (loopDuration < 7) {
		let nextLight = $(vertArray[vertLoopIndex]);
		setLightBrightness(nextLight, 2);
		nextLight.style.backgroundColor = "var(--loopColor)";
		nextLight.style.boxShadow = "0px 0px 3px 3px var(--loopColor)";
		vertLoopTimeout = setTimeout(() => {
			let lastLight = $(vertArray[vertLoopIndex]);
			lastLight.style.boxShadow = null;
			setLightBrightness(lastLight, 0);
			if (vertLoopIndex < loopDuration) {
				vertLoopIndex++;
			} else {
				vertLoopIndex = 0;
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
		loopDuration = 8;
		vertLoopIndex = 0;
		verticalLoop();
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

const loopHandleLightTap = (sliderName, lightIndex) => {
	let nextLight;
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
					setLightBrightness(nextLight, 0);
					nextLight.style.backgroundColor = null;
					nextLight.style.boxShadow = null;
					vertLoopIndex = 0;
				}
			} else {
				$(vertArray[i]).style.backgroundColor = "var(--loopColor)";
			}
		}
		if (loopDuration == 7) {
			nextLight = $(vertArray[vertLoopIndex]);
			setLightBrightness(nextLight, 1);
			nextLight.style.backgroundColor = "var(--loopColor)";
			nextLight.style.boxShadow = null;
		}
		clearTimeout(vertLoopTimeout);
		verticalLoop();
	}
}
