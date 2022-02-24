const $ = (id) => { return document.getElementById(id) };

let data = songs["we_made_it_kid"];

var track1, track2, track3, track4;

const loadTracks = () => {
	track1 = new Audio(data["1"]);
	track1.type = 'audio/wav';
	track2 = new Audio(data["2"]);
	track2.type = 'audio/wav';
	track3 = new Audio(data["3"]);
	track3.type = 'audio/wav';
	track4 = new Audio(data["4"]);
	track4.type = 'audio/wav';
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

$("centerButton").addEventListener("pointerdown", () => {
	$("centerButton").style.backgroundColor = "#82664b";
});

$("centerButton").addEventListener("pointerup", () => {
	togglePlayback();
	$("centerButton").style.backgroundColor = "var(--player)";
});

const key = {
	"top": track1,
	"left": track2,
	"right": track3,
	"bottom": track4
}

const setLightColor = (light, lightIndex) => {
	if (light.id.split("_")[1] > lightIndex) {
		light.style.backgroundColor = "var(--light-off)";
	} else {
		light.style.backgroundColor = "var(--light-on)"
	}
}

const isolateVolume = (sliderName) => {
	let volumes = [
		track1.volume,
		track2.volume,
		track3.volume,
		track4.volume
	]
	track1.volume = 0;
	track2.volume = 0;
	track3.volume = 0;
	track4.volume = 0;
        Array.from(document.getElementsByClassName('light')).forEach((light) => {
		light.style.backgroundColor = "var(--light-off)";
	});

	key[sliderName].volume = 1;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		light.style.backgroundColor = "var(--light-on)";
	});
	const resetVolume = () => {
		track1.volume = volumes[0];
		track2.volume = volumes[1];
		track3.volume = volumes[2];
		track4.volume = volumes[3];
		// set the colors based on the saved volumes
		['top', 'left', 'right', 'bottom'].forEach((sliderName, index) => {
        		Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
				setLightColor(light, volumes[index]*3+1);
			});
		});
		// remove the event listener after it is used once
		document.removeEventListener('pointerup', resetVolume);
	}
	document.addEventListener('pointerup', resetVolume)
}

const handleLightTap = (sliderName, lightIndex) => {
	key[sliderName].volume = (lightIndex-1)/3;
        Array.from(document.getElementsByClassName(sliderName + 'Light')).forEach((light) => {
		setLightColor(light, lightIndex);
	});
}

document.addEventListener('pointerdown', (e) => {
	let id = e.target.id;
	let s = id.split("_");
	if (e.target.classList.contains('light')) {
		// set volume if light clicked
		handleLightTap(s[0], s[1]);
	}
	// isolate volume if 4th light clicked for over 200ms
	let released = false;
	const markRelease = () => {
		released = true;
		document.removeEventListener('pointerup', markRelease);
	}
	document.addEventListener('pointerup', markRelease);
	if (s[1] == "4") setTimeout(() => {
		if (!released) {
			isolateVolume(s[0]);
			document.removeEventListener('pointerup', markRelease);
		}
	}, 200)
})

let controlPressed = false;
document.addEventListener("keydown", (e) => {
	let curVolume;
	if (e.key == " ") {
		togglePlayback();
	} else if (e.key == "Control") {
		controlPressed = true;
	} else if (e.key.substring(0,5) == "Arrow") {
		let dir;
		if (e.key == "ArrowRight") dir = "right";
		else if (e.key == "ArrowUp") dir = "top";
		else if (e.key == "ArrowDown") dir = "bottom";
		else if (e.key == "ArrowLeft") dir = "left";
		curVolume = key[dir].volume * 3 + 1;
		if (controlPressed && curVolume != 1)
			handleLightTap(dir, (curVolume-1).toString());
		else if (!controlPressed && curVolume != 4)
			handleLightTap(dir, (curVolume+1).toString());
	}

	//enable holding arrow key to isolate track
})

document.addEventListener("keyup", (e) => {
	if (e.key == "Control") {
		controlPressed = false;
	}
});
