let songIndex = 1;
let nowPlaying = false;
//let tracks = [$('audio1'), $('audio2'), $('audio3'), $('audio4')];
let tracksReady = [false, false, false, false];
let sources = [null, null, null, null];
let sourceGains = [null, null, null, null];

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

sources.forEach((source, i) => {
	sources[i] = audioCtx.createBufferSource();
})

const onEnded = () => {
	if (songIndex < playlist.length - 1) {
		songIndex++;
		loadSong();
	} else {
		nowPlaying = false;
	}
}

const loadBuffer = (response, i) => {
	sources[i].disconnect();
	delete sources[i];
	delete sourceGains[i];
	sourceGains[i] = audioCtx.createGain();
	sourceGains[i].gain.value = 1;
	sources[i] = audioCtx.createBufferSource();
	audioCtx.decodeAudioData(response, (buffer) => {
		if (!buffer) { console.log('Error decoding file data: ' + url);
		} else {
			sources[i].buffer = buffer;
			tracksReady[i] = true;
		}
		sources[i].connect(sourceGains[i]).connect(gainNode).connect(audioCtx.destination)
	});
	sources[i].addEventListener('ended', onEnded);
}

const loadSong = () => {
        tracksReady = [false, false, false, false];
        let song = playlist[songIndex].tracks;
        for (var i=0; i<4; i++) {
		let request = new XMLHttpRequest();
		request.open("GET", song[i], true);
		request.responseType = "arraybuffer";
		if (i==0) request.onload = () => {loadBuffer(request.response, 0)}
		else if (i==1) request.onload = () => {loadBuffer(request.response, 1)}
		else if (i==2) request.onload = () => {loadBuffer(request.response, 2)}
		else if (i==3) request.onload = () => {loadBuffer(request.response, 3)}
		request.send();
        }
        setTimeout(playAudio, 500);
	if (bpm) {
		bpm = playlist[songIndex].bpm || 120;
		beatDuration = 60/bpm*1000;
	}
}

const key = {
        "right": 0,
        "top": 1,
        "left": 2,
        "bottom": 3
}
function playAudio() {
	$("loading").style.display = "block";
        setTimeout(() => {
                if (tracksReady.indexOf(false) === -1) {
			// check if context is in suspended state (autoplay policy)
			if (audioCtx.state === 'suspended') {
				audioCtx.resume();
				nowPlaying = true; 
			} else {
				try {
					sources.forEach((source) => {source.start(0)});
					nowPlaying = true;
				} catch (err) {
					console.log('Failed to play...' + err);
				}
			}
			$("loading").style.display = "none";
                } else {
                        playAudio();
                }
        }, 100)
}

const pauseAudio = () => {
        //sources.forEach((source) => {audioCtx.suspend();});
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


const gainNode = audioCtx.createGain();
gainNode.gain.value = 1;
sources.forEach((source) => {
	source.connect(gainNode).connect(audioCtx.destination)
})
loadSong();
