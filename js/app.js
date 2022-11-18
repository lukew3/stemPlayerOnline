let isolating = false;
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

// Populate selectStems with options
playlist.forEach((stem, i) => {
	let item = document.createElement("div");
	let cover = document.createElement("div");
	cover.className = "selectStemsItemCover";
	item.appendChild(cover);
	let right = document.createElement("div");
	right.className = "selectStemsItemRight";
	let title = document.createElement("p");
	title.innerHTML = stem.title;
	right.appendChild(title);
	let artist = document.createElement("p");
	artist.innerHTML = "Kanye West";
	right.appendChild(artist);
	item.appendChild(right);
	item.className = "selectStemsItem";
	if (i === 1) item.classList.add("selected");
	item.addEventListener("click", (e) => {
		audio.songIndex = i;
		document.querySelectorAll(".selectStemsItem.selected").forEach((e) => {
			e.classList.remove('selected');
		})
		item.classList.add('selected');
	});
	$("selectStemsSPO").appendChild(item);
});

// Start playback if valid query params
const params = new URLSearchParams(window.location.search);
console.log(params.get('source'));
console.log(params.get('id'));
if (params.get('id')) {
	$("selectStems").style.display = "none";
	audio.songIndex = params.get('id');
	selectingStems = false;
	audio.nowPlaying = false;
	audio.loadSong();
	audio.playAudio();
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
