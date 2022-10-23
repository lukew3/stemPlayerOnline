const stemPolywadConfig = {
    audioMeter: {
        clipLevel: .98, // the level (0 to 1) that you would consider "clipping".
        averaging: .95, // how "smoothed" you would like the meter to be over time. Should be between 0 and less than 1.
        clipLag: 750, // how long you would like the "clipping" indicator to show after clipping has occured, in milliseconds.
    },
}

class Audio {
    constructor() {
        this.songIndex = 1; // Rename songIndex to playlistIndex or songIndexInPlaylist or similar?
        this.nowPlaying = false;
        this.paused = false;
        this.wholeMaxVolume = 8;

        this.loadProgress = 0; // Out of 400
        this.checkLoadTimeout;
        this.playAfterLoaded = false;
        
        this.playbackRate = 1;
        this.inReverse = false;
        this.bpm = 120;
        this.beatDuration = 60/this.bpm*1000; // Milliseconds per beat

        this.loadStartTime;

        let tracks = playlist[this.songIndex].tracks
        this.wads = [
            new Wad({source: tracks[0]}),
            new Wad({source: tracks[1]}),
            new Wad({source: tracks[2]}),
            new Wad({source: tracks[3]})
        ];
        this.reversedWads = [null, null, null, null];
        // stemPolywads necessary for analyzing audioMeter
        this.stemPolywads = [
            new Wad.Poly(stemPolywadConfig),
            new Wad.Poly(stemPolywadConfig),
            new Wad.Poly(stemPolywadConfig),
            new Wad.Poly(stemPolywadConfig)
        ]
        this.wads.forEach((wad, i) => {
            this.stemPolywads[i].add(wad);
        });
        // Previously used a single polywad for all stems, but this caused the audioMeter to not work
        // this.polywad = new Wad.Poly(stemPolywadConfig);
        // this.stemPolywads.forEach((stemPolywad) => { this.polywad.add(stemPolywad) });
        this.sampleVolumes();
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


    setPlaybackDirection = (setReversed) => {
        if (setReversed && !this.inReverse) {
            let reversedOffset = this.wads[0].duration/1000 - (Wad.audioContext.currentTime - this.wads[0].lastPlayedTime);
            console.log(reversedOffset);
            this.stemPolywads.forEach((stemPolywad, i) => {
                stemPolywad.stop();
                stemPolywad.remove(this.wads[i]);
                stemPolywad.add(this.reversedWads[i]);
                if (this.nowPlaying) stemPolywad.play({offset: reversedOffset});
            });
            this.inReverse = true;
        } else if (!setReversed && this.inReverse) {
            let reversedOffset = this.reversedWads[0].duration/1000 - (Wad.audioContext.currentTime - this.reversedWads[0].lastPlayedTime);
            this.stemPolywads.forEach((stemPolywad, i) => {
                stemPolywad.stop();
                stemPolywad.remove(this.reversedWads[i]);
                stemPolywad.add(this.wads[i]);
                if (this.nowPlaying) stemPolywad.play({offset: reversedOffset});
            });
            this.inReverse = false;
        }
    }

    incrementPolyVolume = () => {
        if (this.wholeMaxVolume != 8) {
			this.wholeMaxVolume++;
            this.stemPolywads.forEach((stemPolywad) => { stemPolywad.setVolume(this.wholeMaxVolume/8) });
			// this.polywad.setVolume(this.wholeMaxVolume/8);
		}
    }

    decrementPolyVolume = () => {
        if (this.wholeMaxVolume != 0) {
			this.wholeMaxVolume--;
            this.stemPolywads.forEach((stemPolywad) => { stemPolywad.setVolume(this.wholeMaxVolume/8) });
		}
    }

    generateReversedWads = () => {
        this.wads.forEach((wad, i) => {this.reversedWads[i] = new Wad({source: wad.decodedBuffer})})
        this.reversedWads.forEach((reversedWad) => reversedWad.reverse());
    }

    checkLoadProgress = () => {
        this.loadProgress = 0;
        this.wads.forEach((wad) => {this.loadProgress += wad.playable*100});
        $("loading").value = this.loadProgress;
        $("loadingLabel").innerHTML = this.loadProgress/4 + "%";
        if (this.loadProgress < 400) {
            this.checkLoadTimeout = setTimeout(this.checkLoadProgress, 100);
        } else {
            // Without a timeout, generating reversed wads adds ~10 seconds to load time
            // TODO: This should probably be done using async, but this works as well
            setTimeout(() => this.generateReversedWads(), 1);
            if (this.playAfterLoaded) {
                this.playAfterLoaded = false;
                this.playAudio();
                console.log("Time to load: " + (((new Date()) - this.loadStartTime)/1000) + " seconds");
            }
            // Hide loading bar after a short delay
            setTimeout(() => {
                $("loadingLabel").innerHTML = '';
                $("loading").value = 0;
            }, 500);
        }
    }
    
    loadSong = () => {
        console.log("loaded song");
        Wad.stopAll();
        this.wads.forEach((wad, i) => { this.stemPolywads[i].remove(wad) });
        let nextTracks = playlist[this.songIndex].tracks;
        nextTracks.forEach((track, i) => {
            this.wads[i] = new Wad({source: track});
            this.stemPolywads[i].add(this.wads[i]);
        })
        if (this.bpm) {
            this.bpm = playlist[this.songIndex].bpm || 120;
            this.beatDuration = 60/this.bpm*1000;
        }
        this.playbackRate = 1;
        loop.speedDotIndex = 5;
        this.loadStartTime = new Date();
        this.checkLoadProgress();
    }

    sampleVolumes = () => {
        setTimeout(() => {
            if (!loop.inLoopMode) { // loop is loaded after audio; shouldn't be calling loop from audio
                audio.stemPolywads.forEach((polywad, i) => {
                    if (polywad.audioMeter.volume > 0.01) {
                        lights.flashSlider(i);
                    }
                });
            }
            this.sampleVolumes();
        }, 50);
    }

    playAudio() {
        if (this.loadProgress != 400) {
            this.playAfterLoaded = true;
            return;
        }
        if (this.paused) {
            this.wads.forEach((wad) => { this.paused ? wad.unpause() : wad.play() });
            this.wads.forEach((wad) => {wad.setRate(audio.playbackRate)});
        } else {
            this.stemPolywads.forEach((stemPolywad) => {stemPolywad.play()});
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
