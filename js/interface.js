// include getsliders, handleLighttap, etc

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
$("centerButton").addEventListener("pointerdown", () => {
        $("centerButton").style.backgroundColor = "#82664b";
        centerButtonPressed = true;
});
$("centerButton").addEventListener("pointerup", () => {
        if (centerButtonPressed) {
		if (!inLoopMode) {
			togglePlayback();
		} else {
			if (loopDuration == 7 && speedDotIndex == 5) {
				exitLoopMode();
			} else {
				loopHandleLightTap("top", "4");
				setSpeed("right", "2"); // Should speed be getting reset here?
			}
		}
                $("centerButton").style.backgroundColor = "var(--player)";
                centerButtonPressed = false;
        }
});

$("minusButton").addEventListener("click", () => {
	if (!inLoopMode) {
		if (wholeMaxVolume != 0) {
			wholeMaxVolume--;
			maxVolume = wholeMaxVolume/8;
			updateVolumes();
		}
		displayVolume();
	}
});
$("plusButton").addEventListener("click", () => {
	if (!inLoopMode) {
		if (wholeMaxVolume != 8) {
			wholeMaxVolume++;
			maxVolume = wholeMaxVolume/8;
			updateVolumes();
		}
		displayVolume();
	}
});

$("leftDotButton").addEventListener("click", () => {
	if (!inLoopMode) {
		if (songIndex != 0) {
			songIndex--;
			loadSong();
		}
	} else if (loopStart*1000 >= beatDuration) {
		loopStart -= beatDuration/1000;
	}
});

$("rightDotButton").addEventListener("click", () => {
	if (!inLoopMode) {
		if (songIndex + 1 != playlist.length) {
			songIndex++;
			loadSong();
		}
	} else {
		loopStart += beatDuration/1000;
	}
});


