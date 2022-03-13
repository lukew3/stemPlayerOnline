let centerButtonPressed = false;
let isolating = false;
let controlPressed = false;
let pointerdown = false;
let maxVolume = 1;
let wholeMaxVolume = 8; // Max volume in non-decimal
let lightNum;
let levels = [4, 4, 4, 4];
let sliderNames = ["right", "top", "left", "bottom"];
let hideLightsTimeout;

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

const isolateStem = (sliderName) => {
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

/* Folder Select */
$("folderSelectGroup").addEventListener("click", () => {
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

