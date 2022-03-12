let songIndex = 1;

let nowPlaying = false;
let centerButtonPressed = false;
let isolating = false;
let controlPressed = false;
let pointerdown = false;
let maxVolume = 1;
let wholeMaxVolume = 8; // Max volume in non-decimal
let lightNum;
let tracks = [];
let levels = [4, 4, 4, 4];
let sliderNames = ["right", "top", "left", "bottom"];
let tracksReady = [false, false, false, false]
let hideLightsTimeout;

// Load starting stems 
for (var i=0; i<4; i++) {
	tracks[i] = new Audio(playlist[songIndex][i]);
	tracks[i].type = "audio/wav";
	tracks[i].onended = () => {nowPlaying = false;};
}
const loadSong = () => {
	tracksReady = [false, false, false, false];
	let song = playlist[songIndex];
	for (var i=0; i<4; i++) {
		tracks[i].src = song[i];
	}
	setTimeout(playAudio, 500);
}

const key = {
	"right": tracks[0],
	"top": tracks[1],
	"left": tracks[2],
	"bottom": tracks[3]
}

tracks.forEach((track, i) => {
	track.addEventListener("canplaythrough", (e) => {
		tracksReady[i] = true;
	})
})
function playAudio() {
	setTimeout(() => {
		if (tracksReady.indexOf(false) === -1) {
			try {
				tracks.forEach((track) => {track.play()});
				nowPlaying = true;
			} catch (err) {
				console.log('Failed to play...' + err);
			}
		} else {
			playAudio();
		}
	}, 100)
}

function pauseAudio() {
	tracks.forEach((track) => {track.pause();});
	nowPlaying = false;
}

const togglePlayback = () => {
	if (nowPlaying) {
		pauseAudio();
	} else {
		playAudio();
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

const levelToVolume = (level) => {
	return (level-1)/3*maxVolume;
}

const setLightBrightness = (light, brightness) => {
	if (brightness == 0) {
		light.classList.add("lightOff");
		light.classList.remove("lightBright");
	} else if (brightness == 1) {
		light.classList.remove("lightOff");
		light.classList.remove("lightBright");
	} else if (brightness == 2) {
		light.classList.remove("lightOff");
		light.classList.add("lightBright");
	}
}

const allLightsOff = () => {
        Array.from(document.getElementsByClassName('light')).forEach((light) => {
		setLightBrightness(light, 0);
	});
}

const showStemLights = () => {
	sliderNames.forEach((sliderName, index) => {
		Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
			setLightColor(light, levels[index]);
		});
	});
}

const setLightColor = (light, lightIndex) => {
	(light.id.split("_")[1] > lightIndex) ?
		setLightBrightness(light, 0) :
		setLightBrightness(light, 1);
}

const isolateVolume = (sliderName) => {
	if (isolating) return;
	isolating = true;
	let tempLevels = [
		levels[0],
		levels[1],
		levels[2],
		levels[3]
	]
	tracks.forEach((track) => {track.volume = 0;});
	allLightsOff();

	key[sliderName].volume = maxVolume;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		setLightBrightness(light, 1);
	});
	const resetVolume = () => {
		tracks.forEach((track, i) => {track.volume = levelToVolume(tempLevels[i]);});
		sliderNames.forEach((sliderName, index) => {
        		Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
				setLightColor(light, tempLevels[index]);
			});
		});
		isolating = false;
		// remove the event listener after it is used once
		document.removeEventListener('pointerup', resetVolume);
	}
	document.addEventListener('pointerup', resetVolume)
}

const handleLightTap = (sliderName, lightIndex) => {
  if (levels[sliderNames.indexOf(sliderName)] == parseInt(lightIndex)) return; //Dont update volume or lights if same light as active light is selected
	key[sliderName].volume = levelToVolume(lightIndex);
	levels[sliderNames.indexOf(sliderName)] = parseInt(lightIndex);
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		setLightColor(light, lightIndex);
	});
}

/* Detect slider click */
document.addEventListener('pointerdown', (e) => {
	pointerdown = true;
	handlePointerDown(e);
})
document.addEventListener('pointerup', (e) => {
	pointerdown = false;
})

let sliderBounds = [];
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
			if (lightNum == "4" && !isolating) setTimeout(() => {
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

/* Folder Select */
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
$("leftDotButton").addEventListener("click", () => {
        if (songIndex != 0) {
                songIndex--;
                loadSong();
        }
});                                                                                                                                   
$("rightDotButton").addEventListener("click", () => {
        if (songIndex + 1 != playlist.length) {
                songIndex++;
                loadSong();
        }
});

