let songIndex = 1;
let nowPlaying = false;
//let tracks = [$('audio1'), $('audio2'), $('audio3'), $('audio4')];
let tracksReady = [false, false, false, false];
let sources = [null, null, null, null];
let sourceGains = [null, null, null, null];
let progressPercents = [0, 0, 0, 0];
let trackStartTime = 0; // audioCtx.currentTime when the track started playing

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx, masterGain;

const initAudioCtx = () => {
	audioCtx = new AudioContext();
	masterGain = audioCtx.createGain();
	masterGain.gain.value = 1;
	sources.forEach((source, i) => {
		sources[i] = audioCtx.createBufferSource(); // can we just use source instead of sources[i] ?
		sources[i].connect(masterGain).connect(audioCtx.destination);
	})
	loadSong();
}

const onEnded = () => {
	if (tracksReady.indexOf(false) == -1) {
		// If not already in the middle of loading a track
		if (songIndex < playlist.length - 1) {
			songIndex++;
			loadSong();
		        setTimeout(playAudio, 100);
		} else {
			nowPlaying = false;
		}
	}
}

const loadBuffer = async (response, i) => {
	try { sources[i].stop(0); } catch {};
	sources[i].disconnect();
	delete sources[i];
	delete sourceGains[i];
	sourceGains[i] = audioCtx.createGain();
	sourceGains[i].gain.value = 1;
	sources[i] = audioCtx.createBufferSource();
	let buffer = await audioCtx.decodeAudioData(response);
	if (!buffer) { console.log('Error decoding file data: ' + url);
	} else {
		sources[i] = audioCtx.createBufferSource();
		sources[i].buffer = buffer;
		tracksReady[i] = true;
	}
	sources[i].connect(sourceGains[i]).connect(masterGain).connect(audioCtx.destination)
	sources[i].addEventListener('ended', onEnded);
}

let requests = [];
const loadSong = () => {
	requests.forEach((request) => { request.abort(); });
	requests = [];
        tracksReady = [false, false, false, false];
        let song = playlist[songIndex].tracks;
        for (var i=0; i<4; i++) {
		let request = new XMLHttpRequest();
		requests.push(request);
		request.open("GET", song[i], true);
		request.responseType = "arraybuffer";
		(function (contextCopy) {
			request.onprogress = (prog) => {
				progressPercents[contextCopy] = (prog.loaded / prog.total);
				$('loading').style.width = 100 * progressPercents.reduce((sum, next) => {return sum + next}, 0) / 4 + "%";
			}
			request.onload = () => {loadBuffer(request.response, contextCopy)};
		}(i));
		request.send();
        }
	if (bpm) {
		bpm = playlist[songIndex].bpm || 120;
		beatDuration = 60/bpm*1000;
	}
	// Update active item in playlistViewer
	Array.from($("playlistViewer").children).forEach((element, i) => {
		if (i === songIndex) element.classList.add("pvActive");
		else element.classList.remove("pvActive");
	})
}

const key = {
        "right": 0,
        "top": 1,
        "left": 2,
        "bottom": 3
}
function playAudio() {
	$("loading").style.width = "0%";
	$("loading").style.display = "block";
        setTimeout(() => {
                if (tracksReady.indexOf(false) === -1) {
			// check if context is in suspended state (autoplay policy)
			if (audioCtx.state === 'suspended') {
				audioCtx.resume();
				nowPlaying = true;
			} else {
				audioCtx.suspend();
				audioCtx.resume();
				try {
					sources.forEach((source) => {source.start()});
					nowPlaying = true;
				} catch (err) {
					console.log('Failed to play...' + err);
				}
				trackStartTime = audioCtx.currentTime;
			}
			$("loading").style.display = "none";
			progressPercents = [0, 0, 0, 0];
                } else {
                        playAudio();
                }
        }, 100)
}

const pauseAudio = () => {
	audioCtx.suspend();
        nowPlaying = false;
}

const togglePlayback = () => {
        if (nowPlaying) {
                pauseAudio();
        } else {
                playAudio();
        }
}
