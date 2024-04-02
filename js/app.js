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

function createSelectStemsItem(title, artist, art) {
	let item = document.createElement("div");
	let cover = document.createElement("div");
	cover.className = "selectStemsItemCover";
	if (art) cover.innerHTML = `<img src=${art} height="50px" width="50px">`
	item.appendChild(cover);
	let right = document.createElement("div");
	right.className = "selectStemsItemRight";
	let titleElem = document.createElement("p");
	titleElem.innerHTML = title;
	right.appendChild(titleElem);
	let artistElem = document.createElement("p");
	artistElem.innerHTML = artist;
	right.appendChild(artistElem);
	item.appendChild(right);
	item.className = "selectStemsItem";
	return item;
}

function unselectStemsItems() {
	document.querySelectorAll(".selectStemsItem.selected").forEach((e) => {
		e.classList.remove('selected');
	})
}

// Populate selectStems with options
playlist.forEach((stem, i) => {
	let item = createSelectStemsItem(stem.title, 'Kanye West', '')
	if (i === 1) item.classList.add("selected");
	item.addEventListener("click", (e) => {
		audio.songIndex = i;
		unselectStemsItems();
		item.classList.add('selected');
	});
	$("selectStemsSPO").appendChild(item);
});


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
	document.addEventListener("keyup", (e) => {
        if (e.key == "Shift") resetVolume();
	});
}
