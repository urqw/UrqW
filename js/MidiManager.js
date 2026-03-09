import { WorkletSynthesizer, Sequencer } from "spessasynth_lib";
window.urqwMidi = {
    synth: null,
    sequencer: null,
    audioCtx: null,
    isReady: false,
    currentUrl: null,
    currentBlobUrl: null,

    init: async function() {
        if (this.isReady) return;
        var self = this;
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioClass();
        await this.audioCtx.audioWorklet.addModule('js/spessasynth_processor.min.js');
        const sf2Res = await fetch('default.sf2');
        const sf2Buffer = await sf2Res.arrayBuffer();
        this.synth = new WorkletSynthesizer(this.audioCtx);
        this.synth.connect(this.audioCtx.destination);
        await this.synth.soundBankManager.addSoundBank(sf2Buffer, 'default');
        this.sequencer = new Sequencer(this.synth);
        this.isReady = true;
    },

    play: async function(url, loop) {
        if (!url || url.includes('undefined')) return;
        await this.init();
        if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
        this.currentUrl = url;
        try {
            const res = await fetch(url);
            const buffer = await res.arrayBuffer();
            const view = new DataView(buffer);
            const isTrueMidi = (buffer.byteLength > 4 && view.getUint32(0, false) === 0x4D546864);            
            if (isTrueMidi) {
                if (window.gameMusic) { window.gameMusic.pause(); window.gameMusic.src = ""; }
                this.sequencer.pause();
                var currentVol = (Number(window.settings['volume']) / 100) * (window.volumeMultiplier || 1);
                this.setVolume(currentVol);
                this.sequencer.loadNewSongList([{
                    binary: buffer,
                    fileName: "track.mid"
                }]);
                this.sequencer.loopCount = (loop !== false) ? 9999 : 0;
                this.sequencer.play();
            } else {                
                if (this.sequencer) this.sequencer.pause();
                if (this.currentBlobUrl) URL.revokeObjectURL(this.currentBlobUrl);
                const blob = new Blob([buffer]);
                this.currentBlobUrl = URL.createObjectURL(blob);
                if (window.gameMusic) {
                    window.gameMusic.src = this.currentBlobUrl;
                    window.gameMusic.loop = (loop !== false);
                    var p = window.gameMusic.play();
                    if (p && p.catch) p.catch(e => {});
                }
            }
        } catch (e) {
            this.currentUrl = null;
        }
    },

    stop: function() {
        this.currentUrl = null;
        if (this.sequencer) {
            try { this.sequencer.pause(); } catch(e) {}
        }
        if (this.synth) {
            try { this.synth.stopAll(true); } catch(e) {}
        }
    },

    setVolume: function(val) {
        if (this.synth) this.synth.setMasterParameter("masterGain", val);
    }
};