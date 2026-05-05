// 사운드 시스템을 별도 파일로 분리한 이유:
// AudioContext는 싱글턴이어야 하고, 게임 전반에서 재사용되므로
// 컴포넌트와 완전히 독립된 모듈로 관리하는 것이 맞다.

// Cloudinary에 호스팅된 게임 효과음 파일 URL 목록
export const AUDIO_FILES = {
  login: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%EA%B2%8C%EC%9E%84%EC%B2%98%EC%9D%8C%EC%8B%9C%EC%9E%91_%EC%8B%9C_mz0xel.wav',
  hit1: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%ED%83%80%EA%B2%A91_li3zpg.wav',
  hit2: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%ED%83%80%EA%B2%A92_pt7rf5.wav',
  hit3: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615688/%ED%83%80%EA%B2%A93_eobc5y.wav',
  equip: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EC%9E%A5%EC%B0%A9_ymdx0u.wav',
  upgradeFail: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EA%B0%95%ED%99%94_%EC%8B%A4%ED%8C%A8_%EC%8B%9C_a1jkwd.wav',
  upgradeSuccess: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615687/%EA%B0%95%ED%99%94_%EC%84%B1%EA%B3%B5_%EC%8B%9C_xaqks7.wav',
  charge: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615686/%EA%B0%95%ED%99%94%EB%B2%84%ED%8A%BC_%EB%88%84%EB%A5%BC_%EC%8B%9C_rnlmga.wav',
  click: 'https://res.cloudinary.com/dkotceims/video/upload/v1777615687/UI%ED%81%B4%EB%A6%AD%EC%86%8C%EB%A6%AC_ds0aah.wav',
};

// sfx 싱글턴: Web Audio API를 모듈 레벨에서 한 번만 생성하고 재사용
// 브라우저 정책상 AudioContext는 사용자 인터랙션 이후에만 생성 가능하므로 init()을 사용
export const sfx = {
  ctx: null,

  // 첫 번째 사용자 클릭/터치 시점에 AudioContext를 활성화하는 함수
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  // 파일 기반 효과음 재생 (Cloudinary URL 사용)
  playSound(key) {
    if (AUDIO_FILES[key]) {
      const audio = new Audio(AUDIO_FILES[key]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play blocked:', e));
    }
  },

  // Web Audio API 오실레이터로 짧은 톤 생성 (파일 없이 UI 피드백 소리 생성)
  playTone(freq, type, duration, vol, detune = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.detune.setValueAtTime(detune, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // 마우스 호버 시 미세한 피드백 (너무 자극적이지 않게 낮은 볼륨)
  hover() { this.playTone(300, 'sine', 0.05, 0.01); },
  click() { this.playSound('click'); },
  login() { this.playSound('login'); },
  equip() { this.playSound('equip'); },

  // 성공 시 상승하는 3화음 (긍정적인 느낌을 주기 위해 도-미-솔 계열)
  success() {
    this.playTone(440, 'sine', 0.2, 0.05);
    setTimeout(() => this.playTone(554, 'sine', 0.2, 0.05), 100);
    setTimeout(() => this.playTone(659, 'sine', 0.4, 0.05), 200);
  },

  // 실패 시 하강하는 불협화음 (부정적인 느낌을 주기 위해 저음 거칠게)
  error() {
    this.playTone(150, 'sawtooth', 0.3, 0.03);
    setTimeout(() => this.playTone(120, 'sawtooth', 0.4, 0.03), 150);
  },

  charge() { this.playSound('charge'); },
  upgradeSuccess() { this.playSound('upgradeSuccess'); },
  upgradeFail() { this.playSound('upgradeFail'); },

  // 타격음을 3종 중 랜덤 선택하여 단조로움 방지
  hit() {
    const hits = ['hit1', 'hit2', 'hit3'];
    this.playSound(hits[Math.floor(Math.random() * hits.length)]);
  },

  // 치명타는 타격음 + 저음 임팩트 레이어 추가로 강렬한 느낌
  crit() {
    this.hit();
    this.playTone(100, 'sawtooth', 0.4, 0.15, -800);
    setTimeout(() => this.playTone(80, 'square', 0.3, 0.1, -1000), 50);
  },

  dodge() { this.playTone(400, 'sine', 0.2, 0.05, -500); },

  // 스킬 발동은 상승하는 3음으로 특별한 느낌 강조
  skill() {
    this.playTone(800, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(1200, 'sine', 0.2, 0.05), 100);
    setTimeout(() => this.playTone(2000, 'sine', 0.4, 0.05), 300);
  }
};
