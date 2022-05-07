let isolating = false;
let controlPressed = false;
let pointerdown = false;
let wholeMaxVolume = 8; // Max volume in non-decimal
let lightNum;
let levels = [4, 4, 4, 4];
let sliderNames = ["right", "top", "left", "bottom"];
let hideLightsTimeout;

if (navigator.vendor && 
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1) {
        $("alertBanner").style.display = "block";
}

const loadPlaylistViewer = () => {
	const pv = $("playlistViewer");
	pv.innerHTML = "";
	playlist.forEach((song, i) => {
		let songDiv = document.createElement('div');
		songDiv.classList.add("playlistViewerItem");
		songDiv.innerHTML = i+1 + ") " + song.title;
		songDiv.addEventListener("click", () => {
			songIndex = i;
			loadSong();
			playAudio();
		})
		pv.append(songDiv);
	})
}
loadPlaylistViewer();

const levelToVolume = (level) => {
	return (level-1)/3;
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
	sources.forEach((source, i) => {sourceGains[i].gain.value = 0;});
	allLightsOff();

	sourceGains[key[sliderName]].gain.value = 1;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		setLightBrightness(light, 1);
	});
	const resetVolume = () => {
		sources.forEach((source, i) => {sourceGains[i].gain.value = 1;});
		sliderNames.forEach((sliderName, index) => {
        		Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
				setLightColor(light, levels[index]);
			});
		});
		isolating = false;
		// remove the event listener after it is used once
		document.removeEventListener('pointerup', resetVolume);
	}
	document.addEventListener('pointerup', resetVolume)
}

