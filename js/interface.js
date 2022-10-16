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
	if (selectingStems) return;
    sliderBounds.forEach((bound, index) => {
        if (e.clientX >= bound.left &&
            e.clientX <= bound.right &&
            e.clientY >= bound.top &&
            e.clientY <= bound.bottom
        ) {
            lightNum = getLightClicked(e, index);
			if (loop.inLoopMode) {
				loop.loopHandleLightTap(sliderNames[index], lightNum)
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
	if (!loop.inLoopMode) {
		audio.togglePlayback();
	} else {
		if (loop.loopDuration == 7 && loop.speedDotIndex == 5) {
			loop.exitLoopMode();
		} else {
			loop.loopHandleLightTap("top", "4");
			loop.setSpeed("right", "2"); // Should speed be getting reset here?
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
	if (!loop.inLoopMode) {
		audio.decrementPolyVolume();
		lights.displayVolume(audio.wholeMaxVolume);
	}
});
$("plusButton").addEventListener("click", () => {
	if (!loop.inLoopMode) {
		audio.incrementPolyVolume();
		lights.displayVolume(audio.wholeMaxVolume);
	}
});

$("leftDotButton").addEventListener("click", () => {
	if (!loop.inLoopMode) {
		if (audio.songIndex != 0) {
			audio.songIndex--;
			audio.loadSong();
			audio.playAudio();
		}
	} else if (loop.offset*1000 >= audio.beatDuration) {
		loop.offset -= audio.beatDuration/1000;
	}
});

$("rightDotButton").addEventListener("click", () => {
	if (!loop.inLoopMode) {
		if (audio.songIndex + 1 != playlist.length) {
			audio.songIndex++;
			audio.loadSong();
			audio.playAudio();
		}
	} else {
		loop.offset += audio.beatDuration/1000;
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

/* Stem Select */
$("selectStemsResumeCurrent").addEventListener("click", () => {
	$("selectStems").style.display = "none";
});
$("selectStemsLaunch").addEventListener("click", () => {
	$("selectStems").style.display = "none";
	$("selectStemsResumeCurrent").style.display = "block";
	selectingStems = false;
	audio.nowPlaying = false;
	audio.loadSong();
	audio.playAudio();
});

$("selectStemsSPOHeader").addEventListener("click", () => {
	$("selectStemsSPO").classList.remove('collapsed');
	$("selectStemsSPOArrow").classList.remove('collapsed');
	$("selectStemsLocal").classList.add('collapsed');
	$("selectStemsLocalArrow").classList.add('collapsed');
});
$("selectStemsLocalHeader").addEventListener("click", () => {
	$("selectStemsLocal").classList.remove('collapsed');
	$("selectStemsLocalArrow").classList.remove('collapsed');
	$("selectStemsSPO").classList.add('collapsed');
	$("selectStemsSPOArrow").classList.add('collapsed');
});

$("folderSelectGroup").addEventListener("click", () => {
	$("selectStems").style.display = "flex";
	selectingStems = true;
	//$("folderSelectField").click();
});

$("folderSelectButton").addEventListener("click", () => {
	$("folderSelectField").click();
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
		$(`stemFileSelectBtn${i+1}`).innerHTML = files[i].name;
		playlist[0].tracks.push(URL.createObjectURL(files[i]));
	}
	audio.songIndex = 0;
	// set label to folder name
	$("folderSelectLabel").innerHTML = trackName;
});

$("stemFileSelectBtn1").addEventListener("click", () => {$("stemFileSelect1").click()});
$("stemFileSelect1").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stemFileSelectBtn1").innerHTML = file.name;
	playlist[0].tracks[0] = URL.createObjectURL(file);
	audio.songIndex = 0;
	audio.loadSong();
});
$("stemFileSelectBtn2").addEventListener("click", () => {$("stemFileSelect2").click()});
$("stemFileSelect2").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stemFileSelectBtn2").innerHTML = file.name;
	playlist[0].tracks[1] = URL.createObjectURL(file);
	songIndex = 0;
	audio.loadSong();
});
$("stemFileSelectBtn3").addEventListener("click", () => {$("stemFileSelect3").click()});
$("stemFileSelect3").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stemFileSelectBtn3").innerHTML = file.name;
	playlist[0].tracks[2] = URL.createObjectURL(file);
	songIndex = 0;
	loadSong();
});
$("stemFileSelectBtn4").addEventListener("click", () => {$("stemFileSelect4").click()});
$("stemFileSelect4").addEventListener("change", (e) => {
	let file = e.target.files[0];
	$("stemFileSelectBtn4").innerHTML = file.name;
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
	if (!loop.inLoopMode) {
		loop.enterLoopMode();
	} else {
		loop.exitLoopMode();
	}
})