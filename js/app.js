let isolating = false;
let controlPressed = false;
let pointerdown = false;
let lightNum;
let levels = [4, 4, 4, 4];
let sliderNames = ["right", "top", "left", "bottom"];
const nameToI = {
	"right": 0,
	"top": 1,
	"left": 2,
	"bottom": 3
}

if (navigator.vendor && 
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1) {
        $("alertBanner").style.display = "block";
}


const levelToVolume = (level) => {
	return (level-1)/3;
}

const showStemLights = () => {
	sliderNames.forEach((sliderName, index) => {
		Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
			lights.detectAndSetLightOn(light, levels[index]);
		});
	});
}

const isolateStem = (sliderName) => {
	if (isolating) return;
	isolating = true;
	audio.wads.forEach((wad) => { wad.setVolume(0);});
	lights.allLightsOff();

	audio.wads[nameToI[sliderName]].setVolume(1);
    Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		lights.setLightBrightness(light, 1);
	});
	const resetVolume = () => {
		audio.wads.forEach((wad, i) => { wad.setVolume(levelToVolume(levels[i]));});
		sliderNames.forEach((sliderName, index) => {
        	Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
				lights.detectAndSetLightOn(light, levels[index]);
			});
		});
		isolating = false;
		// remove the event listener after it is used once
		document.removeEventListener('pointerup', resetVolume);
	}
	document.addEventListener('pointerup', resetVolume)
}

