const $ = (id) => { return document.getElementById(id) };

let data = songs["we_made_it_kid"];

let nowPlaying = false;
let centerButtonPressed = false;
let isolating = false;
let controlPressed = false;
let pointerdown = false;
let lightNum;
let tracks = [];
let sliderBounds = [];
let sliderNames = ["right", "top", "left", "bottom"];

// Load starting stems 
for (var i=0; i<4; i++) {
	tracks[i] = new Audio(data[(i+1).toString()]);
	tracks[i].type = "audio/wav";
}

const key = {
	"right": tracks[0],
	"top": tracks[1],
	"left": tracks[2],
	"bottom": tracks[3]
}

function playAudio() {
	try {
		tracks.forEach((track) => {track.play()});
	} catch (err) {
		console.log('Failed to play...' + err);
	}
}

function pauseAudio() {
	tracks.forEach((track) => {track.pause();});
}

const togglePlayback = () => {
	if (nowPlaying) {
		pauseAudio();
		nowPlaying = false;
	} else {
		playAudio();
		nowPlaying = true;
	}
}

$("centerButton").addEventListener("pointerdown", () => {
	$("centerButton").style.backgroundColor = "#82664b";
	centerButtonPressed = true;
});
$("centerButton").addEventListener("pointerup", () => {
	if (centerButtonPressed) {
		togglePlayback();
		$("centerButton").style.backgroundColor = "var(--player)";
		centerButtonPressed = false;
	}
});


const setLightColor = (light, lightIndex) => {
	(light.id.split("_")[1] > lightIndex) ?
		light.classList.add("lightOff") :
		light.classList.remove("lightOff");
}

const isolateVolume = (sliderName) => {
	if (isolating) return;
	isolating = true;
	let volumes = [
		tracks[0].volume,
		tracks[1].volume,
		tracks[2].volume,
		tracks[3].volume
	]
	tracks.forEach((track) => {track.volume = 0;});
        Array.from(document.getElementsByClassName('light')).forEach((light) => {
		light.classList.add("lightOff");
	});

	key[sliderName].volume = 1;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		light.classList.remove("lightOff");
	});
	const resetVolume = () => {
		tracks.forEach((track, i) => {track.volume = volumes[i]});
		// set the colors based on the saved volumes
		sliderNames.forEach((sliderName, index) => {
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
	//todo: enable holding arrow key to isolate track (or shift+arrow maybe)
})

document.addEventListener("keyup", (e) => {
	if (e.key == "Control") controlPressed = false;
});

document.addEventListener('pointerdown', (e) => {
	pointerdown = true;
	handlePointerDown(e);
})
document.addEventListener('pointerup', (e) => {
	pointerdown = false;
})

const getSliders = () => {
	sliderBounds = [
		$("rightSlider").getBoundingClientRect(),
		$("topSlider").getBoundingClientRect(),
		$("leftSlider").getBoundingClientRect(),
		$("bottomSlider").getBoundingClientRect()
	];
}
getSliders();
window.addEventListener('resize', (e) => {
	getSliders();
})

document.addEventListener("pointermove", (e) => {
	if (pointerdown) handlePointerDown(e);
})

const handlePointerDown = (e) => {
	sliderBounds.forEach((bound, index) => {
		if (e.clientX >= bound.left && 
			e.clientX <= bound.right &&
			e.clientY >= bound.top &&
			e.clientY <= bound.bottom
		) {
			lightNum = getLightClicked(e, index);
			handleLightTap(sliderNames[index], lightNum);
			// listen for hold if light 4 is touched
			if (lightNum == "4") setTimeout(() => {
				if (pointerdown && lightNum == "4") {
					//lightNum is global so that you can check new value after timeout
					isolateVolume(sliderNames[index]);
				}
			}, 200)

		}
	})
}
const getLightClicked = (clickEvent, boundIndex) => {
	let segLen, i;
	let bound = sliderBounds[boundIndex];
	let y = clickEvent.clientY;
	let x = clickEvent.clientX;
	const inBounds = [
		() => { return x <= bound.left + i * segLen},
		() => { return y >= bound.bottom - i * segLen},
		() => { return x >= bound.right - i * segLen},
		() => { return y <= bound.top + i * segLen}
	]
	if ([1, 3].includes(boundIndex)) segLen = bound.height/4;
	else if ([2, 0].includes(boundIndex)) segLen = bound.width/4;
	for (i=1; i<=4; i++)
		if (inBounds[boundIndex]()) return i.toString();
	return "1"; // catch error
}
$("folderSelectIcon").addEventListener("click", () => {
	$("folderSelectField").click();
});

$("folderSelectField").addEventListener("change", () => {
	// load the first 4 mp3 files in the directory as stems
	// todo: ensure that 4 audio files are used as stems
	let files = $("folderSelectField").files;
	nowPlaying = false;
	// this will automatically place tracks in the right position if they are numbered
	tracks.forEach((track, i) => {track.src = URL.createObjectURL(files[i]);});
	// set label to folder name
	$("folderSelectLabel").innerHTML = files[0].webkitRelativePath.split("/")[0];
});
