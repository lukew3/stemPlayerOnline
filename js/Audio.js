class Audio {
    constructor() {
        this.songIndex = 1; // Rename songIndex to playlistIndex or songIndexInPlaylist or similar?
        this.nowPlaying = false;
        this.paused = false;
        this.wholeMaxVolume = 8;

        this.loadProgress = 0; // Out of 400
        this.checkLoadTimeout;
        
        this.playbackRate = 1;
        this.bpm = 120;
        this.beatDuration = 60/this.bpm*1000; // Milliseconds per beat

        let tracks = playlist[this.songIndex].tracks
        this.wads = [
            new Wad({source: tracks[0]}),
            new Wad({source: tracks[1]}),
            new Wad({source: tracks[2]}),
            new Wad({source: tracks[3]})
        ];
        this.polywad = new Wad.Poly();
        this.wads.forEach((wad) => { this.polywad.add(wad) });
    }

    #onEnded = () => {
        // Ensure not already in the middle of loading a track
        if (this.tracksReady.indexOf(false) == -1) {
            // If not at end of playlist, load and play next song
            if (this.songIndex < playlist.length - 1) {
                this.songIndex++;
                this.loadSong();
                setTimeout(this.playAudio, 100);
            } else {
                this.nowPlaying = false;
            }
        }
    }

    incrementPolyVolume = () => {
        if (this.wholeMaxVolume != 8) {
			this.wholeMaxVolume++;
			this.polywad.setVolume(this.wholeMaxVolume/8);
		}
    }

    decrementPolyVolume = () => {
        if (this.wholeMaxVolume != 0) {
			this.wholeMaxVolume--;
			this.polywad.setVolume(this.wholeMaxVolume/8);
		}
    }

    checkLoadProgress = () => {
        this.loadProgress = 0;
        this.wads.forEach((wad) => {this.loadProgress += wad.playable*100});
        $("loading").value = this.loadProgress;
        $("loadingLabel").innerHTML = this.loadProgress/4 + "%";
        if (this.loadProgress < 400) {
            this.checkLoadTimeout = setTimeout(this.checkLoadProgress, 100);
        } else {
            setTimeout(() => {
                $("loadingLabel").innerHTML = '';
                $("loading").value = 0;
            }, 750);
        }
    }
    
    loadSong = () => {
        Wad.stopAll();
        this.wads.forEach((wad) => { this.polywad.remove(wad) });
        let nextTracks = playlist[this.songIndex].tracks;
        nextTracks.forEach((track, i) => {
            this.wads[i] = new Wad({source: track});
            this.polywad.add(this.wads[i]);
        })
        if (this.bpm) {
            this.bpm = playlist[this.songIndex].bpm || 120;
            this.beatDuration = 60/this.bpm*1000;
        }
        this.checkLoadProgress();
    }

    playAudio() {
        if (this.loadProgress != 400) {
            alert("Try again after progress bar is full");
            return;
        }
        if (this.paused) {
            this.wads.forEach((wad) => { this.paused ? wad.unpause() : wad.play() });
        } else {
            this.polywad.play();
        }
        this.nowPlaying = true;
        this.paused = false;
    }
    
    pauseAudio = () => {
        this.wads.forEach((wad) => { wad.pause(); });
        this.nowPlaying = false;
        this.paused = true;
    }
    
    togglePlayback = () => {
        this.nowPlaying ? this.pauseAudio() : this.playAudio();
    }
}

let audio = new Audio();
