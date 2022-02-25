const $ = (id) => { return document.getElementById(id) };

let data = songs["we_made_it_kid"];

let offsets = [
	$("topSlider").getBoundingClientRect(),
	$("leftSlider").getBoundingClientRect(),
	$("rightSlider").getBoundingClientRect(),
	$("bottomSlider").getBoundingClientRect()
];

let sliderNames = ["top", "left", "right", "bottom"];
let tracks = [];

const loadTracks = () => {
	for (var i=0; i<4; i++) {
		tracks[i] = new Audio(data[(i+1).toString()]);
		tracks[i].type = "audio/wav";
	}
}
loadTracks();

const key = {
	"top": tracks[0],
	"left": tracks[1],
	"right": tracks[2],
	"bottom": tracks[3]
}

async function playAudio() {
	try {
		tracks.forEach((track) => {track.play()});
	} catch (err) {
		console.log('Failed to play...' + err);
	}
}

async function pauseAudio() {
	tracks.forEach((track) => {track.pause();});
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
		light.classList.add("lightOff");
	} else {
		light.classList.remove("lightOff");
	}
}

let isolating = false;
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
		tracks[0].volume = volumes[0];
		tracks[1].volume = volumes[1];
		tracks[2].volume = volumes[2];
		tracks[3].volume = volumes[3];
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
	let segLen, i;
	let offset = offsets[offsetIndex];
	let y = clickEvent.clientY;
	let x = clickEvent.clientX;
	const inBounds = [
		() => { return y >= offset.bottom - i * segLen},
		() => { return x >= offset.right - i * segLen},
		() => { return x <= offset.left + i * segLen},
		() => { return y <= offset.top + i * segLen}
	]
	if ([0, 3].includes(offsetIndex)) segLen = offset.height/4;
	else if ([1, 2].includes(offsetIndex)) segLen = offset.width/4;
	for (i=1; i<=4; i++)
		if (inBounds[offsetIndex]()) return i.toString();
	return "1"; // catch error
}
$("folderSelectIcon").addEventListener("click", () => {
	$("folderSelectField").click();
});

$("folderSelectField").addEventListener("change", () => {
	// load the first 4 mp3 files in the directory as stems
	let fs = $("folderSelectField");
	let files = fs.files;
	// should ensure that there are 4 audio files to play
	nowPlaying = false;
	tracks.forEach((track, i) => {track.src = URL.createObjectURL(files[i]);});
	let folderName = files[0].webkitRelativePath.split("/")[0];
	$("folderSelectLabel").innerHTML = folderName;
});
