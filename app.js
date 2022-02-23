const $ = (id) => { return document.getElementById(id) };

const data = {
	"1": "https://lukew3.com/recolorbot/photos/Donda_2_We%20Did%20It%20Kid_1.mp3",
	"2": "https://lukew3.com/recolorbot/photos/Donda_2_We%20Did%20It%20Kid_2.mp3",
	"3": "https://lukew3.com/recolorbot/photos/Donda_2_We%20Did%20It%20Kid_3.mp3",
	"4": "https://lukew3.com/recolorbot/photos/Donda_2_We%20Did%20It%20Kid_4.mp3"
}

var track1, track2, track3, track4;

const loadSong = () => {
	track1 = new Audio(data["1"]);
	track1.type = 'audio/wav';
	track1.volume = $("topSlider").value/3;
	track2 = new Audio(data["2"]);
	track2.type = 'audio/wav';
	track2.volume = $("leftSlider").value/3;
	track3 = new Audio(data["3"]);
	track3.type = 'audio/wav';
	track3.volume = $("rightSlider").value/3;
	track4 = new Audio(data["4"]);
	track4.type = 'audio/wav';
	track4.volume = $("bottomSlider").value/3;
}
loadSong();


async function safePlay(track) {
	try {
		await track.play();
		//console.log('Playing...');
	} catch (err) {
		console.log('Failed to play...' + err);
	}
}

async function playAudio() {
	safePlay(track1);
	safePlay(track2);
	safePlay(track3);
	safePlay(track4);
}

async function pauseAudio() {
	track1.pause();
	track2.pause();
	track3.pause();
	track4.pause();
}

let nowPlaying = false;
$("centerButton").addEventListener("click", () => {
	if (nowPlaying) {
		pauseAudio();
		nowPlaying = false;
	} else {
		playAudio();
		nowPlaying = true;
	}
})

const adjustVolume = (slider, track) => {
	track.volume = slider.value/3;
}

$("topSlider").addEventListener("mouseup", () => {
	adjustVolume($("topSlider"), track1);
})
$("leftSlider").addEventListener("mouseup", () => {
	adjustVolume($("leftSlider"), track2);
})
$("rightSlider").addEventListener("mouseup", () => {
	adjustVolume($("rightSlider"), track3);
})
$("bottomSlider").addEventListener("mouseup", () => {
	adjustVolume($("bottomSlider"), track4);
})
