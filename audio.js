export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.volume = Number(localStorage.getItem("tcl-volume") || 65) / 100;
  }

  ensure() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume * .45;
    this.master.connect(this.ctx.destination);
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    this.engineOsc.connect(filter).connect(this.engineGain).connect(this.master);
    this.engineOsc.start();
  }

  setVolume(v) {
    this.volume = v;
    localStorage.setItem("tcl-volume", Math.round(v * 100));
    if (this.master) this.master.gain.value = v * .45;
  }

  updateEngine(speed, boost) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.engineOsc.frequency.linearRampToValueAtTime(70 + speed * 7 + (boost ? 80 : 0), now + .05);
    this.engineGain.gain.linearRampToValueAtTime(.04 + Math.min(speed / 95, .08), now + .05);
  }

  quietEngine() {
    if (!this.ctx || !this.engineGain) return;
    this.engineGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + .08);
  }

  play(name) {
    this.ensure();
    const map = {
      item: [660, .08, "triangle"],
      mushroom: [520, .18, "square"],
      goldMushroom: [780, .18, "square"],
      star: [880, .25, "triangle"],
      lightning: [120, .28, "sawtooth"],
      bomb: [90, .35, "sawtooth"],
      horn: [260, .3, "square"],
      collision: [130, .12, "sawtooth"],
      thunk: [82, .24, "sawtooth"],
      green: [410, .12, "triangle"],
      red: [470, .12, "triangle"],
      blue: [240, .22, "sawtooth"],
      fireball: [360, .14, "sawtooth"],
      feather: [960, .12, "sine"],
      banana: [300, .1, "triangle"],
      boomerang: [620, .15, "triangle"],
      ink: [160, .16, "sine"],
      coin: [980, .09, "sine"]
    };
    const [freq, dur, type] = map[name] || [440, .1, "sine"];
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(.001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.18, this.ctx.currentTime + .02);
    g.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime + dur);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + dur + .05);
  }
}
