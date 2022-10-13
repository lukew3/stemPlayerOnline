class Audio {
    constructor() {
        this.lights = [];
        this.songIndex = 1; // Rename songIndex to playlistIndex or songIndexInPlaylist or similar?
        this.nowPlaying = false;
        this.paused = false;

        let tracks = playlist[this.songIndex].tracks
        this.wads = [
            new Wad({source: tracks[0]}),
            new Wad({source: tracks[1]}),
            new Wad({source: tracks[2]}),
            new Wad({source: tracks[3]})
        ];
        this.polywad = new Wad.Poly();
        this.wads.forEach((wad) => { this.polywad.add(wad) });

        this.trackStartTime = 0; // audioCtx.currentTime when the track started playing

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
    
    loadSong = () => {
        Wad.stopAll();
        this.wads.forEach((wad) => { this.polywad.remove(wad) });
        let nextTracks = playlist[this.songIndex].tracks;
        nextTracks.forEach((track, i) => {
            this.wads[i] = new Wad({source: track});
            this.polywad.add(this.wads[i]);
        })
        if (bpm) {
            bpm = playlist[this.songIndex].bpm || 120;
            beatDuration = 60/bpm*1000;
        }
    }

    playAudio() {
        $("loading").style.width = "0%";
        $("loading").style.display = "block";
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
