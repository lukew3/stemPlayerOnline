let inLoopMode = false;
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
	}, 500)
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
	}
})

