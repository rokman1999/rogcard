const AUDIO_FILES = {
  login: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%EA%B2%8C%EC%9E%84%EC%B2%98%EC%9D%8C%EC%8B%9C%EC%9E%91_%EC%8B%9C_mz0xel.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%EA%B2%8C%EC%9E%84%EC%B2%98%EC%9D%8C%EC%8B%9C%EC%9E%91_%EC%8B%9C_mz0xel.wav)',
  hit1: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%ED%83%80%EA%B2%A91_li3zpg.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%ED%83%80%EA%B2%A91_li3zpg.wav)',
  hit2: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%ED%83%80%EA%B2%A92_pt7rf5.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%ED%83%80%EA%B2%A92_pt7rf5.wav)',
  hit3: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%ED%83%80%EA%B2%A93_eobc5y.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%ED%83%80%EA%B2%A93_eobc5y.wav)',
  equip: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EC%9E%A5%EC%B0%A9_ymdx0u.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EC%9E%A5%EC%B0%A9_ymdx0u.wav)',
  upgradeFail: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EA%B0%95%ED%99%94_%EC%8B%A4%ED%8C%A8_%EC%8B%9C_a1jkwd.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EA%B0%95%ED%99%94_%EC%8B%A4%ED%8C%A8_%EC%8B%9C_a1jkwd.wav)',
  upgradeSuccess: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EA%B0%95%ED%99%94_%EC%84%B1%EA%B3%B5_%EC%8B%9C_xaqks7.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EA%B0%95%ED%99%94_%EC%84%B1%EA%B3%B5_%EC%8B%9C_xaqks7.wav)',
  charge: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615686/%EA%B0%95%ED%99%94%EB%B2%84%ED%8A%BC_%EB%88%84%EB%A5%BC_%EC%8B%9C_rnlmga.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615686/%EA%B0%95%ED%99%94%EB%B2%84%ED%8A%BC_%EB%88%84%EB%A5%BC_%EC%8B%9C_rnlmga.wav)',
  click: '[https://res.cloudinary.com/dkotceims/video/upload/v1777615687/UI%ED%81%B4%EB%A6%AD%EC%86%8C%EB%A6%AC_ds0aah.wav](https://res.cloudinary.com/dkotceims/video/upload/v1777615687/UI%ED%81%B4%EB%A6%AD%EC%86%8C%EB%A6%AC_ds0aah.wav)',
};

export const sfx = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  playSound(key) {
    if(AUDIO_FILES[key]) {
      const audio = new Audio(AUDIO_FILES[key]);
      audio.volume = 0.5; 
      audio.play().catch(e => console.log('Audio play blocked:', e));
    }
  },
  playTone(freq, type, duration, vol, detune=0) {
    if(!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type; 
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.detune.setValueAtTime(detune, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + duration);
  },
  hover() { this.playTone(300, 'sine', 0.05, 0.01); },
  click() { this.playSound('click'); },
  login() { this.playSound('login'); },
  equip() { this.playSound('equip'); },
  success() {
    this.playTone(440, 'sine', 0.2, 0.05);
    setTimeout(()=>this.playTone(554, 'sine', 0.2, 0.05), 100);
    setTimeout(()=>this.playTone(659, 'sine', 0.4, 0.05), 200);
  },
  error() {
    this.playTone(150, 'sawtooth', 0.3, 0.03);
    setTimeout(()=>this.playTone(120, 'sawtooth', 0.4, 0.03), 150);
  },
  charge() { this.playSound('charge'); },
  upgradeSuccess() { this.playSound('upgradeSuccess'); },
  upgradeFail() { this.playSound('upgradeFail'); },
  hit() { 
    const hits = ['hit1', 'hit2', 'hit3'];
    this.playSound(hits[Math.floor(Math.random() * hits.length)]);
  },
  crit() { 
    this.hit(); 
    this.playTone(100, 'sawtooth', 0.4, 0.15, -800); 
    setTimeout(() => this.playTone(80, 'square', 0.3, 0.1, -1000), 50);
  },
  dodge() { this.playTone(400, 'sine', 0.2, 0.05, -500); },
  skill() {
    this.playTone(800, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(1200, 'sine', 0.2, 0.05), 100);
    setTimeout(() => this.playTone(2000, 'sine', 0.4, 0.05), 300);
  }
};
