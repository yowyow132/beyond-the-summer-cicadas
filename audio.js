/**
 * 《夏末蟬鳴的彼岸》（Beyond the Summer Cicadas）
 * 純 Web Audio API 程式合成音樂與音效引擎（嚴格對齊 AUDIO_SPEC.md）
 */
(function (global) {
  'use strict';

  const META_STORAGE_KEY = 'cicada_vn_meta_v1';

  const BGM_FILES = {
    title_breeze: 'assets/bgm_title_breeze.mp3',
    summer_day: 'assets/bgm_summer_day.mp3',
    twilight_memory: 'assets/bgm_twilight_memory.mp3',
    tension_secret: 'assets/bgm_tension_secret.mp3',
    climax_choice: 'assets/bgm_climax_choice.mp3'
  };

  const NOTE_INDEX = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
    'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, 'B#': 12
  };

  function noteToFreq(note) {
    if (typeof note === 'number') return note;
    const match = /^([A-G][#b]?)(-?\d)$/.exec(note);
    if (!match) return 440;
    const semitone = NOTE_INDEX[match[1]];
    const octave = parseInt(match[2], 10);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function createPinkNoiseBuffer(ctx, durationSec) {
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  function createReverbImpulse(ctx, durationSec) {
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, 2.8) * Math.exp(-3.2 * t);
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.08;
        b1 = 0.95 * b1 + white * 0.12;
        b2 = 0.85 * b2 + white * 0.16;
        data[i] = (b0 + b1 + b2) * 0.28 * env;
      }
    }
    return buffer;
  }

  const BGM_SCORES = {
    // -------------------------------------------------------------------------
    // 3.1 title_breeze: 76 BPM, 4/4, 8 bars, D Major
    // -------------------------------------------------------------------------
    title_breeze: {
      bpm: 76,
      beatsPerBar: 4,
      bars: 8,
      padGain: 0.16,
      padCutoff: 1150,
      chords: [
        ['D3', 'A3', 'E4', 'F#4'],
        ['C#3', 'A3', 'E4', 'A4'],
        ['B2', 'F#3', 'A3', 'D4'],
        ['G2', 'D3', 'F#3', 'B3'],
        ['F#2', 'D3', 'A3', 'E4'],
        ['E2', 'B2', 'D3', 'G3'],
        ['A2', 'E3', 'A3', 'D4'],
        ['A2', 'E3', 'G3', 'C#4']
      ],
      melody: [
        // Bar 1
        [0, 'F#5', 1.5, 0.56], [1.5, 'A5', 0.5, 0.52], [2, 'E5', 1.5, 0.58],
        // Bar 2
        [4, 'C#5', 2.0, 0.55], [6, 'E5', 1.0, 0.52], [7, 'A4', 1.0, 0.48],
        // Bar 3
        [8, 'D5', 1.5, 0.58], [9.5, 'F#5', 0.5, 0.54], [10, 'A4', 2.0, 0.50],
        // Bar 4
        [12, 'B4', 1.5, 0.55], [13.5, 'D5', 1.5, 0.58], [15, 'F#5', 1.0, 0.62],
        // Bar 5
        [16, 'E5', 1.5, 0.60], [17.5, 'D5', 0.5, 0.52], [18, 'A4', 2.0, 0.50],
        // Bar 6
        [20, 'G4', 1.0, 0.52], [21, 'B4', 1.0, 0.54], [22, 'D5', 1.5, 0.58], [23.5, 'E5', 0.5, 0.54],
        // Bar 7
        [24, 'D5', 2.0, 0.56], [26, 'C#5', 1.0, 0.52], [27, 'A4', 1.0, 0.48],
        // Bar 8
        [28, 'E5', 2.5, 0.60], [30.5, 'F#5', 0.5, 0.56], [31, 'A5', 1.0, 0.64]
      ],
      musicBox: [
        [2.5, 'A6', 1.2, 0.24],
        [10.5, 'F#6', 1.2, 0.24],
        [18.5, 'E6', 1.2, 0.23],
        [26.5, 'A6', 1.2, 0.25]
      ]
    },

    // -------------------------------------------------------------------------
    // 3.2 summer_day: 88 BPM, 4/4, 8 bars, G Major
    // -------------------------------------------------------------------------
    summer_day: {
      bpm: 88,
      beatsPerBar: 4,
      bars: 8,
      chords: [
        ['G2', 'D3', 'F#3', 'B3'],
        ['F#2', 'D3', 'A3', 'D4'],
        ['E2', 'B2', 'D3', 'G3'],
        ['B2', 'F#3', 'A3', 'D4'],
        ['C3', 'G3', 'B3', 'E4'],
        ['B2', 'G3', 'D4'],
        ['A2', 'E3', 'G3', 'C4'],
        ['D3', 'G3', 'A3', 'C4']
      ],
      bar8SplitChord: ['D3', 'F#3', 'A3', 'C4'],
      melody: [
        // Bar 1
        [0, 'B4', 1.0, 0.58], [1, 'D5', 0.5, 0.54], [1.5, 'G5', 1.5, 0.64], [3, 'F#5', 1.0, 0.58],
        // Bar 2
        [4, 'D5', 2.0, 0.60], [6, 'A4', 1.0, 0.52], [7, 'B4', 1.0, 0.55],
        // Bar 3
        [8, 'G4', 1.5, 0.56], [9.5, 'B4', 0.5, 0.52], [10, 'E5', 1.0, 0.60], [11, 'D5', 1.0, 0.55],
        // Bar 4
        [12, 'B4', 2.5, 0.58], [14.5, 'A4', 1.5, 0.52],
        // Bar 5
        [16, 'G4', 1.0, 0.56], [17, 'A4', 0.5, 0.54], [17.5, 'B4', 1.5, 0.58], [19, 'E5', 1.0, 0.62],
        // Bar 6
        [20, 'D5', 2.0, 0.60], [22, 'B4', 1.0, 0.54], [23, 'G4', 1.0, 0.50],
        // Bar 7
        [24, 'C5', 1.5, 0.58], [25.5, 'B4', 0.5, 0.52], [26, 'A4', 1.0, 0.54], [27, 'G4', 1.0, 0.50],
        // Bar 8
        [28, 'A4', 2.5, 0.56], [30.5, 'B4', 0.5, 0.54], [31, 'D5', 1.0, 0.60]
      ],
      bassRoots: ['G2', 'F#2', 'E2', 'B2', 'C3', 'B2', 'A2', 'D2']
    },

    // -------------------------------------------------------------------------
    // 3.3 twilight_memory: 68 BPM, 3/4, 8 bars, E Minor
    // -------------------------------------------------------------------------
    twilight_memory: {
      bpm: 68,
      beatsPerBar: 3,
      bars: 8,
      padGain: 0.20,
      padCutoff: 1100,
      arpChords: [
        ['E2', 'B2', 'F#3', 'G3', 'D4'],
        ['C3', 'G3', 'B3', 'E4', 'G4'],
        ['A2', 'E3', 'G3', 'C4', 'E4'],
        ['B2', 'F#3', 'A3', 'D#4', 'F#4'],
        ['E2', 'B2', 'D3', 'G3', 'B3'],
        ['D3', 'A3', 'B3', 'F#4', 'A4'],
        ['C3', 'G3', 'B3', 'E4', 'G4'],
        ['B2', 'F#3', 'A3', 'D#4', 'F#4']
      ],
      melody: [
        // Bar 1 (0..3)
        [0, 'B4', 2.0, 0.60], [2, 'G4', 1.0, 0.54],
        // Bar 2 (3..6)
        [3, 'E5', 1.5, 0.64], [4.5, 'D5', 0.5, 0.56], [5, 'B4', 1.0, 0.58],
        // Bar 3 (6..9)
        [6, 'C5', 2.0, 0.62], [8, 'B4', 1.0, 0.56],
        // Bar 4 (9..12)
        [9, 'A4', 2.0, 0.58], [11, 'F#4', 1.0, 0.54],
        // Bar 5 (12..15)
        [12, 'G4', 1.5, 0.56], [13.5, 'A4', 0.5, 0.54], [14, 'B4', 1.0, 0.58],
        // Bar 6 (15..18)
        [15, 'F#5', 1.5, 0.66], [16.5, 'E5', 0.5, 0.58], [17, 'D5', 1.0, 0.60],
        // Bar 7 (18..21)
        [18, 'E5', 2.0, 0.64], [20, 'B4', 1.0, 0.56],
        // Bar 8 (21..24)
        [21, 'B4', 2.0, 0.58], [23, 'D#5', 1.0, 0.62]
      ],
      musicBox: [
        [6, 'C6', 1.4, 0.22],
        [9, 'A5', 1.4, 0.22],
        [18, 'E6', 1.4, 0.22],
        [21, 'B5', 1.4, 0.22]
      ]
    },

    // -------------------------------------------------------------------------
    // 3.4 tension_secret: 62 BPM, 4/4, 8 bars, C# Minor / Phrygian
    // -------------------------------------------------------------------------
    tension_secret: {
      bpm: 62,
      beatsPerBar: 4,
      bars: 8,
      padGain: 0.22,
      padCutoff: 600,
      tremolo: true,
      chords: [
        ['C#2', 'G#2', 'D#3', 'E3'],
        ['B1', 'G#2', 'E3'],
        ['A1', 'E2', 'C#3', 'D#3'],
        ['G#1', 'D#2', 'C3'],
        ['C#2', 'G#2', 'E3'],
        ['C#2', 'A2', 'D3', 'F#3'],
        ['F#2', 'C#3', 'E3', 'A3'],
        ['G#1', 'D#2', 'F#2', 'A2']
      ],
      melody: [
        [0.5, 'G#4', 1.8, 0.44], [2.5, 'D#5', 1.5, 0.48],
        [5, 'E5', 1.8, 0.46], [7, 'C#5', 1.2, 0.42],
        [8, 'D#5', 1.8, 0.46], [10, 'C#5', 1.8, 0.44],
        [13.5, 'C5', 2.0, 0.45],
        [16.5, 'E4', 1.5, 0.38], [18, 'G#4', 1.8, 0.42],
        [20, 'A4', 2.0, 0.46], [22.5, 'D5', 1.6, 0.50],
        [25, 'C#5', 1.8, 0.45], [27, 'A4', 1.2, 0.40],
        [28, 'G#4', 2.0, 0.42], [30.5, 'A4', 1.5, 0.44]
      ]
    },

    // -------------------------------------------------------------------------
    // 3.5 climax_choice: 84 BPM, 4/4, 8 bars, F# Minor -> A Major
    // -------------------------------------------------------------------------
    climax_choice: {
      bpm: 84,
      beatsPerBar: 4,
      bars: 8,
      padGain: 0.28,
      chords: [
        ['D2', 'A2', 'F#3', 'C#4'],
        ['E2', 'B2', 'G#3', 'C#4'],
        ['C#2', 'G#2', 'E3', 'B3'],
        ['F#2', 'C#3', 'G#3', 'A3'],
        ['B2', 'F#3', 'A3', 'D4'],
        ['E2', 'B2', 'A3', 'D4'],
        ['A2', 'E3', 'G#3', 'C#4'],
        ['G#2', 'F3', 'B3', 'C#4']
      ],
      bassRoots: ['D2', 'E2', 'C#2', 'F#2', 'B1', 'E2', 'A1', 'G#1'],
      melody: [
        // Bar 1
        [0, 'C#5', 1.5, 0.72], [1.5, 'D5', 0.5, 0.68], [2, 'E5', 1.0, 0.74], [3, 'F#5', 1.0, 0.78],
        // Bar 2
        [4, 'E5', 2.0, 0.74], [6, 'B4', 1.0, 0.68], [7, 'C#5', 1.0, 0.72],
        // Bar 3
        [8, 'G#5', 1.5, 0.78], [9.5, 'F#5', 0.5, 0.72], [10, 'E5', 1.0, 0.74], [11, 'C#5', 1.0, 0.70],
        // Bar 4
        [12, 'A5', 2.5, 0.82], [14.5, 'G#5', 0.5, 0.74], [15, 'F#5', 1.0, 0.76],
        // Bar 5
        [16, 'F#5', 1.5, 0.76], [17.5, 'E5', 0.5, 0.70], [18, 'D5', 1.0, 0.72], [19, 'C#5', 1.0, 0.70],
        // Bar 6
        [20, 'E5', 2.0, 0.74], [22, 'D5', 1.0, 0.70], [23, 'B4', 1.0, 0.68],
        // Bar 7
        [24, 'A5', 1.5, 0.82], [25.5, 'G#5', 0.5, 0.74], [26, 'E5', 1.5, 0.76], [27.5, 'C#5', 0.5, 0.70],
        // Bar 8
        [28, 'G#5', 2.0, 0.78], [30, 'F#5', 1.0, 0.74], [31, 'F5', 1.0, 0.74]
      ]
    }
  };

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.unlocked = false;
      this.pendingBgmId = 'title_breeze';
      this.currentTrackId = null;
      this.activeFader = null;
      this.activeBufferSource = null;
      this.activeHtmlAudio = null;
      this.htmlFadeTimers = new Set();
      this.bgmBufferCache = {};
      this.bgmDecodePromises = {};
      this.playRequestToken = 0;
      this.schedulerTimer = null;
      this.schedulerState = null;

      // Audio graph buses
      this.masterMuteGain = null;
      this.masterCompressor = null;
      this.masterBgmGain = null;
      this.masterSfxGain = null;
      this.bgmPreGain = null;
      this.reverbSend = null;
      this.reverbWetGain = null;

      // Noise & Impulse buffers
      this.pinkNoiseBuffer = null;
      this.reverbBuffer = null;

      // Cicada ambience single-instance state
      this.cicadaInstance = null;

      // Throttling timestamps
      this.lastTypeTickMs = 0;
      this.lastHoverMs = 0;

      // Persistent audio preferences
      this.settings = {
        muted: false,
        bgmVolume: 0.7,
        sfxVolume: 0.8,
        cicadaEnabled: true
      };
      this.loadSettings();
      this._bindUnlockEvents();
    }

    loadSettings() {
      try {
        const raw = localStorage.getItem(META_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.audioSettings) {
            this.settings = Object.assign({}, this.settings, parsed.audioSettings);
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    saveSettings() {
      try {
        const raw = localStorage.getItem(META_STORAGE_KEY);
        const meta = raw ? JSON.parse(raw) : {};
        meta.audioSettings = Object.assign({}, this.settings);
        localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
      } catch (e) {
        // Ignore storage errors
      }
    }

    _bindUnlockEvents() {
      const handler = () => {
        this.unlock();
      };
      this._unlockHandler = handler;
      const opts = { capture: true, passive: true };
      window.addEventListener('pointerdown', handler, opts);
      window.addEventListener('keydown', handler, opts);
      window.addEventListener('touchstart', handler, opts);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.ctx && !this.settings.muted) {
          if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }

    _ensureGraph() {
      if (this.ctx) return true;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      const ctx = new AudioCtx();
      this.ctx = ctx;

      this.pinkNoiseBuffer = createPinkNoiseBuffer(ctx, 4.0);
      this.reverbBuffer = createReverbImpulse(ctx, 1.6);

      this.masterMuteGain = ctx.createGain();
      this.masterMuteGain.gain.value = this.settings.muted ? 0.0 : 1.0;
      this.masterMuteGain.connect(ctx.destination);

      this.masterCompressor = ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.value = -14;
      this.masterCompressor.knee.value = 18;
      this.masterCompressor.ratio.value = 4;
      this.masterCompressor.attack.value = 0.005;
      this.masterCompressor.release.value = 0.16;
      this.masterCompressor.connect(this.masterMuteGain);

      this.masterBgmGain = ctx.createGain();
      this.masterBgmGain.gain.value = this.settings.bgmVolume * this.settings.bgmVolume;
      this.masterBgmGain.connect(this.masterCompressor);

      this.masterSfxGain = ctx.createGain();
      this.masterSfxGain.gain.value = this.settings.sfxVolume * this.settings.sfxVolume;
      this.masterSfxGain.connect(this.masterCompressor);

      this.bgmPreGain = ctx.createGain();
      this.bgmPreGain.gain.value = 1.0;
      this.bgmPreGain.connect(this.masterBgmGain);

      // Algorithmic Convolver Reverb Send (22% BGM + variable SFX send)
      this.reverbSend = ctx.createGain();
      this.reverbSend.gain.value = 1.0;

      const convolver = ctx.createConvolver();
      convolver.buffer = this.reverbBuffer;

      const reverbLp = ctx.createBiquadFilter();
      reverbLp.type = 'lowpass';
      reverbLp.frequency.value = 2600;

      this.reverbWetGain = ctx.createGain();
      this.reverbWetGain.gain.value = 0.36;

      this.reverbSend.connect(convolver);
      convolver.connect(reverbLp);
      reverbLp.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.masterCompressor);

      const bgmToReverb = ctx.createGain();
      bgmToReverb.gain.value = 0.22;
      this.masterBgmGain.connect(bgmToReverb);
      bgmToReverb.connect(this.reverbSend);

      return true;
    }

    async unlock() {
      if (!this._ensureGraph()) return;
      const ctx = this.ctx;

      if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
        try {
          await ctx.resume();
        } catch (e) {
          // Will retry on next gesture
        }
      }

      if (!this.unlocked && ctx.state === 'running') {
        // 1-sample silent buffer unlock for iOS WebKit
        try {
          const silentBuf = ctx.createBuffer(1, 1, ctx.sampleRate);
          const src = ctx.createBufferSource();
          src.buffer = silentBuf;
          src.connect(ctx.destination);
          src.start(0);
        } catch (e) {}

        this.unlocked = true;
        const opts = { capture: true, passive: true };
        window.removeEventListener('pointerdown', this._unlockHandler, opts);
        window.removeEventListener('keydown', this._unlockHandler, opts);
        window.removeEventListener('touchstart', this._unlockHandler, opts);

        if (this.pendingBgmId) {
          const id = this.pendingBgmId;
          this.pendingBgmId = null;
          this.playBGM(id, 600);
        }
        this.preloadBGMTracks();
      }
    }

    _computeHtmlBgmVol() {
      if (this.settings.muted) return 0;
      const v = Math.max(0, Math.min(1, this.settings.bgmVolume));
      return v * v * 0.72;
    }

    _syncHtmlBgmVolume() {
      if (this.activeHtmlAudio) {
        this.activeHtmlAudio.volume = this._computeHtmlBgmVol();
      }
    }

    _loadBGMBuffer(trackId) {
      if (this.bgmBufferCache[trackId]) {
        return Promise.resolve(this.bgmBufferCache[trackId]);
      }
      if (this.bgmDecodePromises[trackId]) {
        return this.bgmDecodePromises[trackId];
      }
      const url = BGM_FILES[trackId];
      if (!url || !this.ctx || typeof fetch !== 'function' || window.location.protocol === 'file:') {
        return Promise.reject(new Error('No fetch decode support'));
      }
      const p = fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then((buf) => this.ctx.decodeAudioData(buf))
        .then((decoded) => {
          this.bgmBufferCache[trackId] = decoded;
          return decoded;
        })
        .catch((err) => {
          delete this.bgmDecodePromises[trackId];
          throw err;
        });
      this.bgmDecodePromises[trackId] = p;
      return p;
    }

    preloadBGMTracks() {
      if (!this.ctx || window.location.protocol === 'file:') return;
      Object.keys(BGM_FILES).forEach((id) => {
        this._loadBGMBuffer(id).catch(() => {});
      });
    }

    setAudioSettings(partial) {
      this.settings = Object.assign({}, this.settings, partial);
      this.saveSettings();

      if (this.ctx) {
        const now = this.ctx.currentTime;
        if (typeof partial.muted === 'boolean' && this.masterMuteGain) {
          this.masterMuteGain.gain.cancelScheduledValues(now);
          this.masterMuteGain.gain.setValueAtTime(this.masterMuteGain.gain.value, now);
          this.masterMuteGain.gain.linearRampToValueAtTime(
            partial.muted ? 0.0 : 1.0,
            now + (partial.muted ? 0.025 : 0.04)
          );
        }
        if (typeof partial.bgmVolume === 'number' && this.masterBgmGain) {
          const v = Math.max(0, Math.min(1, partial.bgmVolume));
          this.masterBgmGain.gain.setTargetAtTime(v * v, now, 0.02);
        }
        if (typeof partial.sfxVolume === 'number' && this.masterSfxGain) {
          const v = Math.max(0, Math.min(1, partial.sfxVolume));
          this.masterSfxGain.gain.setTargetAtTime(v * v, now, 0.02);
        }
        if (typeof partial.cicadaEnabled === 'boolean' && !partial.cicadaEnabled) {
          this.stopAmbience(600);
        }
      }
      this._syncHtmlBgmVolume();
    }

    getAudioSettings() {
      return Object.assign({}, this.settings);
    }

    // =========================================================================
    // Instrument Voices (AUDIO_SPEC.md §2)
    // =========================================================================
    _playFeltPiano(dest, time, freq, durSec, velocity) {
      const ctx = this.ctx;
      const t = Math.max(ctx.currentTime, time + (Math.random() * 0.012 - 0.006));
      const vel = Math.max(0.08, Math.min(1.0, velocity * (0.92 + Math.random() * 0.16)));

      const outGain = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1100 + vel * 1900, t);
      lp.Q.value = 0.8;

      const oscMain = ctx.createOscillator();
      oscMain.type = 'triangle';
      oscMain.frequency.setValueAtTime(freq, t);

      const gMain = ctx.createGain();
      gMain.gain.value = 0.75;

      const oscOct = ctx.createOscillator();
      oscOct.type = 'sine';
      oscOct.frequency.setValueAtTime(freq * 2, t);

      const gOct = ctx.createGain();
      gOct.gain.value = 0.18;

      const oscSub = ctx.createOscillator();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.5, t);

      const gSub = ctx.createGain();
      gSub.gain.value = 0.12;

      // Hammer thud (12ms bandpass noise)
      const hammerSrc = ctx.createBufferSource();
      hammerSrc.buffer = this.pinkNoiseBuffer;
      const hammerBp = ctx.createBiquadFilter();
      hammerBp.type = 'bandpass';
      hammerBp.frequency.value = 900;
      hammerBp.Q.value = 1.6;
      const hammerGain = ctx.createGain();
      hammerGain.gain.setValueAtTime(0.0001, t);
      hammerGain.gain.linearRampToValueAtTime(0.03 * vel, t + 0.003);
      hammerGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
      hammerSrc.connect(hammerBp);
      hammerBp.connect(hammerGain);
      hammerGain.connect(lp);

      oscMain.connect(gMain); gMain.connect(lp);
      oscOct.connect(gOct); gOct.connect(lp);
      oscSub.connect(gSub); gSub.connect(lp);

      const peak = 0.16 * vel;
      const sustain = peak * 0.22;
      const holdEnd = t + Math.max(0.08, durSec);
      const releaseEnd = holdEnd + 0.85;

      outGain.gain.setValueAtTime(0.0001, t);
      outGain.gain.linearRampToValueAtTime(peak, t + 0.008);
      outGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + 0.35);
      outGain.gain.setValueAtTime(Math.max(0.0001, sustain), holdEnd);
      outGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      lp.connect(outGain);
      outGain.connect(dest);

      oscMain.start(t);
      oscOct.start(t);
      oscSub.start(t);
      hammerSrc.start(t, Math.random() * 2.0, 0.025);

      const stopTime = releaseEnd + 0.02;
      oscMain.stop(stopTime);
      oscOct.stop(stopTime);
      oscSub.stop(stopTime);
    }

    _playMusicBox(dest, time, freq, durSec, velocity) {
      const ctx = this.ctx;
      const t = Math.max(ctx.currentTime, time + (Math.random() * 0.008 - 0.004));
      const vel = Math.max(0.05, Math.min(1.0, velocity));

      const outGain = ctx.createGain();
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);
      const g1 = ctx.createGain();
      g1.gain.value = 0.85;

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 3.0, t);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.12, t);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 5.4, t);
      const g3 = ctx.createGain();
      g3.gain.setValueAtTime(0.04, t);
      g3.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

      osc1.connect(g1); g1.connect(outGain);
      osc2.connect(g2); g2.connect(outGain);
      osc3.connect(g3); g3.connect(outGain);

      const peak = 0.15 * vel;
      const releaseEnd = t + Math.max(0.45, durSec) + 0.4;
      outGain.gain.setValueAtTime(0.0001, t);
      outGain.gain.linearRampToValueAtTime(peak, t + 0.005);
      outGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      outGain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);
      const stopTime = releaseEnd + 0.02;
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      osc3.stop(stopTime);
    }

    _playWarmRhodes(dest, time, freq, durSec, velocity) {
      const ctx = this.ctx;
      const t = Math.max(ctx.currentTime, time);
      const vel = Math.max(0.05, Math.min(1.0, velocity));

      const outGain = ctx.createGain();

      // Carrier sine + FM tine attack
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, t);

      const mod = ctx.createOscillator();
      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 2.0, t);
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(freq * 0.35, t);
      modGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      mod.connect(modGain);
      modGain.connect(carrier.frequency);

      const gCarrier = ctx.createGain();
      gCarrier.gain.value = 0.85;
      carrier.connect(gCarrier);
      gCarrier.connect(outGain);

      const tri = ctx.createOscillator();
      tri.type = 'triangle';
      tri.frequency.setValueAtTime(freq, t);
      const triLp = ctx.createBiquadFilter();
      triLp.type = 'lowpass';
      triLp.frequency.value = 1200;
      const gTri = ctx.createGain();
      gTri.gain.value = 0.15;
      tri.connect(triLp);
      triLp.connect(gTri);
      gTri.connect(outGain);

      const peak = 0.14 * vel;
      const sustain = peak * 0.45;
      const holdEnd = t + Math.max(0.2, durSec);
      const releaseEnd = holdEnd + 0.7;

      outGain.gain.setValueAtTime(0.0001, t);
      outGain.gain.linearRampToValueAtTime(peak, t + 0.012);
      outGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + 0.6);
      outGain.gain.setValueAtTime(Math.max(0.0001, sustain), holdEnd);
      outGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      outGain.connect(dest);

      carrier.start(t);
      mod.start(t);
      tri.start(t);
      const stopTime = releaseEnd + 0.02;
      carrier.stop(stopTime);
      mod.stop(stopTime);
      tri.stop(stopTime);
    }

    _playStringPad(dest, time, freqs, durSec, gainAmount, cutoffHz, withTremolo) {
      const ctx = this.ctx;
      const t = Math.max(ctx.currentTime, time);

      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(cutoffHz || 1100, t);
      filter1.Q.value = 0.7;

      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime((cutoffHz || 1100) * 1.1, t);
      filter2.Q.value = 0.7;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain);
      lfoGain.connect(filter1.frequency);

      const envGain = ctx.createGain();
      const peak = Math.max(0.01, gainAmount * 0.25);
      const holdEnd = t + Math.max(0.9, durSec);
      const releaseEnd = holdEnd + 1.1;

      envGain.gain.setValueAtTime(0.0001, t);
      envGain.gain.linearRampToValueAtTime(peak, t + 0.65);
      envGain.gain.setValueAtTime(peak * 0.85, holdEnd);
      envGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      filter1.connect(filter2);
      filter2.connect(envGain);

      if (withTremolo) {
        const tremGain = ctx.createGain();
        tremGain.gain.value = 0.92;
        const tremLfo = ctx.createOscillator();
        tremLfo.frequency.value = 3.8;
        const tremDepth = ctx.createGain();
        tremDepth.gain.value = 0.08;
        tremLfo.connect(tremDepth);
        tremDepth.connect(tremGain.gain);
        envGain.connect(tremGain);
        tremGain.connect(dest);
        tremLfo.start(t);
        tremLfo.stop(releaseEnd + 0.02);
      } else {
        envGain.connect(dest);
      }

      const stopTime = releaseEnd + 0.02;
      lfo.start(t);
      lfo.stop(stopTime);

      freqs.forEach((f) => {
        const oscA = ctx.createOscillator();
        oscA.type = 'sawtooth';
        oscA.frequency.setValueAtTime(f, t);
        oscA.detune.value = -7;

        const oscB = ctx.createOscillator();
        oscB.type = 'sawtooth';
        oscB.frequency.setValueAtTime(f, t);
        oscB.detune.value = 7;

        const oscC = ctx.createOscillator();
        oscC.type = 'triangle';
        oscC.frequency.setValueAtTime(f, t);

        const g = ctx.createGain();
        g.gain.value = 0.28 / freqs.length;

        oscA.connect(g);
        oscB.connect(g);
        oscC.connect(g);
        g.connect(filter1);

        oscA.start(t);
        oscB.start(t);
        oscC.start(t);
        oscA.stop(stopTime);
        oscB.stop(stopTime);
        oscC.stop(stopTime);
      });
    }

    _playSoftBass(dest, time, freq, durSec, velocity) {
      const ctx = this.ctx;
      const t = Math.max(ctx.currentTime, time);
      const vel = Math.max(0.05, Math.min(1.0, velocity));

      const outGain = ctx.createGain();
      const oscSin = ctx.createOscillator();
      oscSin.type = 'sine';
      oscSin.frequency.setValueAtTime(freq, t);
      const gSin = ctx.createGain();
      gSin.gain.value = 0.85;

      const oscTri = ctx.createOscillator();
      oscTri.type = 'triangle';
      oscTri.frequency.setValueAtTime(freq, t);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 280;
      const gTri = ctx.createGain();
      gTri.gain.value = 0.25;

      oscSin.connect(gSin); gSin.connect(outGain);
      oscTri.connect(lp); lp.connect(gTri); gTri.connect(outGain);

      const peak = 0.22 * vel;
      const sustain = peak * 0.6;
      const holdEnd = t + Math.max(0.2, durSec);
      const releaseEnd = holdEnd + 0.5;

      outGain.gain.setValueAtTime(0.0001, t);
      outGain.gain.linearRampToValueAtTime(peak, t + 0.03);
      outGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + 0.4);
      outGain.gain.setValueAtTime(Math.max(0.0001, sustain), holdEnd);
      outGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      outGain.connect(dest);

      oscSin.start(t);
      oscTri.start(t);
      const stopTime = releaseEnd + 0.02;
      oscSin.stop(stopTime);
      oscTri.stop(stopTime);
    }

    // =========================================================================
    // Studio BGM Player & Crossfades (with Web Audio gapless loop + fallbacks)
    // =========================================================================
    _fadeOutCurrentBGM(fadeMs) {
      const ctx = this.ctx;
      const now = ctx ? ctx.currentTime : 0;
      const fadeSec = Math.max(0.05, fadeMs / 1000);

      if (this.schedulerTimer !== null) {
        clearInterval(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      this.schedulerState = null;

      if (this.activeFader && ctx) {
        const oldFader = this.activeFader;
        const oldSource = this.activeBufferSource;
        this.activeFader = null;
        this.activeBufferSource = null;
        oldFader.gain.cancelScheduledValues(now);
        oldFader.gain.setValueAtTime(oldFader.gain.value, now);
        oldFader.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
        setTimeout(() => {
          if (oldSource) {
            try { oldSource.stop(); } catch (e) {}
            try { oldSource.disconnect(); } catch (e) {}
          }
          try { oldFader.disconnect(); } catch (e) {}
        }, fadeMs + 160);
      }

      if (this.activeHtmlAudio) {
        const oldAudio = this.activeHtmlAudio;
        this.activeHtmlAudio = null;
        const startVol = oldAudio.volume;
        const steps = Math.max(4, Math.floor(fadeMs / 40));
        let step = 0;
        const timer = setInterval(() => {
          step++;
          oldAudio.volume = Math.max(0, startVol * (1 - step / steps));
          if (step >= steps) {
            clearInterval(timer);
            this.htmlFadeTimers.delete(timer);
            try { oldAudio.pause(); oldAudio.src = ''; } catch (e) {}
          }
        }, 40);
        this.htmlFadeTimers.add(timer);
      }
    }

    _startSynthScheduler(trackId, fadeMs) {
      if (!BGM_SCORES[trackId] || !this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const fadeSec = Math.max(0.05, fadeMs / 1000);

      this._fadeOutCurrentBGM(fadeMs);

      const newFader = ctx.createGain();
      newFader.gain.setValueAtTime(0.0001, now);
      newFader.gain.linearRampToValueAtTime(1.0, now + fadeSec);
      newFader.connect(this.bgmPreGain);

      this.activeFader = newFader;
      const score = BGM_SCORES[trackId];
      const stepBeats = 0.5;
      const totalSteps = score.bars * score.beatsPerBar * 2;
      const secPerBeat = 60 / score.bpm;

      const state = {
        trackId: trackId,
        score: score,
        fader: newFader,
        stepIndex: 0,
        totalSteps: totalSteps,
        stepBeats: stepBeats,
        secPerBeat: secPerBeat,
        nextStepTime: now + 0.04
      };
      this.schedulerState = state;

      const lookaheadSec = 0.14;
      this.schedulerTimer = setInterval(() => {
        if (!this.ctx || this.schedulerState !== state) return;
        const cur = this.ctx.currentTime;
        while (state.nextStepTime < cur + lookaheadSec) {
          this._scheduleScoreStep(state, state.stepIndex, state.nextStepTime);
          state.nextStepTime += state.stepBeats * state.secPerBeat;
          state.stepIndex = (state.stepIndex + 1) % state.totalSteps;
        }
      }, 30);
    }

    _startHtmlAudioBGM(trackId, fadeMs) {
      const url = BGM_FILES[trackId];
      if (!url) {
        this._startSynthScheduler(trackId, fadeMs);
        return;
      }
      this._fadeOutCurrentBGM(fadeMs);

      const audioEl = new Audio(url);
      audioEl.loop = true;
      audioEl.volume = 0;
      this.activeHtmlAudio = audioEl;

      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (this.activeHtmlAudio === audioEl && this.currentTrackId === trackId) {
            this.activeHtmlAudio = null;
            this._startSynthScheduler(trackId, fadeMs);
          }
        });
      }

      const steps = Math.max(4, Math.floor(fadeMs / 40));
      let step = 0;
      const timer = setInterval(() => {
        if (this.activeHtmlAudio !== audioEl) {
          clearInterval(timer);
          this.htmlFadeTimers.delete(timer);
          return;
        }
        step++;
        const ratio = Math.min(1, step / steps);
        audioEl.volume = this._computeHtmlBgmVol() * ratio;
        if (step >= steps) {
          clearInterval(timer);
          this.htmlFadeTimers.delete(timer);
        }
      }, 40);
      this.htmlFadeTimers.add(timer);
    }

    playBGM(trackId, fadeMs = 1000) {
      if (!BGM_SCORES[trackId] && !BGM_FILES[trackId]) return;

      // Auto-fade out cicada ambience when transitioning into deep/night tension
      if (trackId === 'tension_secret' || trackId === 'climax_choice') {
        this.stopAmbience(1200);
      }

      if (!this.unlocked || !this.ctx) {
        this.pendingBgmId = trackId;
        return;
      }

      // Idempotency: if already playing same track, keep phase seamless
      if (
        this.currentTrackId === trackId &&
        (this.activeBufferSource || this.activeHtmlAudio || this.schedulerTimer !== null)
      ) {
        return;
      }

      this.currentTrackId = trackId;
      const reqToken = ++this.playRequestToken;

      if (window.location.protocol === 'file:' || !BGM_FILES[trackId]) {
        this._startHtmlAudioBGM(trackId, fadeMs);
        return;
      }

      this._loadBGMBuffer(trackId)
        .then((buffer) => {
          if (!this.ctx || reqToken !== this.playRequestToken || this.currentTrackId !== trackId) {
            return;
          }
          const ctx = this.ctx;
          const now = ctx.currentTime;
          const fadeSec = Math.max(0.05, fadeMs / 1000);

          this._fadeOutCurrentBGM(fadeMs);

          const newFader = ctx.createGain();
          newFader.gain.setValueAtTime(0.0001, now);
          newFader.gain.linearRampToValueAtTime(1.0, now + fadeSec);
          newFader.connect(this.bgmPreGain);

          const src = ctx.createBufferSource();
          src.buffer = buffer;
          src.loop = true;
          src.connect(newFader);
          src.start(now + 0.02);

          this.activeFader = newFader;
          this.activeBufferSource = src;
        })
        .catch(() => {
          if (!this.ctx || reqToken !== this.playRequestToken || this.currentTrackId !== trackId) {
            return;
          }
          this._startHtmlAudioBGM(trackId, fadeMs);
        });
    }

    stopBGM(fadeMs = 800) {
      this.pendingBgmId = null;
      this.playRequestToken++;
      this.currentTrackId = null;
      this._fadeOutCurrentBGM(fadeMs);
    }

    _scheduleScoreStep(state, stepIdx, time) {
      const score = state.score;
      const fader = state.fader;
      const spb = state.secPerBeat;
      const currentBeat = stepIdx * state.stepBeats;
      const barBeats = score.beatsPerBar;
      const barIndex = Math.floor(currentBeat / barBeats);
      const beatInBar = currentBeat % barBeats;

      // 1. Melody notes scheduled on this 0.5-beat slot
      if (score.melody) {
        for (let i = 0; i < score.melody.length; i++) {
          const [mBeat, note, durBeats, vel] = score.melody[i];
          if (Math.abs(mBeat - currentBeat) < 0.01) {
            const freq = noteToFreq(note);
            this._playFeltPiano(fader, time, freq, durBeats * spb * 0.9, vel);
            if (state.trackId === 'climax_choice' && beatInBar === 0) {
              this._playFeltPiano(fader, time, freq * 0.5, durBeats * spb * 0.85, vel * 0.65);
            }
          }
        }
      }

      // 2. MusicBox accents
      if (score.musicBox) {
        for (let i = 0; i < score.musicBox.length; i++) {
          const [mBeat, note, durBeats, vel] = score.musicBox[i];
          if (Math.abs(mBeat - currentBeat) < 0.01) {
            this._playMusicBox(fader, time, noteToFreq(note), durBeats * spb, vel);
          }
        }
      }

      // 3. Track-specific accompaniment
      if (state.trackId === 'title_breeze') {
        if (Math.abs(beatInBar) < 0.01) {
          const chord = score.chords[barIndex];
          this._playStringPad(fader, time, chord.slice(1).map(noteToFreq), barBeats * spb * 0.95, score.padGain, score.padCutoff, false);
          // Gentle rolled arpeggio on Bar start
          chord.forEach((n, idx) => {
            this._playFeltPiano(fader, time + idx * 0.09, noteToFreq(n), 1.6 * spb, 0.34);
          });
        }
      } else if (state.trackId === 'summer_day') {
        if (Math.abs(beatInBar) < 0.01) {
          const chord = score.chords[barIndex];
          chord.forEach((n, idx) => {
            this._playWarmRhodes(fader, time + idx * 0.025, noteToFreq(n), 1.6 * spb, 0.38);
          });
          this._playSoftBass(fader, time, noteToFreq(score.bassRoots[barIndex]), 2.2 * spb, 0.42);
        } else if (Math.abs(beatInBar - 2.5) < 0.01) {
          const chord = (barIndex === 7 && score.bar8SplitChord) ? score.bar8SplitChord : score.chords[barIndex];
          chord.slice(1, 3).forEach((n, idx) => {
            this._playWarmRhodes(fader, time + idx * 0.02, noteToFreq(n), 0.9 * spb, 0.30);
          });
          if (barIndex === 3 || barIndex === 7) {
            this._playSoftBass(fader, time, noteToFreq(score.bassRoots[barIndex]) * 1.5, 0.7 * spb, 0.34);
          }
        }
      } else if (state.trackId === 'twilight_memory') {
        const arp = score.arpChords[barIndex];
        const arpMap = [0, 1, 2, 3, 2, 1];
        const subIdx = Math.round(beatInBar * 2) % 6;
        const arpNote = arp[arpMap[subIdx] % arp.length];
        this._playFeltPiano(fader, time, noteToFreq(arpNote), 0.7 * spb, 0.34);

        if (Math.abs(beatInBar) < 0.01) {
          const swell = (barIndex === 3 || barIndex === 7) ? 0.24 : 0.16;
          this._playStringPad(fader, time, arp.slice(1, 4).map(noteToFreq), barBeats * spb * 0.95, swell, score.padCutoff, false);
        }
      } else if (state.trackId === 'tension_secret') {
        if (Math.abs(beatInBar) < 0.01) {
          const chord = score.chords[barIndex];
          const cutoff = 420 + (barIndex % 4) * 90;
          this._playStringPad(fader, time, chord.map(noteToFreq), barBeats * spb * 0.96, score.padGain, cutoff, true);
          // Subtle tension heartbeat pulse at beat 1.0 and 1.35
          this._scheduleTensionPulse(fader, time);
          this._scheduleTensionPulse(fader, time + 0.35 * spb);
        }
      } else if (state.trackId === 'climax_choice') {
        const chord = score.chords[barIndex];
        const arpMap = [0, 1, 2, 1, 0, 1, 2, 1];
        const subIdx = Math.round(beatInBar * 2) % 8;
        const arpNote = chord[arpMap[subIdx] % chord.length];
        this._playFeltPiano(fader, time, noteToFreq(arpNote), 0.55 * spb, 0.48);

        if (Math.abs(beatInBar) < 0.01) {
          const cutoff = 800 + barIndex * 200;
          const padGain = 0.22 + (barIndex / 7) * 0.16;
          this._playStringPad(fader, time, chord.slice(1).map(noteToFreq), barBeats * spb * 0.96, padGain, cutoff, false);
          this._playSoftBass(fader, time, noteToFreq(score.bassRoots[barIndex]), 1.6 * spb, 0.60);
        } else if (Math.abs(beatInBar - 2.0) < 0.01) {
          this._playSoftBass(fader, time, noteToFreq(score.bassRoots[barIndex]), 1.4 * spb, 0.55);
        }
      }
    }

    _scheduleTensionPulse(dest, time) {
      const ctx = this.ctx;
      const t = Math.max(ctx.currentTime, time);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(44, t + 0.09);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 110;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

      osc.connect(lp);
      lp.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.18);
    }

    // =========================================================================
    // Cicada Ambience (Single-Instance, Gentle, Non-Fatiguing)
    // =========================================================================
    _startCicadaAmbience() {
      if (!this.settings.cicadaEnabled || !this.ctx || !this.unlocked) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      if (this.cicadaInstance) {
        // Already running: gently swell wave peak without stacking
        const g = this.cicadaInstance.masterGain;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0.068, now + 1.5);
        g.gain.linearRampToValueAtTime(0.048, now + 5.0);
        return;
      }

      const noiseA = ctx.createBufferSource();
      noiseA.buffer = this.pinkNoiseBuffer;
      noiseA.loop = true;

      const noiseB = ctx.createBufferSource();
      noiseB.buffer = this.pinkNoiseBuffer;
      noiseB.loop = true;

      // Layer A: 3450 Hz bandpass + 5800 Hz lowpass
      const bpA = ctx.createBiquadFilter();
      bpA.type = 'bandpass';
      bpA.frequency.value = 3450;
      bpA.Q.value = 2.8;

      const lpA = ctx.createBiquadFilter();
      lpA.type = 'lowpass';
      lpA.frequency.value = 5800;

      const gainA = ctx.createGain();
      gainA.gain.value = 0.65;

      // Wingbeat LFO 14.5 Hz
      const wingLfo = ctx.createOscillator();
      wingLfo.type = 'sine';
      wingLfo.frequency.value = 14.5;
      const wingDepth = ctx.createGain();
      wingDepth.gain.value = 0.30;
      wingLfo.connect(wingDepth);
      wingDepth.connect(gainA.gain);

      // Layer B: 2150 Hz bandpass panned +0.25
      const bpB = ctx.createBiquadFilter();
      bpB.type = 'bandpass';
      bpB.frequency.value = 2150;
      bpB.Q.value = 2.2;

      const gainB = ctx.createGain();
      gainB.gain.value = 0.35;

      let panB = null;
      if (typeof ctx.createStereoPanner === 'function') {
        panB = ctx.createStereoPanner();
        panB.pan.value = 0.25;
      }

      // Master ambience wave LFO (0.11 Hz breathing between 0.025 and 0.075)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.05, now + 1.4);

      const waveLfo = ctx.createOscillator();
      waveLfo.type = 'sine';
      waveLfo.frequency.value = 0.11;
      const waveDepth = ctx.createGain();
      waveDepth.gain.value = 0.022;
      waveLfo.connect(waveDepth);
      waveDepth.connect(masterGain.gain);

      noiseA.connect(bpA);
      bpA.connect(lpA);
      lpA.connect(gainA);
      gainA.connect(masterGain);

      noiseB.connect(bpB);
      bpB.connect(gainB);
      if (panB) {
        gainB.connect(panB);
        panB.connect(masterGain);
      } else {
        gainB.connect(masterGain);
      }

      masterGain.connect(this.masterSfxGain);

      noiseA.start(now);
      noiseB.start(now, 1.3);
      wingLfo.start(now);
      waveLfo.start(now);

      this.cicadaInstance = {
        masterGain: masterGain,
        nodes: [noiseA, noiseB, wingLfo, waveLfo]
      };
    }

    stopAmbience(fadeMs = 1200) {
      if (!this.cicadaInstance || !this.ctx) return;
      const inst = this.cicadaInstance;
      this.cicadaInstance = null;

      const now = this.ctx.currentTime;
      const fadeSec = Math.max(0.05, fadeMs / 1000);
      inst.masterGain.gain.cancelScheduledValues(now);
      inst.masterGain.gain.setValueAtTime(inst.masterGain.gain.value, now);
      inst.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);

      setTimeout(() => {
        inst.nodes.forEach((n) => {
          try { n.stop(); } catch (e) {}
          try { n.disconnect(); } catch (e) {}
        });
        try { inst.masterGain.disconnect(); } catch (e) {}
      }, fadeMs + 80);
    }

    isCicadaActive() {
      return Boolean(this.cicadaInstance);
    }

    // =========================================================================
    // Script SFX (AUDIO_SPEC.md §4.2 ~ §4.6)
    // =========================================================================
    playSFX(sfxId, options) {
      if (!this.unlocked || !this.ctx) return;
      const opts = options || {};
      const ctx = this.ctx;
      const now = ctx.currentTime;

      if (sfxId === 'cicada_ambience') {
        this._startCicadaAmbience();
        return;
      }

      if (sfxId === 'wind_chime') {
        // Wind breath
        const breath = ctx.createBufferSource();
        breath.buffer = this.pinkNoiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 1800;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2800;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.0001, now);
        bg.gain.linearRampToValueAtTime(0.03, now + 0.06);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        breath.connect(hp); hp.connect(bp); bp.connect(bg); bg.connect(this.masterSfxGain);
        breath.start(now, Math.random(), 0.32);

        const triggerChimeStrike = (offsetSec, scale) => {
          const partials = [
            [1760, 0.14 * scale, 1.9],
            [2637, 0.10 * scale, 1.6],
            [3595, 0.06 * scale, 1.3],
            [4890, 0.03 * scale, 0.9]
          ];
          partials.forEach(([freq, gVal, dec], idx) => {
            const t = now + 0.03 + offsetSec + idx * 0.024;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(gVal, t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dec);

            const wet = ctx.createGain();
            wet.gain.value = 0.55;
            osc.connect(g);
            g.connect(this.masterSfxGain);
            g.connect(wet);
            wet.connect(this.reverbSend);
            osc.start(t);
            osc.stop(t + dec + 0.03);
          });
        };
        triggerChimeStrike(0, 1.0);
        triggerChimeStrike(0.28, 0.45);
        return;
      }

      if (sfxId === 'choice_confirm') {
        const wet = ctx.createGain();
        wet.gain.value = 0.35;
        wet.connect(this.reverbSend);

        this._playMusicBox(this.masterSfxGain, now, 587.33, 0.55, 0.85);
        this._playMusicBox(this.masterSfxGain, now + 0.022, 880.0, 0.65, 0.85);
        this._playMusicBox(wet, now, 587.33, 0.55, 0.5);

        const resonance = opts.resonance || 'none';
        if (resonance === 'outsideBond') {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(3520, now + 0.05);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, now + 0.05);
          g.gain.linearRampToValueAtTime(0.055, now + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
          osc.connect(g);
          g.connect(this.masterSfxGain);
          g.connect(wet);
          osc.start(now + 0.05);
          osc.stop(now + 1.28);
        } else if (resonance === 'dependency') {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(146.83, now + 0.04);
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 380;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, now + 0.04);
          g.gain.linearRampToValueAtTime(0.14, now + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
          osc.connect(lp); lp.connect(g); g.connect(this.masterSfxGain);
          osc.start(now + 0.04);
          osc.stop(now + 0.88);
        } else if (resonance === 'truth') {
          const page = ctx.createBufferSource();
          page.buffer = this.pinkNoiseBuffer;
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 1600;
          const pg = ctx.createGain();
          pg.gain.setValueAtTime(0.0001, now + 0.03);
          pg.gain.linearRampToValueAtTime(0.05, now + 0.045);
          pg.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
          page.connect(bp); bp.connect(pg); pg.connect(this.masterSfxGain);
          page.start(now + 0.03, 0.2, 0.11);

          this._playMusicBox(this.masterSfxGain, now + 0.06, 1318.51, 0.75, 0.52);
        }
        return;
      }

      if (sfxId === 'heartbeat') {
        const beat = (offset, fStart, fEnd, peak, dur) => {
          const t = now + offset;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fStart, t);
          osc.frequency.exponentialRampToValueAtTime(fEnd, t + 0.08);
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 140;
          lp.Q.value = 1.2;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(peak, t + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          osc.connect(lp); lp.connect(g); g.connect(this.masterSfxGain);
          osc.start(t);
          osc.stop(t + dur + 0.03);
        };
        beat(0.0, 88, 42, 0.36, 0.16);
        beat(0.19, 76, 38, 0.24, 0.14);

        // Subtle BGM ducking
        if (this.bgmPreGain) {
          this.bgmPreGain.gain.cancelScheduledValues(now);
          this.bgmPreGain.gain.setValueAtTime(this.bgmPreGain.gain.value, now);
          this.bgmPreGain.gain.linearRampToValueAtTime(0.78, now + 0.12);
          this.bgmPreGain.gain.linearRampToValueAtTime(1.0, now + 0.67);
        }
        return;
      }

      if (sfxId === 'door_slide') {
        // Wood track friction noise
        const slide = ctx.createBufferSource();
        slide.buffer = this.pinkNoiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 2.4;
        bp.frequency.setValueAtTime(420, now);
        bp.frequency.linearRampToValueAtTime(880, now + 0.18);
        bp.frequency.linearRampToValueAtTime(360, now + 0.42);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.15, now + 0.04);
        g.gain.linearRampToValueAtTime(0.10, now + 0.34);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

        const grainLfo = ctx.createOscillator();
        grainLfo.type = 'triangle';
        grainLfo.frequency.value = 22;
        const grainDepth = ctx.createGain();
        grainDepth.gain.value = 0.03;
        grainLfo.connect(grainDepth);
        grainDepth.connect(g.gain);

        slide.connect(bp); bp.connect(g); g.connect(this.masterSfxGain);
        slide.start(now, 0.1, 0.45);
        grainLfo.start(now);
        grainLfo.stop(now + 0.44);

        // Wooden frame thud at end
        const thudT = now + 0.39;
        const thud = ctx.createOscillator();
        thud.type = 'triangle';
        thud.frequency.setValueAtTime(135, thudT);
        thud.frequency.exponentialRampToValueAtTime(58, thudT + 0.06);
        const tg = ctx.createGain();
        tg.gain.setValueAtTime(0.0001, thudT);
        tg.gain.linearRampToValueAtTime(0.20, thudT + 0.008);
        tg.gain.exponentialRampToValueAtTime(0.0001, thudT + 0.15);
        thud.connect(tg); tg.connect(this.masterSfxGain);
        thud.start(thudT);
        thud.stop(thudT + 0.17);
        return;
      }

      if (sfxId === 'memory_flash') {
        // Reverse-style shimmer swell (0.00 ~ 0.45s)
        const swellSrc = ctx.createBufferSource();
        swellSrc.buffer = this.pinkNoiseBuffer;
        const swellBp = ctx.createBiquadFilter();
        swellBp.type = 'bandpass';
        swellBp.Q.value = 3.5;
        swellBp.frequency.setValueAtTime(400, now);
        swellBp.frequency.exponentialRampToValueAtTime(3600, now + 0.45);

        const swellGain = ctx.createGain();
        swellGain.gain.setValueAtTime(0.0001, now);
        swellGain.gain.exponentialRampToValueAtTime(0.18, now + 0.43);
        swellGain.gain.linearRampToValueAtTime(0.0001, now + 0.46);
        swellSrc.connect(swellBp); swellBp.connect(swellGain); swellGain.connect(this.masterSfxGain);
        swellSrc.start(now, 0.4, 0.48);

        // Bell resonance impact (0.45s ~ 2.2s)
        const bellT = now + 0.45;
        const wet = ctx.createGain();
        wet.gain.value = 0.65;
        wet.connect(this.reverbSend);

        [1318.51, 1324.0, 1975.53].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, bellT);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, bellT);
          g.gain.linearRampToValueAtTime(idx === 2 ? 0.12 : 0.16, bellT + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, bellT + 1.75);
          osc.connect(g);
          g.connect(this.masterSfxGain);
          g.connect(wet);
          osc.start(bellT);
          osc.stop(bellT + 1.78);
        });

        // Subtle BGM dip
        if (this.bgmPreGain) {
          this.bgmPreGain.gain.cancelScheduledValues(now);
          this.bgmPreGain.gain.setValueAtTime(this.bgmPreGain.gain.value, now);
          this.bgmPreGain.gain.linearRampToValueAtTime(0.65, now + 0.45);
          this.bgmPreGain.gain.linearRampToValueAtTime(1.0, now + 1.85);
        }
      }
    }

    // =========================================================================
    // Typewriter Tick & UI SFX (AUDIO_SPEC.md §5)
    // =========================================================================
    playTypeTick(speakerId, char) {
      if (!this.unlocked || !this.ctx || !char) return;
      if (/^[\s\n\r，。、…！？「」『』—・：；,.!?()（）]/.test(char)) return;

      const nowMs = performance.now();
      if (nowMs - this.lastTypeTickMs < 52) return;
      this.lastTypeTickMs = nowMs;

      const ctx = this.ctx;
      const t = ctx.currentTime;

      let baseFreq = 355;
      let gainPeak = 0.042;
      if (speakerId === 'kotori') {
        baseFreq = 520;
        gainPeak = 0.048;
      } else if (speakerId === 'natsumi') {
        baseFreq = 430;
        gainPeak = 0.058;
      }

      const freq = baseFreq * (0.92 + Math.random() * 0.16);

      const oscSin = ctx.createOscillator();
      oscSin.type = 'sine';
      oscSin.frequency.setValueAtTime(freq, t);

      const oscTri = ctx.createOscillator();
      oscTri.type = 'triangle';
      oscTri.frequency.setValueAtTime(freq, t);
      const triG = ctx.createGain();
      triG.gain.value = 0.15;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1400;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(gainPeak, t + 0.003);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.027);

      oscSin.connect(lp);
      oscTri.connect(triG); triG.connect(lp);
      lp.connect(env);
      env.connect(this.masterSfxGain);

      oscSin.start(t);
      oscTri.start(t);
      oscSin.stop(t + 0.045);
      oscTri.stop(t + 0.045);
    }

    playUI(uiId) {
      if (!this.unlocked || !this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      if (uiId === 'advance') {
        const src = ctx.createBufferSource();
        src.buffer = this.pinkNoiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.03, now + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        src.connect(hp); hp.connect(g); g.connect(this.masterSfxGain);
        src.start(now, 0.3, 0.055);
        this._playMusicBox(this.masterSfxGain, now, 880, 0.05, 0.22);
      } else if (uiId === 'hover') {
        const ms = performance.now();
        if (ms - this.lastHoverMs < 65) return;
        this.lastHoverMs = ms;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.linearRampToValueAtTime(740, now + 0.025);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.035, now + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
        osc.connect(lp); lp.connect(g); g.connect(this.masterSfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (uiId === 'save') {
        [392.0, 493.88, 587.33].forEach((f, i) => {
          this._playWarmRhodes(this.masterSfxGain, now + i * 0.065, f, 0.18, 0.8);
        });
      } else if (uiId === 'load') {
        [587.33, 440.0, 392.0].forEach((f, i) => {
          this._playWarmRhodes(this.masterSfxGain, now + i * 0.07, f, 0.20, 0.8);
        });
      } else if (uiId === 'modal_open' || uiId === 'modal_close') {
        const isOpen = uiId === 'modal_open';
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isOpen ? 320 : 440, now);
        osc.frequency.linearRampToValueAtTime(isOpen ? 480 : 280, now + (isOpen ? 0.06 : 0.055));
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(isOpen ? 0.05 : 0.04, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.connect(g); g.connect(this.masterSfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (uiId === 'blocked') {
        [0, 0.06].forEach((off) => {
          const t = now + off;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, t);
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 500;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.06, t + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
          osc.connect(lp); lp.connect(g); g.connect(this.masterSfxGain);
          osc.start(t);
          osc.stop(t + 0.06);
        });
      }
    }
  }

  global.audioEngine = new AudioEngine();
})(window);
