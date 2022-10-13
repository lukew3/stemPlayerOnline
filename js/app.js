let isolating = false;
let controlPressed = false;
let pointerdown = false;
let wholeMaxVolume = 8; // Max volume in non-decimal
let lightNum;
let levels = [4, 4, 4, 4];
let sliderNames = ["right", "top", "left", "bottom"];

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
	sources.forEach((source, i) => {sourceGains[i].gain.value = 0;});
	lights.allLightsOff();

	sourceGains[key[sliderName]].gain.value = 1;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		lights.setLightBrightness(light, 1);
	});
	const resetVolume = () => {
		sources.forEach((source, i) => {sourceGains[i].gain.value = 1;});
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

