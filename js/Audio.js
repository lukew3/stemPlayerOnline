class Audio {
    constructor() {
        this.lights = [];
        this.songIndex = 1; // Rename songIndex to playlistIndex or songIndexInPlaylist or similar?
        this.nowPlaying = false;
        //let tracks = [$('audio1'), $('audio2'), $('audio3'), $('audio4')];
        this.tracksReady = [false, false, false, false];
        this.sources = [null, null, null, null];
        this.sourceGains = [null, null, null, null];
        this.progressPercents = [0, 0, 0, 0];
        this.trackStartTime = 0; // audioCtx.currentTime when the track started playing
        this.requests = [];

        // AudioContext was previously defined as const, not sure what to do with class though
        this.AudioContext = window.AudioContext || window.webkitAudioContext; 
        this.audioCtx, this.masterGain;
    }

    initAudioCtx = () => {
        this.audioCtx = new AudioContext();
        let masterGain = this.audioCtx.createGain();
        masterGain.gain.value = 1;
        this.sources.forEach((source, i) => {
            this.sources[i] = this.audioCtx.createBufferSource(); // can we just use source instead of sources[i] ?
            this.sources[i].connect(masterGain).connect(this.audioCtx.destination);
        })
        this.loadSong();
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
    
    loadBuffer = async (response, trackIndex) => {
        try { this.sources[trackIndex].stop(0); } catch {};
        this.sources[trackIndex].disconnect();
        delete this.sources[trackIndex];
        delete this.sourceGains[trackIndex];
        this.sourceGains[trackIndex] = this.audioCtx.createGain();
        this.sourceGains[trackIndex].gain.value = 1;
        this.sources[trackIndex] = this.audioCtx.createBufferSource();
        let buffer = await this.audioCtx.decodeAudioData(response);
        //if (!buffer) { console.log('Error decoding file data: ' + url); // where is url coming from?
        if (!buffer) {
            console.log('Error decoding file data.');
        } else {
            this.sources[trackIndex] = this.audioCtx.createBufferSource();
            this.sources[trackIndex].buffer = buffer;
            this.tracksReady[trackIndex] = true;
        }
        this.sources[trackIndex].connect(sourceGains[i]).connect(masterGain).connect(audioCtx.destination);
        this.sources[trackIndex].addEventListener('ended', this.#onEnded);
    }
    
    loadSong = () => {
        this.requests.forEach((request) => { request.abort(); });
        this.requests = [];
        this.tracksReady = [false, false, false, false];
        let song = playlist[this.songIndex].tracks;
        for (var i=0; i<4; i++) {
            let request = new XMLHttpRequest();
            this.requests.push(request);
            request.open("GET", song[i], true);
            request.responseType = "arraybuffer";
            (function (contextCopy) {
                request.onprogress = (prog) => {
                    this.progressPercents[contextCopy] = (prog.loaded / prog.total);
                    $('loading').style.width = 100 * this.progressPercents.reduce((sum, next) => {return sum + next}, 0) / 4 + "%";
                }
                request.onload = () => {this.loadBuffer(request.response, contextCopy)};
            }(i));
            request.send();
        }
        if (bpm) {
            bpm = playlist[this.songIndex].bpm || 120;
            beatDuration = 60/bpm*1000;
        }
    }

    playAudio() {
        $("loading").style.width = "0%";
        $("loading").style.display = "block";
            setTimeout(() => {
                if (this.tracksReady.indexOf(false) === -1) {
                    // check if context is in suspended state (autoplay policy)
                    if (this.audioCtx.state === 'suspended') {
                        this.audioCtx.resume();
                        this.nowPlaying = true;
                    } else {
                        this.audioCtx.suspend();
                        this.audioCtx.resume();
                        try {
                            this.sources.forEach((source) => {source.start()});
                            this.nowPlaying = true;
                        } catch (err) {
                            console.log('Failed to play...' + err);
                        }
                        this.trackStartTime = this.audioCtx.currentTime;
                    }
                    $("loading").style.display = "none";
                    this.progressPercents = [0, 0, 0, 0];
                } else {
                    this.playAudio();
                }
            }, 100)
    }
    
    pauseAudio = () => {
        this.audioCtx.suspend();
        this.nowPlaying = false;
    }
    
    togglePlayback = () => {
        if (this.nowPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }
}

let audio = new Audio();
