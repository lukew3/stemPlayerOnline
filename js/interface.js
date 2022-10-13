// include getsliders, handleLighttap, etc

const handleLightTap = (sliderName, lightIndex) => {
	if (levels[sliderNames.indexOf(sliderName)] == parseInt(lightIndex)) return; //Dont update volume or lights if same light as active light is selected
	audio.wads[nameToI[sliderName]].setVolume(levelToVolume(lightIndex));
	levels[sliderNames.indexOf(sliderName)] = parseInt(lightIndex);
	Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		lights.detectAndSetLightOn(light, lightIndex);
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
			if (inLoopMode) {
				loopHandleLightTap(sliderNames[index], lightNum)
			} else {
				handleLightTap(sliderNames[index], lightNum);
				// listen for hold if light 4 is touched
				if (lightNum == "4" && !isolating) setTimeout(() => {
					if (pointerdown && lightNum == "4") {
						//lightNum is global so that you can check new value after timeout
						isolateStem(sliderNames[index]);
					}
				}, 200)
 			}
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
let centerButtonPressed = false;
$("centerButton").addEventListener("click", () => {
	if (!inLoopMode) {
		audio.togglePlayback();
	} else {
		if (loopDuration == 7 && speedDotIndex == 5) {
			exitLoopMode();
		} else {
			loopHandleLightTap("top", "4");
			setSpeed("right", "2"); // Should speed be getting reset here?
		}
	}
})

$("centerButton").addEventListener("pointerdown", () => {
    $("centerButton").style.backgroundColor = "#82664b";
    centerButtonPressed = true;
});
$("centerButton").addEventListener("pointerup", () => {
    if (centerButtonPressed) {
        $("centerButton").style.backgroundColor = "var(--player)";
        centerButtonPressed = false;
    }
});

$("minusButton").addEventListener("click", () => {
	if (!inLoopMode) {
		audio.decrementPolyVolume();
		lights.displayVolume(audio.wholeMaxVolume);
	}
});
$("plusButton").addEventListener("click", () => {
	if (!inLoopMode) {
		audio.incrementPolyVolume();
		lights.displayVolume(audio.wholeMaxVolume);
	}
});

$("leftDotButton").addEventListener("click", () => {
	if (!inLoopMode) {
		if (audio.songIndex != 0) {
			audio.songIndex--;
			audio.loadSong();
			audio.playAudio();
		}
	} else if (loopStart*1000 >= audio.beatDuration) {
		loopStart -= audio.beatDuration/1000;
	}
});

$("rightDotButton").addEventListener("click", () => {
	if (!inLoopMode) {
		if (audio.songIndex + 1 != playlist.length) {
			audio.songIndex++;
			audio.loadSong();
			audio.playAudio();
		}
	} else {
		loopStart += audio.beatDuration/1000;
	}
});
/*
document.addEventListener("click", (e) => {
	if ($("selectLocalStems").style.display == 'block' && !$("selectLocalStems").contains(e.target)) {
		$("selectLocalStems").style.display = "none";
		console.log("hiding");
	}
})
*/
$("exitSelectLocal").addEventListener("click", () => {
	$("selectLocalStems").style.display = "none";
})

/* Folder Select */
$("folderSelectGroup").addEventListener("click", () => {
	$("selectLocalStems").style.display = "block";
	//$("folderSelectField").click();
});

$("folderSelectField").addEventListener("change", () => {
	try {pauseAudio();} catch {}
	// load the first 4 mp3 files in the directory as stems
	// todo: ensure that 4 audio files are used as stems
	let files = $("folderSelectField").files;
	let trackName = files[0].webkitRelativePath.split("/")[0];
	audio.nowPlaying = false;
	playlist = [{title: trackName, bpm: 180, tracks: []}];
	// this will automatically place tracks in the right position if they are numbered
	for (let i=0; i<4; i++) {
		$(`stem${i+1}Label`).innerHTML = files[i].name;
		playlist[0].tracks.push(URL.createObjectURL(files[i]));
	}
	audio.songIndex = 0;
	audio.loadSong();
	audio.playAudio();
	// set label to folder name
	$("folderSelectLabel").innerHTML = trackName;
});

$("stemFileSelectBtn1").addEventListener("click", () => {$("stemFileSelect1").click()});
$("stemFileSelect1").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stem1Label").innerHTML = file.name;
	playlist[0].tracks[0] = URL.createObjectURL(file);
	audio.songIndex = 0;
	audio.loadSong();
});
$("stemFileSelectBtn2").addEventListener("click", () => {$("stemFileSelect2").click()});
$("stemFileSelect2").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stem2Label").innerHTML = file.name;
	playlist[0].tracks[1] = URL.createObjectURL(file);
	songIndex = 0;
	audio.loadSong();
});
$("stemFileSelectBtn3").addEventListener("click", () => {$("stemFileSelect3").click()});
$("stemFileSelect3").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stem3Label").innerHTML = file.name;
	playlist[0].tracks[2] = URL.createObjectURL(file);
	songIndex = 0;
	loadSong();
});
$("stemFileSelectBtn4").addEventListener("click", () => {$("stemFileSelect4").click()});
$("stemFileSelect4").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stem4Label").innerHTML = file.name;
	playlist[0].tracks[3] = URL.createObjectURL(file);
	songIndex = 0;
	audio.loadSong();
});

/* Light color input listeners */
$("color4Icon").addEventListener("click", () => {
	$("color4Input").click();
})
$("color1Icon").addEventListener("click", () => {
	$("color1Input").click();
})
$("color4Input").addEventListener("change", () => {
	lights.generateGradient();
})
$("color1Input").addEventListener("change", () => {
	lights.generateGradient();
})

$("menuButton").addEventListener("click", () => {
	if (!inLoopMode) {
		enterLoopMode();
	} else {
		exitLoopMode();
	}
})