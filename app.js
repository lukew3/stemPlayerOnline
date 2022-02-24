const $ = (id) => { return document.getElementById(id) };

let data = songs["we_made_it_kid"];

let offsets = [
	$("topSlider").getBoundingClientRect(),
	$("leftSlider").getBoundingClientRect(),
	$("rightSlider").getBoundingClientRect(),
	$("bottomSlider").getBoundingClientRect()
];

let sliderNames = [
	"top",
	"left",
	"right",
	"bottom"
]

var track1, track2, track3, track4;

const loadTracks = () => {
	track1 = new Audio(data["1"]);
	track1.type = 'audio/wav';
	track2 = new Audio(data["2"]);
	track2.type = 'audio/wav';
	track3 = new Audio(data["3"]);
	track3.type = 'audio/wav';
	track4 = new Audio(data["4"]);
	track4.type = 'audio/wav';
}
loadTracks();

const key = {
	"top": track1,
	"left": track2,
	"right": track3,
	"bottom": track4
}

async function playAudio() {
	try {
		track1.play();
		track2.play();
		track3.play();
		track4.play();
	} catch (err) {
		console.log('Failed to play...' + err);
	}
}

async function pauseAudio() {
	track1.pause();
	track2.pause();
	track3.pause();
	track4.pause();
}

let nowPlaying = false;
const togglePlayback = () => {
	if (nowPlaying) {
		pauseAudio();
		nowPlaying = false;
	} else {
		playAudio();
		nowPlaying = true;
	}
}

let centerButtonPressed = false;
$("centerButton").addEventListener("pointerdown", () => {
	$("centerButton").style.backgroundColor = "#82664b";
	centerButtonPressed = true;
});

$("centerButton").addEventListener("pointerup", () => {
	if (centerButtonPressed) {
		togglePlayback();
		$("centerButton").style.backgroundColor = "var(--player)";
	}
	centerButtonPressed = false;
});


const setLightColor = (light, lightIndex) => {
	if (light.id.split("_")[1] > lightIndex) {
		//light.style.backgroundColor = "var(--light-off)";
		light.classList.add("lightOff");
	} else {
		//light.style.backgroundColor = "var(--light-on)"
		light.classList.remove("lightOff");
	}
}

let isolating = false;
const isolateVolume = (sliderName) => {
	if (isolating) return;
	isolating = true;
	let volumes = [
		track1.volume,
		track2.volume,
		track3.volume,
		track4.volume
	]
	track1.volume = 0;
	track2.volume = 0;
	track3.volume = 0;
	track4.volume = 0;
        Array.from(document.getElementsByClassName('light')).forEach((light) => {
		//light.style.backgroundColor = "var(--light-off)";
		light.classList.add("lightOff");
	});

	key[sliderName].volume = 1;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		//light.style.backgroundColor = "var(--light-on)";
		light.classList.remove("lightOff");
	});
	const resetVolume = () => {
		track1.volume = volumes[0];
		track2.volume = volumes[1];
		track3.volume = volumes[2];
		track4.volume = volumes[3];
		// set the colors based on the saved volumes
		['top', 'left', 'right', 'bottom'].forEach((sliderName, index) => {
        		Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
				setLightColor(light, volumes[index]*3+1);
			});
		});
		isolating = false;
		// remove the event listener after it is used once
		document.removeEventListener('pointerup', resetVolume);
	}
	document.addEventListener('pointerup', resetVolume)
}

const handleLightTap = (sliderName, lightIndex) => {
	key[sliderName].volume = (lightIndex-1)/3;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		setLightColor(light, lightIndex);
	});
}

let controlPressed = false;
document.addEventListener("keydown", (e) => {
	let curVolume;
	if (e.key == " ") {
		togglePlayback();
	} else if (e.key == "Control") {
		controlPressed = true;
	} else if (e.key.substring(0,5) == "Arrow") {
		let dir;
		if (e.key == "ArrowRight") dir = "right";
		else if (e.key == "ArrowUp") dir = "top";
		else if (e.key == "ArrowDown") dir = "bottom";
		else if (e.key == "ArrowLeft") dir = "left";
		curVolume = key[dir].volume * 3 + 1;
		if (controlPressed && curVolume != 1)
			handleLightTap(dir, (curVolume-1).toString());
		else if (!controlPressed && curVolume != 4)
			handleLightTap(dir, (curVolume+1).toString());
	}

	//enable holding arrow key to isolate track
})

document.addEventListener("keyup", (e) => {
	if (e.key == "Control") {
		controlPressed = false;
	}
});

let pointerdown = false;
document.addEventListener('pointerdown', (e) => {
	pointerdown = true;
	handlePointerDown(e);
})
document.addEventListener('pointerup', (e) => {
	pointerdown = false;
})
window.addEventListener('resize', (e) => {
	offsets = [
		$("topSlider").getBoundingClientRect(),
		$("leftSlider").getBoundingClientRect(),
		$("rightSlider").getBoundingClientRect(),
		$("bottomSlider").getBoundingClientRect()
	];
})

document.addEventListener("pointermove", (e) => {
	if (pointerdown) {
		handlePointerDown(e);
	}
})

let lightNum;
const handlePointerDown = (e) => {
	let released = false;
	const markRelease = () => {
		released = true;
		document.removeEventListener('pointerup', markRelease);
	}
	offsets.forEach((offset, index) => {
		if (e.clientX >= offset.left && 
			e.clientX <= offset.right &&
			e.clientY >= offset.top &&
			e.clientY <= offset.bottom
		) {
			lightNum = getLightClicked(e, index);
			handleLightTap(sliderNames[index], lightNum);
			if (lightNum == "4") setTimeout(() => {
				if (pointerdown && lightNum == "4") {
					//lightNum is global so that you can check new value after timeout
					isolateVolume(sliderNames[index]);
				}
			}, 200)

		}
	})
}
const getLightClicked = (clickEvent, offsetIndex) => {
	let segLen;
	let offset = offsets[offsetIndex];
	let y = clickEvent.clientY;
	let x = clickEvent.clientX;
	/*
	let sliderBase;
	let sliderDirection;
	let segLen;
	*/
	if (offsetIndex == 0) {
		//top
		segLen = offset.height/4;
		for (let i=1; i<=4; i++) {
			if (y >= offset.bottom - i * segLen) {
				return i.toString();
			}
		}
	} else if (offsetIndex == 1) {
		//left
		segLen = offset.width/4;
		for (let i=1; i<=4; i++) {
			if (x >= offset.right - i * segLen) {
				return i.toString();
			}
		}
	} else if (offsetIndex == 2) {
		//right
		segLen = offset.width/4;
		for (let i=1; i<=4; i++) {
			if (x <= offset.left + i * segLen) {
				return i.toString();
			}
		}
	} else if (offsetIndex == 3) {
		//bottom
		segLen = offset.height/4;
		for (let i=1; i<=4; i++) {
			if (y <= offset.top + i * segLen) {
				return i.toString();
			}
		}
	} else {
		// if there is an error
		return "1";
	}
}
