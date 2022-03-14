let songIndex = 7;
let nowPlaying = false;
let tracks = [];
let tracksReady = [false, false, false, false];

// Load starting stems 
for (var i=0; i<4; i++) {
        tracks[i] = new Audio(playlist[songIndex][i]);
        tracks[i].type = "audio/wav";
}
tracks[0].onended = () => {
	if (songIndex < playlist.length - 1) {
		songIndex++;
		loadSong();
	} else {
		nowPlaying = false;
	}
}
const loadSong = () => {
        tracksReady = [false, false, false, false];
        let song = playlist[songIndex];
        for (var i=0; i<4; i++) {
                tracks[i].src = song[i];
        }
        setTimeout(playAudio, 500);
}

const key = {
        "right": tracks[0],
        "top": tracks[1],
        "left": tracks[2],
        "bottom": tracks[3]
}

tracks.forEach((track, i) => {
        track.addEventListener("canplaythrough", (e) => {
                tracksReady[i] = true;
        })
})
function playAudio() {
	//$("loading").style.display = "block";
        setTimeout(() => {
                if (tracksReady.indexOf(false) === -1) {
                        try {
				tracks.forEach((track) => {track.play()});
				nowPlaying = true;
                        } catch (err) {
				console.log('Failed to play...' + err);
                        }
			//$("loading").style.display = "none";
                } else {
                        playAudio();
                }
        }, 100)
}

const pauseAudio = () => {
        tracks.forEach((track) => {track.pause();});
        nowPlaying = false;
}
  
const togglePlayback = () => {
        if (nowPlaying) { 
                pauseAudio();
        } else {
                playAudio();
        }
}


