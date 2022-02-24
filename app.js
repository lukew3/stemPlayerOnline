const $ = (id) => { return document.getElementById(id) };

let data = songs["we_made_it_kid"];

var track1, track2, track3, track4;

const loadTracks = () => {
	track1 = new Audio(data["1"]);
	track1.type = 'audio/wav';
	//track1.volume = $("topSlider").value/3;
	track2 = new Audio(data["2"]);
	track2.type = 'audio/wav';
	//track2.volume = $("leftSlider").value/3;
	track3 = new Audio(data["3"]);
	track3.type = 'audio/wav';
	//track3.volume = $("rightSlider").value/3;
	track4 = new Audio(data["4"]);
	track4.type = 'audio/wav';
	//track4.volume = $("bottomSlider").value/3;
}
loadTracks();

async function playAudio() {
	try {
		track1.play();
		track2.play();
		track3.play();
		track4.play();
	} catch (err) {
		console.log('Failed to play...' + err);
	}
}

async function pauseAudio() {
	track1.pause();
	track2.pause();
	track3.pause();
	track4.pause();
}

let nowPlaying = false;
const togglePlayback = () => {
	if (nowPlaying) {
		pauseAudio();
		nowPlaying = false;
	} else {
		playAudio();
		nowPlaying = true;
	}
}

$("centerButton").addEventListener("click", () => {
	togglePlayback();
})

const adjustVolume = (slider, track) => {
	track.volume = slider.value/3;
}
/*
$("topSlider").addEventListener("change", () => {
	adjustVolume($("topSlider"), track1);
})
$("leftSlider").addEventListener("change", () => {
	adjustVolume($("leftSlider"), track2);
})
$("rightSlider").addEventListener("change", () => {
	adjustVolume($("rightSlider"), track3);
})
$("bottomSlider").addEventListener("change", () => {
	adjustVolume($("bottomSlider"), track4);
})
*/

const key = {
	"top": track1,
	"left": track2,
	"right": track3,
	"bottom": track4
}

const isolateVolume = (sliderName) => {
	track1.volume = 0;
	track2.volume = 0;
	track3.volume = 0;
	track4.volume = 0;

	key[sliderName].volume = 1;
	document.addEventListener('mouseup', () => {
		track1.volume = 1;
		track2.volume = 1;
		track3.volume = 1;
		track4.volume = 1;
	})
}

document.addEventListener('mousedown', (e) => {
	if (e.target.classList.contains('light')) console.log('light clicked');
	if (e.target.classList.contains('slider')) console.log('slider clicked');
	let id = e.target.id;
	if (id.split("_")[1] == "4") isolateVolume(id.split("_")[0])
})

document.addEventListener("keydown", e => {
	if (e.key == " ") {
		togglePlayback();
	}
	//use arrow keys to control levels, arrow to increase, ctrl+arrow to lower, hold to isolate track
})
