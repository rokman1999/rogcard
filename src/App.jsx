import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, arrayUnion, addDoc, query, where, getDocs, increment } from 'firebase/firestore';
import { Trophy, Swords, Cpu, User, Skull, Ghost, Terminal, Plus, ArrowRight, ShieldAlert, Sparkles, Coins, Banknote, Volume2, VolumeX, Hexagon, MessageSquare, Crosshair, Zap, ShoppingCart, Shield, ArrowUpCircle, Info, Edit3, Send, Users } from 'lucide-react';

// ==========================================
// 1. 게임 기획 데이터 (상수)
// ==========================================
const CREATE_CARD_COST = 5000;
const STARTING_GOLD = 1000000; 

const STATS_BY_LEVEL = [
  null,
  { hp: 100, atk: 20, def: 5, spd: 50, crit: 10, luck: 0 },
  { hp: 115, atk: 24, def: 6, spd: 53, crit: 11, luck: 1 },
  { hp: 132, atk: 28, def: 7, spd: 56, crit: 12, luck: 2 },
  { hp: 152, atk: 33, def: 9, spd: 60, crit: 14, luck: 3 },
  { hp: 180, atk: 40, def: 12, spd: 65, crit: 18, luck: 5 },
  { hp: 210, atk: 47, def: 14, spd: 69, crit: 20, luck: 6 },
  { hp: 245, atk: 55, def: 17, spd: 73, crit: 22, luck: 8 },
  { hp: 280, atk: 64, def: 19, spd: 78, crit: 25, luck: 10 },
  { hp: 300, atk: 70, def: 21, spd: 82, crit: 27, luck: 11 },
  { hp: 320, atk: 75, def: 22, spd: 85, crit: 28, luck: 12 },
  { hp: 365, atk: 88, def: 25, spd: 90, crit: 31, luck: 14 },
  { hp: 420, atk: 100, def: 27, spd: 95, crit: 33, luck: 16 },
  { hp: 480, atk: 115, def: 30, spd: 100, crit: 36, luck: 18 },
  { hp: 540, atk: 128, def: 32, spd: 105, crit: 38, luck: 20 },
  { hp: 600, atk: 140, def: 35, spd: 110, crit: 40, luck: 22 },
  { hp: 700, atk: 165, def: 38, spd: 118, crit: 43, luck: 25 },
  { hp: 820, atk: 195, def: 41, spd: 125, crit: 46, luck: 28 },
  { hp: 950, atk: 225, def: 44, spd: 133, crit: 49, luck: 31 },
  { hp: 1080, atk: 255, def: 47, spd: 141, crit: 52, luck: 33 },
  { hp: 1200, atk: 280, def: 50, spd: 150, crit: 55, luck: 35 },
];

const COST_BY_LEVEL = [
  null, 100, 200, 300, 500, 800, 1200, 2000, 3500, 5000,
  8000, 15000, 25000, 40000, 60000, 90000, 140000, 200000, 300000, 500000,
];

const getSellPrice = (level) => {
  let cumulativeCost = 0;
  for (let i = 1; i <= level; i++) cumulativeCost += (COST_BY_LEVEL[i] || 0);
  return Math.floor((1000 + cumulativeCost * 0.8) + (level * level * 2000));
};

const ENHANCEMENT_RULES = [
  null,
  { successRate: 100, onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 100, onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 100, onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 95,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 95,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 90,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 90,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 85,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 80,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 75,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 70,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 65,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 60,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 55,  onFail: 'keep', destroyChance: 0, levelDownOnFail: 0 }, 
  { successRate: 45,  onFail: 'down', destroyChance: 0, levelDownOnFail: 1 }, 
  { successRate: 35,  onFail: 'down', destroyChance: 0, levelDownOnFail: 1 }, 
  { successRate: 25,  onFail: 'down', destroyChance: 0, levelDownOnFail: 2 }, 
  { successRate: 15,  onFail: 'mixed', destroyChance: 10, levelDownOnFail: 2 }, 
  { successRate: 10,  onFail: 'mixed', destroyChance: 20, levelDownOnFail: 3 },
];

const UNIQUE_TRAITS = [
  { name: '무쇠뚝배기', desc: '선천적으로 얼굴이 두꺼워 적의 공격을 15% 덜 받습니다.' },
  { name: '키보드 워리어', desc: '온라인 여포. 팩트로 때려서 치명타 확률이 15% 상승합니다.' },
  { name: '주식 물린 자', desc: '분노 게이지 MAX. 체력 50% 이하 시 데미지가 1.3배 상승합니다.' },
  { name: '사내 모기', desc: '동료의 피를 빱니다. 공격 시 가한 데미지의 20%를 체력으로 훔쳐옵니다.' },
  { name: '탈주 닌자', desc: '불리하면 도망치는데 도가 텄습니다. 회피율이 10% 상승합니다.' },
  { name: '될놈될', desc: '가만히 있어도 떡상합니다. 강화 확률과 치명타 확률이 소폭 상승합니다.' },
  { name: '월급 루팡', desc: '숨만 쉬어도 체력이 찹니다. (기본 방어력 10% 보너스)' }
];

const TRAIT_COLORS = {
  '무쇠뚝배기': 'bg-slate-500/20 border-slate-500/50 text-slate-300',
  '키보드 워리어': 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  '주식 물린 자': 'bg-red-500/20 border-red-500/50 text-red-400',
  '사내 모기': 'bg-rose-500/20 border-rose-500/50 text-rose-400',
  '탈주 닌자': 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  '될놈될': 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  '월급 루팡': 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  // 과거 생성된 카드들을 위한 예전 특성 색상 호환 데이터
  '강철 바디': 'bg-slate-500/20 border-slate-500/50 text-slate-300',
  '암살자': 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  '광전사': 'bg-red-500/20 border-red-500/50 text-red-400',
  '흡혈귀': 'bg-rose-500/20 border-rose-500/50 text-rose-400',
  '바람돌이': 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  '럭키가이': 'bg-amber-500/20 border-amber-500/50 text-amber-400'
};

const getRandomTrait = () => UNIQUE_TRAITS[Math.floor(Math.random() * UNIQUE_TRAITS.length)];

const SKILL_UNLOCKS = {
  3: '퇴사 선언', 5: '팩트 폭력', 8: '칼퇴의 요정', 10: '분노의 야근', 12: '법카 찬스', 14: '철면피', 15: '비트코인 떡락', 18: '엄마 호출', 20: '비선실세'
};

const SKILLS_DATA = {
  '퇴사 선언': '스피드와 무관하게 전투 시작 시 무조건 선공을 가져갑니다. 사표가 최고죠.',
  '팩트 폭력': '매 4번째 공격마다 적의 멘탈을 부수는 1.5배의 뼈 때리는 치명타를 날립니다.',
  '칼퇴의 요정': '15% 확률로 휙! 하고 물리 타격을 잔상만 남기며 요리조리 회피합니다.',
  '분노의 야근': '현재 체력이 30% 이하가 되면 억눌린 빡침이 폭발하여 공격력이 1.5배 상승합니다.',
  '법카 찬스': '적에게 입힌 피해의 15%를 달달하게 체력으로 환급(흡혈)받습니다.',
  '철면피': '얼굴이 두꺼워져 적의 모든 공격에서 들어오는 최종 데미지를 10% 무시합니다.',
  '비트코인 떡락': '체력이 깎일수록 파멸적인 분노를 느껴 최대 2배까지 데미지가 무식하게 상승합니다.',
  '엄마 호출': 'HP가 0이 되어도 한 번은 엄마 빽으로 최대 체력 30% 상태로 부활합니다.',
  '비선실세': '모든 공격이 자비 없이 무조건 2배 데미지(치명타)로 꽂히는 압도적 권력입니다.',
  // 과거 생성된 카드들을 위한 예전 스킬 설명 호환 데이터
  '선빵필승': '스피드와 무관하게 전투 시작 시 무조건 선공을 가져갑니다. 빠따가 최고죠.',
  '뚝배기 브레이커': '매 4번째 공격마다 적의 멘탈을 부수는 1.5배의 치명타를 날립니다.',
  '닌자 무빙': '15% 확률로 휙! 하고 물리 타격을 잔상만 남기며 회피합니다.',
  '풀악셀': '현재 체력이 30% 이하가 되면 리미터를 해제하여 공격력이 1.5배 상승합니다.',
  '뱀파이어 흡혈': '적에게 입힌 피해의 15%를 달달하게 체력으로 훔쳐옵니다.',
  '우주 방어력': '적의 모든 공격에서 들어오는 최종 데미지를 10% 깎아냅니다.',
  '눈깔 뒤집힘': '체력이 깎일수록 분노하여 최대 2배까지 데미지가 무식하게 상승합니다.',
  '예토전생': 'HP가 0이 되어도 한 번은 좀비처럼 최대 체력 30%로 부활합니다.',
  '원펀맨': '모든 공격이 자비 없이 무조건 2배 데미지(치명타)로 꽂힙니다.'
};

const getUnlockedSkills = (level) => {
  const skills = [];
  for (let i = 1; i <= level; i++) {
    if (SKILL_UNLOCKS[i]) skills.push(SKILL_UNLOCKS[i]);
  }
  return skills;
};

// 업적 계산 및 데이터
const ACHIEVEMENTS_DATA = {
  "🏆 첫 승리의 짜릿함": "처음으로 전투에서 승리했습니다. 시작이 반이죠.",
  "🏅 골목대장": "전투 10승 달성. 동네에서는 좀 치는군요.",
  "👑 전장의 지배자": "전투 50승 달성. 당신의 이름이 서버에 널리 알려집니다.",
  "💰 벼락부자": "5,000,000 GOLD 보유. 지갑이 두둑합니다.",
  "🏦 걸어다니는 은행": "20,000,000 GOLD 보유. 당신이 곧 자본주의입니다.",
  "✨ 두 자릿수 돌파": "LV.10 이상 카드 보유. 본격적인 시작입니다.",
  "🔥 인간을 초월한 자": "LV.15 이상 카드 보유. 확률의 벽을 뚫었군요.",
  "🚀 만렙의 경지": "LV.20 최고 레벨 달성. 더 이상 오를 곳이 없습니다.",
  "🤕 쿠쿠다스 멘탈": "10번의 패배. 꺾이지 않는 마음이 중요합니다.",
  "😭 동네 북": "30번의 패배. 이쯤 되면 맞는 걸 즐기는 걸지도 모릅니다."
};

const checkAchievements = (userData, userCards) => {
  let ach = [];
  if (!userData) return ach;
  if (userData.wins >= 1) ach.push("🏆 첫 승리의 짜릿함");
  if (userData.wins >= 10) ach.push("🏅 골목대장");
  if (userData.wins >= 50) ach.push("👑 전장의 지배자");
  if (userData.money >= 5000000) ach.push("💰 벼락부자");
  if (userData.money >= 20000000) ach.push("🏦 걸어다니는 은행");
  if (userCards.some(c => c.level >= 10)) ach.push("✨ 두 자릿수 돌파");
  if (userCards.some(c => c.level >= 15)) ach.push("🔥 인간을 초월한 자");
  if (userCards.some(c => c.level >= 20)) ach.push("🚀 만렙의 경지");
  if (userData.losses >= 10) ach.push("🤕 쿠쿠다스 멘탈");
  if (userData.losses >= 30) ach.push("😭 동네 북");
  return ach;
};

// ==========================================
// 2. 사운드 시스템
// ==========================================
const AUDIO_FILES = {
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

const sfx = {
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
  },
  heal() {
    this.playTone(600, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(800, 'sine', 0.2, 0.05), 100);
  }
};

// ==========================================
// 3. Firebase 설정
// ==========================================
let app, auth, db, appId, USERS_PATH, CARDS_PATH, MATCHES_PATH, GLOBAL_CHAT_PATH;
try {
  const firebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDhI7NY91JVUKNbLUP8wBOSViFOhww8B6g",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "rogcard-5817f.firebaseapp.com",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "rogcard-5817f",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "rogcard-5817f.firebasestorage.app",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "773353426861",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:773353426861:web:f0790795db5459379b1b24"
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = 'rog-card-default';
  USERS_PATH = `artifacts/${appId}/public/data/users`;
  CARDS_PATH = `artifacts/${appId}/public/data/cards`;
  MATCHES_PATH = `artifacts/${appId}/public/data/matches`;
  GLOBAL_CHAT_PATH = `artifacts/${appId}/public/data/globalChat`;
} catch (e) {
  console.error("Firebase Init Error:", e);
}

// ==========================================
// 4. UI 컴포넌트 & 유틸리티
// ==========================================
const HUDCorner = () => (
  <>
    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/40 pointer-events-none z-10 transform -translate-x-2 -translate-y-2 transition-all duration-500"></div>
    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/40 pointer-events-none z-10 transform translate-x-2 -translate-y-2 transition-all duration-500"></div>
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/40 pointer-events-none z-10 transform -translate-x-2 translate-y-2 transition-all duration-500"></div>
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/40 pointer-events-none z-10 transform translate-x-2 translate-y-2 transition-all duration-500"></div>
  </>
);

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    info: 'border-white/30 text-white',
    success: 'border-emerald-500/70 text-emerald-400',
    error: 'border-red-500/70 text-red-400',
    warning: 'border-amber-500/70 text-amber-400'
  };

  return (
    <div className={`fixed bottom-8 right-8 px-6 py-4 border bg-black/60 backdrop-blur-3xl shadow-2xl rounded-none z-50 flex items-center gap-3 animate-slide-up font-mono text-base tracking-wider ${bgColors[type]}`}>
      {type === 'success' && <div className="w-2 h-2 bg-emerald-400"></div>}
      {type === 'error' && <div className="w-2 h-2 bg-red-500"></div>}
      {type === 'warning' && <div className="w-2 h-2 bg-amber-500"></div>}
      {type === 'info' && <div className="w-2 h-2 bg-white/50"></div>}
      <span className="font-light">{message}</span>
    </div>
  );
};

const formatMoney = (num) => new Intl.NumberFormat('en-US').format(num || 0);

const getIcon = (name) => {
  const icons = { User, Skull, Ghost, Terminal, Cpu };
  const IconCmp = icons[name] || User;
  return <IconCmp size={20} />;
};

const ICONS_KEYS = ['User', 'Skull', 'Ghost', 'Terminal', 'Cpu'];

const getFoilClass = (level) => {
  if (level >= 20) return 'bg-[length:200%_200%] bg-gradient-to-tr from-cyan-400 via-purple-500 to-yellow-400 animate-foil-shift p-[2px] shadow-[0_0_20px_rgba(0,255,255,0.4)]';
  if (level >= 18) return 'bg-[length:200%_200%] bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-800 animate-foil-shift p-[2px] shadow-[0_0_15px_rgba(255,0,255,0.3)]';
  if (level >= 15) return 'bg-[length:200%_200%] bg-gradient-to-tr from-red-600 via-red-900 to-black animate-foil-shift p-[2px] shadow-[0_0_15px_rgba(255,51,0,0.3)]';
  if (level >= 11) return 'bg-[length:200%_200%] bg-gradient-to-tr from-yellow-300 via-yellow-600 to-amber-900 animate-foil-shift p-[2px]';
  if (level >= 8)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-purple-400 via-purple-700 to-black animate-foil-shift p-[2px]';
  if (level >= 5)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-blue-400 via-blue-700 to-black animate-foil-shift p-[2px]';
  return 'bg-gradient-to-b from-gray-500 to-gray-800 p-[1px]';
};

const getTierTextColor = (level) => {
  if (level >= 20) return 'text-cyan-300 drop-shadow-[0_0_8px_#67e8f9]';
  if (level >= 18) return 'text-fuchsia-400 drop-shadow-[0_0_8px_#e879f9]';
  if (level >= 15) return 'text-red-400 drop-shadow-[0_0_8px_#f87171]';
  if (level >= 11) return 'text-yellow-400 drop-shadow-[0_0_5px_#facc15]';
  if (level >= 8)  return 'text-purple-400 drop-shadow-[0_0_5px_#c084fc]';
  if (level >= 5)  return 'text-blue-400 drop-shadow-[0_0_5px_#60a5fa]';
  return 'text-gray-300';
};

const renderFrameOverlay = (frame) => {
  if (!frame) return null;
  if (frame === 'frame_rust') return <div className="absolute inset-0 pointer-events-none z-[40] border-[4px] border-[#a0522d] shadow-[inset_0_0_40px_rgba(139,69,19,0.9)] opacity-90"></div>;
  if (frame === 'frame_gold') return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-yellow-400 shadow-[inset_0_0_50px_rgba(250,204,21,0.8)] animate-pulse"></div>;
  if (frame === 'frame_neon') return <div className="absolute inset-0 pointer-events-none z-[40] border-[2px] border-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,1),0_0_15px_rgba(236,72,153,1)] border-r-pink-500 border-b-pink-500"></div>;
  if (frame === 'frame_void') return <div className="absolute inset-0 pointer-events-none z-[40] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.95)_100%)] border-2 border-purple-900 shadow-[inset_0_0_80px_rgba(88,28,135,1)]"></div>;
  if (frame === 'frame_hologram') return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[40] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.2)_3px,transparent_4px)] mix-blend-screen opacity-50"></div>
      <div className="absolute left-0 right-0 w-full h-[30%] pointer-events-none z-[41] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent mix-blend-screen" style={{ animation: 'scanline 2.5s linear infinite' }}></div>
    </>
  );
  if (frame === 'frame_blood') return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-red-600" style={{ animation: 'blood-pulse 1.5s ease-in-out infinite' }}></div>;
  if (frame === 'frame_obsidian') return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-gray-800 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.4)_25%,transparent_30%)]" style={{ backgroundSize: '200% 100%', animation: 'obsidian-shine 3s linear infinite', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9)' }}></div>;
  return null;
};

const MiniCard = ({ card, onClick }) => {
  if (!card) return null;
  const foilBg = getFoilClass(card.level);
  return (
    <div onClick={onClick} className={`relative w-24 aspect-[2/3.1] rounded-none ${foilBg} overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-500 hover:scale-110 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="w-full h-full bg-black relative rounded-none overflow-hidden border border-black/50">
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover opacity-90" />
        {renderFrameOverlay(card.equippedFrame)}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 text-center border-t border-white/20 z-30">
          <span className={`text-xs font-mono font-black ${getTierTextColor(card.level)}`}>LV.{card.level}</span>
        </div>
      </div>
    </div>
  );
};

const CardItem = ({ card, onClick, onHover, className="" }) => {
  if(!card) return (
    <div className={`w-full aspect-[2/3.1] border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-none flex items-center justify-center text-white/30 font-mono text-sm transition-all duration-500 ${className}`}>
      <span className="opacity-30">EMPTY SLOT</span>
    </div>
  );
  
  const foilBg = getFoilClass(card.level);
  const textCol = getTierTextColor(card.level);
  const traitColorClass = card.uniqueTrait ? (TRAIT_COLORS[card.uniqueTrait.name] || 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400') : '';
  
  return (
    <div 
      onClick={onClick} onMouseEnter={onHover}
      className={`relative w-full aspect-[2/3.1] rounded-none transition-all duration-500 group ${foilBg} ${className}`}
    >
      <div className="w-full h-full relative z-10 rounded-none overflow-hidden bg-black flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        <img src={card.imageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
        <div className="absolute inset-0 opacity-15 pointer-events-none z-10 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIi8+PC9zdmc+')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-80"></div>
        
        {renderFrameOverlay(card.equippedFrame)}
        
        {card.level >= 11 && <div className="absolute inset-0 holographic-overlay opacity-30 mix-blend-color-dodge z-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-50"></div>}
        {card.level >= 15 && <div className="absolute inset-0 bg-red-600/10 mix-blend-color-burn animate-pulse z-20 pointer-events-none"></div>}

        <div className="relative z-30 flex flex-col h-full p-3 transition-transform duration-500">
          <div className="flex justify-between items-start w-full drop-shadow-lg relative min-h-[30px]">
            <div className="font-sans font-black text-[1.1em] sm:text-[1.2em] tracking-wider text-white break-words text-left leading-tight mt-1 group-hover:text-emerald-300 transition-colors duration-300 w-[70%]">
              {card.name}
            </div>
            {card.uniqueTrait && (
              <div className={`absolute right-0 top-0 px-1.5 py-0.5 border rounded-none text-[0.45em] sm:text-[0.5em] font-bold mix-blend-normal drop-shadow-md z-40 whitespace-nowrap ${traitColorClass}`}>
                {card.uniqueTrait.name}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 w-full">
            <div className="text-[0.7em] text-white/70 italic leading-snug line-clamp-2 break-words drop-shadow-md bg-black/40 p-1.5 rounded-none border-l border-white/20 transition-all duration-300 group-hover:bg-black/60 group-hover:text-white">
              "{card.description}"
            </div>
            <div className="flex flex-wrap gap-1 w-full">
              {card.unlockedSkills.map((s, i) => (
                <div key={i} className="flex items-center bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded-none border-l-2 border-white/50 transition-all duration-300 group-hover:bg-white/20">
                  <span className="text-[0.65em] font-bold text-white tracking-widest">{s}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end gap-2 w-full mt-1">
              <div className="flex-1 grid grid-cols-4 gap-1 bg-black/60 backdrop-blur-md border border-white/20 p-1.5 rounded-none transition-all duration-300 group-hover:bg-black/80">
                <div className="flex flex-col items-center"><span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">ATK</span><span className="text-[0.75em] font-bold text-white">{card.stats.atk}</span></div>
                <div className="flex flex-col items-center"><span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">DEF</span><span className="text-[0.75em] font-bold text-white">{card.stats.def}</span></div>
                <div className="flex flex-col items-center"><span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">SPD</span><span className="text-[0.75em] font-bold text-white">{card.stats.spd}</span></div>
                <div className="flex flex-col items-center"><span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">CRT</span><span className="text-[0.75em] font-bold text-white">{card.stats.crit}</span></div>
              </div>
              
              <div className={`w-[2.5em] h-[1.8em] bg-black border border-current flex items-center justify-center transform -skew-x-12 shadow-[0_0_10px_currentColor] transition-all duration-500 group-hover:shadow-[0_0_20px_currentColor] group-hover:scale-110 ${textCol}`}>
                <span className="transform skew-x-12 text-[0.8em] font-mono font-black tracking-tighter drop-shadow-md">LV.{card.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. 메인 앱 컴포넌트
// ==========================================
export default function RogCard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  const [currentView, setCurrentView] = useState('login'); 
  const [selectedCard, setSelectedCard] = useState(null);
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rankingTab, setRankingTab] = useState('level'); 
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [previewCard, setPreviewCard] = useState(null); 
  const [selectedSkillDesc, setSelectedSkillDesc] = useState(null); 
  const [selectedAchDesc, setSelectedAchDesc] = useState(null);

  const bgmRef = useRef(null);

  const [useBoost, setUseBoost] = useState(false);
  const [useProtect, setUseProtect] = useState(false);
  const [enhanceVisualState, setEnhanceVisualState] = useState('idle');

  const [cropImage, setCropImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('User');

  // 프로필 관련 상태
  const [viewingProfileUserId, setViewingProfileUserId] = useState(null);
  const [guestbookInput, setGuestbookInput] = useState('');
  const [isEditingProfileDesc, setIsEditingProfileDesc] = useState(false);
  const [editProfileDesc, setEditProfileDesc] = useState('');

  const [pvpRoomId, setPvpRoomId] = useState(null);
  const [pvpRoomData, setPvpRoomData] = useState(null);
  const [pvpRoomName, setPvpRoomName] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  
  const [chatInput, setChatInput] = useState('');
  const [globalChats, setGlobalChats] = useState([]);
  const [globalChatInput, setGlobalChatInput] = useState('');

  const [battleReward, setBattleReward] = useState(0);
  const [battleBet, setBattleBet] = useState(1000);
  const [aiOpponent, setAiOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleStep, setBattleStep] = useState(0);
  const [liveState, setLiveState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleType, setBattleType] = useState('AI'); 

  // --- 골드 채굴용 Refs ---
  const mineClicksRef = useRef(0);
  const mineTimeoutRef = useRef(null);

  // --- PWA 및 모바일 뷰포트 설정 동적 주입 ---
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

    // OG Image 동적 주입
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', 'https://res.cloudinary.com/dkotceims/image/upload/v1777807405/Artboard_1_o1ws3a.png');

    // 사이트 아이콘(Favicon) 동적 주입
    let iconLink = document.querySelector('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.setAttribute('rel', 'icon');
      document.head.appendChild(iconLink);
    }
    iconLink.setAttribute('href', 'https://res.cloudinary.com/dkotceims/image/upload/v1777807404/Artboard_2_a4ie5j.png');

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', 'https://res.cloudinary.com/dkotceims/image/upload/v1777807404/Artboard_2_a4ie5j.png');

    const manifestContent = {
      name: "ROG CARD ARENA",
      short_name: "ROG CARD",
      start_url: ".",
      display: "standalone",
      background_color: "#050505",
      theme_color: "#050505",
      icons: [{ src: "https://res.cloudinary.com/dkotceims/image/upload/v1777807404/Artboard_2_a4ie5j.png", sizes: "192x192", type: "image/png" }]
    };
    const blob = new Blob([JSON.stringify(manifestContent)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestURL;
    return () => URL.revokeObjectURL(manifestURL);
  }, []);

  const playSfx = (type, param) => { if(soundEnabled && sfx[type]) sfx[type](param); };
  const showToast = (msg, type = 'info') => setToast({ message: msg, type });

  const wrapClick = (fn) => (e) => { 
    sfx.init(); playSfx('click'); 
    if (soundEnabled && bgmRef.current && bgmRef.current.paused) { bgmRef.current.volume = 0.2; bgmRef.current.play().catch(() => {}); }
    if(fn) fn(e); 
  };
  const handleHover = () => playSfx('hover');

  useEffect(() => {
    if (bgmRef.current) {
      if (soundEnabled) bgmRef.current.play().catch(() => {});
      else bgmRef.current.pause();
    }
  }, [soundEnabled]);

  // 접속자 추적 로직 (최근 5분 이내 활동)
  useEffect(() => {
    if (!user) return;
    const ping = () => { updateDoc(doc(db, USERS_PATH, user.uid), { lastActive: Date.now() }).catch(()=>{}); };
    ping();
    const interval = setInterval(ping, 60000);
    return () => clearInterval(interval);
  }, [user, currentView]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, USERS_PATH, u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.nickname.startsWith('USR_') || data.nickname.startsWith('Player_')) setCurrentView('login');
          else { setUserData(data); setCurrentView('lobby'); }
        } else { setCurrentView('login'); }
      } else { setCurrentView('login'); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userUnsub = onSnapshot(doc(db, USERS_PATH, user.uid), (docSnap) => { if (docSnap.exists()) setUserData(docSnap.data()); });
    const cardsUnsub = onSnapshot(collection(db, CARDS_PATH), (snapshot) => {
      const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllCards(cards); setMyCards(cards.filter(c => c.ownerId === user.uid).sort((a,b) => b.level - a.level));
    });
    const usersUnsub = onSnapshot(collection(db, USERS_PATH), (snapshot) => { 
      const usersData = snapshot.docs.map(d => d.data());
      setAllUsers(usersData);
      setOnlineCount(usersData.filter(u => Date.now() - (u.lastActive || 0) < 300000).length);
    });
    const globalChatUnsub = onSnapshot(collection(db, GLOBAL_CHAT_PATH), (snapshot) => {
      let chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGlobalChats(chats.sort((a,b) => a.timestamp - b.timestamp).slice(-50));
    });
    const matchesUnsub = onSnapshot(collection(db, MATCHES_PATH), (snapshot) => {
      const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveRooms(matches.filter(m => m.status === 'waiting').sort((a,b) => b.createdAt - a.createdAt));
    });
    return () => { userUnsub(); cardsUnsub(); usersUnsub(); globalChatUnsub(); matchesUnsub(); };
  }, [user]);

  useEffect(() => {
    if (!pvpRoomId) { setPvpRoomData(null); return; }
    const unsub = onSnapshot(doc(db, MATCHES_PATH, pvpRoomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPvpRoomData(data);
        if (data.status === 'battling' && currentView === 'pvp_room') {
          // PVP 시작 시 상태 초기화
          setBattleLog(data.battleLog);
          setLiveState({ p1Hp: data.hostCard.stats.hp, p2Hp: data.guestCard.stats.hp, p1Max: data.hostCard.stats.hp, p2Max: data.guestCard.stats.hp, currentAction: null });
          setBattleStep(0); setBattleResult(null); setCurrentView('battle_pvp_play');
        }
      } else { showToast("방이 파괴되었습니다.", "error"); setPvpRoomId(null); setCurrentView('lobby'); }
    });
    return () => unsub();
  }, [pvpRoomId, currentView]);

  useEffect(() => {
    if(currentView !== 'enhance') { setUseBoost(false); setUseProtect(false); }
    if(currentView !== 'card_details') { setSelectedSkillDesc(null); }
    if(currentView !== 'profile') { setSelectedAchDesc(null); }
  }, [currentView]);

  useEffect(() => {
    if (!showCreateModal) { setCropImage(null); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 }); }
  }, [showCreateModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    sfx.init(); playSfx('click');
    if (!loginNickname.trim() || !loginPassword.trim()) { showToast("닉네임과 비밀번호를 입력하세요", "warning"); return; }
    if (loginPassword.length < 4) { showToast("비밀번호는 4자리 이상이어야 합니다", "warning"); return; }
    setIsProcessing(true);
    try {
      const dummyEmail = `${loginNickname.toLowerCase()}@rogcard.app`;
      const firebasePassword = loginPassword + "_ROG"; // Firebase 6자리 제한 우회용 패딩
      let currentUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, dummyEmail, firebasePassword);
        currentUser = cred.user;
      } catch (err) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, dummyEmail, firebasePassword);
          currentUser = cred.user;
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') showToast("비밀번호가 일치하지 않습니다.", "error");
          else showToast("로그인 처리 중 오류가 발생했습니다.", "error");
          playSfx('error'); setIsProcessing(false); return;
        }
      }
      
      const userRef = doc(db, USERS_PATH, currentUser.uid);
      const snap = await getDoc(userRef);
      const config = { nickname: loginNickname.trim(), icon: selectedIconName };
      
      if (snap.exists()) {
        await updateDoc(userRef, config);
        setUserData({ ...snap.data(), ...config });
      } else {
        const q = query(collection(db, USERS_PATH), where("nickname", "==", config.nickname));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const oldDoc = querySnapshot.docs[0];
          const oldUid = oldDoc.id;
          const cardsQ = query(collection(db, CARDS_PATH), where("ownerId", "==", oldUid));
          const cardsSnap = await getDocs(cardsQ);
          await Promise.all(cardsSnap.docs.map(cDoc => updateDoc(doc(db, CARDS_PATH, cDoc.id), { ownerId: currentUser.uid })));
          const migratedData = { ...oldDoc.data(), userId: currentUser.uid, ...config };
          await setDoc(userRef, migratedData);
          setUserData(migratedData);
        } else {
          const newUserData = { userId: currentUser.uid, nickname: config.nickname, icon: config.icon, money: STARTING_GOLD, wins: 0, losses: 0, aiWins: 0, maxSlots: 3, items: { boost: 0, protect: 0 }, frames: ['default'], profileDesc: "자기소개가 아직 없습니다.", guestbook: [], createdAt: new Date().toISOString() };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        }
      }
      playSfx('login'); setCurrentView('lobby');
    } catch (err) {
      showToast("접근이 거부되었습니다.", "error"); playSfx('error');
    } finally { setIsProcessing(false); }
  };

  const handleAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (userData.lastAttendance === today) return; 
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money + 10000, lastAttendance: today });
      playSfx('success'); showToast("일일 출석 보상: +10,000 GOLD", "success");
    } catch (err) { showToast("시스템 오류 발생", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleMineGold = () => {
    sfx.init(); playSfx('click');
    setUserData(prev => ({ ...prev, money: prev.money + 1 }));
    mineClicksRef.current += 1;
    
    if (mineTimeoutRef.current) clearTimeout(mineTimeoutRef.current);
    mineTimeoutRef.current = setTimeout(() => {
      const totalMined = mineClicksRef.current;
      mineClicksRef.current = 0;
      updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(totalMined) }).catch(e => console.error(e));
    }, 1000);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { setCropImage(ev.target.result); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 }); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const clampPan = (x, y, zoom) => {
    if (!imgRef.current || !imgLoaded) return { x, y };
    const S_0 = Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight);
    const finalScale = S_0 * zoom;
    const dW = imgRef.current.naturalWidth * finalScale;
    const dH = imgRef.current.naturalHeight * finalScale;
    const maxDx = Math.max(0, (dW - 200) / 2);
    const maxDy = Math.max(0, (dH - 310) / 2);
    return { x: Math.min(Math.max(x, -maxDx), maxDx), y: Math.min(Math.max(y, -maxDy), maxDy) };
  };

  const handleCropPointerDown = (e) => { setIsDragging(true); setDragStart({ x: (e.touches ? e.touches[0].clientX : e.clientX) - cropPan.x, y: (e.touches ? e.touches[0].clientY : e.clientY) - cropPan.y }); };
  const handleCropPointerMove = (e) => { if (!isDragging) return; setCropPan(clampPan((e.touches ? e.touches[0].clientX : e.clientX) - dragStart.x, (e.touches ? e.touches[0].clientY : e.clientY) - dragStart.y, cropZoom)); };
  const handleCropPointerUp = () => setIsDragging(false);
  const handleZoomChange = (e) => { setCropZoom(Number(e.target.value)); setCropPan(prev => clampPan(prev.x, prev.y, Number(e.target.value))); };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (myCards.length >= (userData?.maxSlots || 3)) { showToast("보유 슬롯이 가득 찼습니다.", "error"); playSfx('error'); return; }
    if (userData.money < CREATE_CARD_COST) { showToast("자금이 부족합니다.", "error"); playSfx('error'); return; }
    if (!cropImage || !imgLoaded || !imgRef.current) { showToast("이미지를 업로드해주세요.", "error"); playSfx('error'); return; }
    
    setIsProcessing(true);
    try {
      const targetW = 800; const targetH = 1240; const R = targetW / 200; 
      const canvas = document.createElement('canvas'); canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      const S_0 = Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight);
      const finalScale = S_0 * cropZoom;
      const dW = imgRef.current.naturalWidth * finalScale; const dH = imgRef.current.naturalHeight * finalScale;

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(imgRef.current, (100 - dW/2 + cropPan.x) * R, (155 - dH/2 + cropPan.y) * R, dW * R, dH * R);

      const base64Image = canvas.toDataURL('image/jpeg', 0.95);
      const newCardRef = doc(collection(db, CARDS_PATH));
      
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money - CREATE_CARD_COST });
      await setDoc(newCardRef, { cardId: newCardRef.id, ownerId: user.uid, name: e.target.cardName.value.toUpperCase(), description: e.target.cardDescription.value || "DATA CORRUPTED.", imageUrl: base64Image, level: 1, stats: STATS_BY_LEVEL[1], unlockedSkills: [], equippedFrame: null, uniqueTrait: getRandomTrait(), createdAt: new Date().toISOString() });
      
      playSfx('success'); showToast("카드 생성 완료", "success"); setShowCreateModal(false); setIsProcessing(false);
    } catch (err) { playSfx('error'); showToast("생성 실패", "error"); setIsProcessing(false); }
  };

  const handleSellCard = (card) => {
    const sellPrice = getSellPrice(card.level);
    setConfirmModal({
      title: "카드 판매", message: `[${card.name}] 카드를 판매하시겠습니까?\n\n판매 획득 골드: ${formatMoney(sellPrice)} GOLD\n(낮은 레벨의 카드는 판매 금액이 매우 적을 수 있습니다.)\n이 작업은 되돌릴 수 없습니다.`, confirmText: "판매 확정", cancelText: "취소",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money + sellPrice });
          await deleteDoc(doc(db, CARDS_PATH, card.id));
          playSfx('success'); showToast(`판매 완료: +${formatMoney(sellPrice)} GOLD`, "success");
        } catch(e) { showToast("오류 발생", "error"); playSfx('error'); }
        setIsProcessing(false); setConfirmModal(null); setCurrentView('deck');
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleSendGlobalChat = async (e) => {
    e.preventDefault();
    if(!globalChatInput.trim()) return;
    try { await addDoc(collection(db, GLOBAL_CHAT_PATH), { sender: userData.nickname, text: globalChatInput.trim(), timestamp: Date.now() }); setGlobalChatInput(''); } catch(err) {}
  };

  const handleBuyItem = async (itemId, price, name) => {
    if (userData.money < price) { showToast("자금이 부족합니다", "error"); playSfx('error'); return; }
    setIsProcessing(true);
    try {
      const userRef = doc(db, USERS_PATH, user.uid);
      let updateData = { money: userData.money - price };
      if (itemId === 'boost') updateData.items = { ...(userData.items || {}), boost: ((userData.items || {}).boost || 0) + 1 };
      else if (itemId === 'protect') updateData.items = { ...(userData.items || {}), protect: ((userData.items || {}).protect || 0) + 1 };
      else if (itemId === 'slot') updateData.maxSlots = (userData.maxSlots || 3) + 1;
      else if (itemId.startsWith('frame_')) updateData.frames = arrayUnion(itemId);

      await updateDoc(userRef, updateData);
      playSfx('success'); showToast(`구매 완료: ${name}`, "success");
    } catch(e) { showToast("구매 실패", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleEquipCardFrame = async (frameId) => {
    if (!selectedCard) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, CARDS_PATH, selectedCard.id), { equippedFrame: frameId });
      setSelectedCard(prev => ({ ...prev, equippedFrame: frameId }));
      playSfx('equip'); showToast(frameId ? "프레임 장착 완료" : "프레임 해제 완료", "success");
    } catch(e) { showToast("적용 실패", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleEnhance = async (card) => {
    const nextLevel = card.level + 1;
    if (nextLevel > 20) return;
    const cost = COST_BY_LEVEL[nextLevel];
    if (userData.money < cost) { showToast("자금이 부족합니다", "error"); playSfx('error'); return; }

    setIsProcessing(true);
    const isFast = card.level < 8;
    setEnhanceVisualState(isFast ? 'charging_fast' : 'charging_tension'); playSfx('charge');
    
    setTimeout(async () => {
      try {
        const rule = { ...ENHANCEMENT_RULES[nextLevel] };
        let finalRate = Math.min(99, Math.max(1, rule.successRate + (card.stats.luck || 0) * 0.3));
        if (useBoost) finalRate = Math.min(99, finalRate + 10);
        if (useProtect) { rule.onFail = 'keep'; rule.destroyChance = 0; }

        const itemsUpdate = { ...userData.items };
        if (useBoost) itemsUpdate.boost = Math.max(0, (itemsUpdate.boost || 0) - 1);
        if (useProtect) itemsUpdate.protect = Math.max(0, (itemsUpdate.protect || 0) - 1);

        await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money - cost, items: itemsUpdate });
        setUseBoost(false); setUseProtect(false);

        if (Math.random() * 100 < finalRate) {
          const updatedCard = { ...card, level: nextLevel, stats: STATS_BY_LEVEL[nextLevel], unlockedSkills: getUnlockedSkills(nextLevel) };
          await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
          setSelectedCard(updatedCard);
          setEnhanceVisualState(`success_${nextLevel}`); playSfx('upgradeSuccess'); showToast(`강화 성공: LV.${nextLevel}`, "success");
          if (nextLevel >= 10) await addDoc(collection(db, GLOBAL_CHAT_PATH), { sender: 'SYSTEM', text: `🎉 [${userData.nickname}]님이 [${card.name}] ${nextLevel}강 한계돌파에 성공했습니다!`, timestamp: Date.now() });
        } else {
          if (rule.onFail === 'keep') {
            setEnhanceVisualState('fail'); playSfx('error'); showToast("강화 실패 (등급 유지)", "warning");
          } else if (rule.onFail === 'down') {
            const newLvl = Math.max(1, card.level - rule.levelDownOnFail);
            const updatedCard = { ...card, level: newLvl, stats: STATS_BY_LEVEL[newLvl], unlockedSkills: getUnlockedSkills(newLvl) };
            await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
            setSelectedCard(updatedCard); setEnhanceVisualState('fail'); playSfx('upgradeFail'); showToast(`등급 하락: LV.${newLvl}`, "error");
          } else if (rule.onFail === 'mixed') {
            if (Math.random() * 100 < rule.destroyChance) {
              await deleteDoc(doc(db, CARDS_PATH, card.id));
              setEnhanceVisualState('destroyed'); playSfx('upgradeFail'); showToast("카드 파괴됨", "error"); setSelectedCard(null);
            } else {
              const newLvl = Math.max(1, card.level - rule.levelDownOnFail);
              const updatedCard = { ...card, level: newLvl, stats: STATS_BY_LEVEL[newLvl], unlockedSkills: getUnlockedSkills(newLvl) };
              await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
              setSelectedCard(updatedCard); setEnhanceVisualState('fail'); playSfx('upgradeFail'); showToast(`치명적 실패 (등급 하락): LV.${newLvl}`, "error");
            }
          }
        }
      } catch(e) { showToast("시스템 오류 발생", "error"); setEnhanceVisualState('idle'); }
      setIsProcessing(false);
      setTimeout(() => { setEnhanceVisualState((prev) => prev === 'destroyed' ? 'destroyed' : 'idle'); }, 800);
    }, isFast ? 100 : 2500);
  };

  const startAIBattleSetup = (myCard) => {
    const aiLevel = Math.min(20, 1 + Math.floor((userData?.aiWins || 0) / 2));
    const aiNames = ["SYS.GHOST", "NEXUS.AI", "NULL.PTR", "GLITCH.SYS", "VOID.EXE"];
    setAiOpponent({
      id: 'ai_card', cardId: 'ai_card', name: aiNames[Math.floor(Math.random() * aiNames.length)], level: aiLevel,
      stats: STATS_BY_LEVEL[aiLevel], unlockedSkills: getUnlockedSkills(aiLevel),
      description: `네트워크를 떠도는 위협 수준 ${aiLevel}의 개체.`,
      imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}&backgroundColor=0a0a0a`
    });
    setSelectedCard(myCard); setBattleReward(aiLevel * 2000 + 5000); setBattleType('AI'); setCurrentView('battle_ai_setup');
  };

  const simulateBattleLog = (c1, c2) => {
    const p1 = { ...c1.stats, name: c1.name, skills: c1.unlockedSkills || [], trait: c1.uniqueTrait, attackCount:0, revived:false, damageTaken:0, key:'p1', originalHp: c1.stats.hp };
    const p2 = { ...c2.stats, name: c2.name, skills: c2.unlockedSkills || [], trait: c2.uniqueTrait, attackCount:0, revived:false, damageTaken:0, key:'p2', originalHp: c2.stats.hp };
    
    const hasTrait = (p, tNew, tOld) => p.trait?.name === tNew || p.trait?.name === tOld;
    const hasSkill = (p, sNew, sOld) => p.skills.includes(sNew) || p.skills.includes(sOld);

    if (hasTrait(p1, '키보드 워리어', '암살자')) p1.crit += 25; 
    if (hasTrait(p2, '키보드 워리어', '암살자')) p2.crit += 25;
    if (hasTrait(p1, '탈주 닌자', '바람돌이')) p1.dodgeRate = 15; 
    if (hasTrait(p2, '탈주 닌자', '바람돌이')) p2.dodgeRate = 15;

    const log = [{ type: 'start', text: `교전 개시: [${p1.name}] VS [${p2.name}]`, state: { p1Hp: p1.hp, p2Hp: p2.hp } }];
    
    let p1First = p1.spd >= p2.spd;
    if (hasSkill(p1, '퇴사 선언', '선빵필승') && !hasSkill(p2, '퇴사 선언', '선빵필승')) p1First = true;
    if (!hasSkill(p1, '퇴사 선언', '선빵필승') && hasSkill(p2, '퇴사 선언', '선빵필승')) p1First = false;

    // 선공 스킬 시각적 표출 추가
    if (hasSkill(p1First ? p1 : p2, '퇴사 선언', '선빵필승')) {
        const starter = p1First ? p1 : p2;
        const skillName = starter.skills.includes('퇴사 선언') ? '퇴사 선언' : '선빵필승';
        log.push({ type: 'skill', text: `✨ [${starter.name}]의 <${skillName}> 발동! 무조건 선공!`, state: { p1Hp: p1.hp, p2Hp: p2.hp }, actor: starter.key, skill: skillName });
    }

    let turn = 0;
    while(p1.hp > 0 && p2.hp > 0 && turn < 100) {
      turn++;

      for(const attacker of p1First ? [p1, p2] : [p2, p1]) {
        if(attacker.hp <= 0) continue;
        const defender = attacker.key === 'p1' ? p2 : p1;
        if(defender.hp <= 0) continue;

        attacker.attackCount++;
        let dodgeChance = hasSkill(defender, '칼퇴의 요정', '닌자 무빙') ? 20 : 0;
        if (hasTrait(defender, '탈주 닌자', '바람돌이')) dodgeChance += 15;

        let oldP1Hp = p1.hp; let oldP2Hp = p2.hp;

        if(Math.random() * 100 < dodgeChance) { 
          log.push({ type: 'dodge', text: `슈슉! [${defender.name}]의 신들린 무빙!`, state: { p1Hp: oldP1Hp, p2Hp: oldP2Hp }, actor: defender.key }); 
          continue; 
        }

        let damage = attacker.atk; let isCrit = false; 
        let activatedSkills = [];
        
        if (hasTrait(attacker, '주식 물린 자', '광전사') && (attacker.hp / attacker.originalHp) <= 0.5) {
          damage *= 1.4;
          if (Math.random() < 0.6) activatedSkills.push(attacker.trait.name);
        }
        
        // 4타 -> 3타로 더 자주 터지게 변경
        if(hasSkill(attacker, '팩트 폭력', '뚝배기 브레이커') && attacker.attackCount % 3 === 0) { 
          damage *= 1.6; 
          activatedSkills.push(attacker.skills.includes('팩트 폭력') ? '팩트 폭력' : '뚝배기 브레이커'); 
        }
        
        // 체력 조건 30% -> 50%로 완화 및 확률 증가
        if(hasSkill(attacker, '분노의 야근', '풀악셀') && (attacker.hp / attacker.originalHp) < 0.5) { 
          damage *= 1.5; 
          if(Math.random() < 0.6) activatedSkills.push(attacker.skills.includes('분노의 야근') ? '분노의 야근' : '풀악셀'); 
        }
        
        if(hasSkill(attacker, '비트코인 떡락', '눈깔 뒤집힘')) { 
          let mult = 1 + Math.min(1.5, (attacker.damageTaken / attacker.originalHp) * 1.5);
          damage *= mult; 
          if(mult > 1.2 && Math.random() < 0.5) activatedSkills.push(attacker.skills.includes('비트코인 떡락') ? '비트코인 떡락' : '눈깔 뒤집힘'); 
        }
        
        if(hasSkill(attacker, '비선실세', '원펀맨')) { 
          isCrit = true; 
          if(Math.random() < 0.5) activatedSkills.push(attacker.skills.includes('비선실세') ? '비선실세' : '원펀맨'); 
        }
        else if(Math.random() * 100 < attacker.crit) { isCrit = true; }

        if(isCrit) damage *= 2;
        
        // 발동된 스킬들을 각각 분리해서 로그에 먼저 푸시 (애니메이션이 차례대로 터지도록)
        for (const s of activatedSkills) {
           log.push({ type: 'skill', text: `✨ [${attacker.name}]의 특수 프로토콜 <${s}> 발동!`, state: { p1Hp: oldP1Hp, p2Hp: oldP2Hp }, actor: attacker.key, skill: s });
        }

        let finalDef = defender.def + (hasSkill(defender, '철면피', '우주 방어력') ? 10 : 0) + (hasTrait(defender, '무쇠뚝배기', '강철 바디') ? 15 : 0) + (hasTrait(defender, '월급 루팡', '월급 루팡') ? 10 : 0);
        damage = Math.max(1, Math.floor(damage * (1 - Math.min(90, finalDef) / 100)));
        defender.hp -= damage; defender.damageTaken += damage;

        log.push({ type: isCrit ? 'critical' : 'attack', text: `[${attacker.name}] ${isCrit ? "뼈와 살이 분리되는 일격!!" : "퍼억! 데미지가 들어갑니다."} (-${Math.floor(damage)})`, state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) }, damage: Math.floor(damage), attacker: attacker.key, defender: defender.key });

        // 흡혈 확률 증가
        let healAmount = (hasSkill(attacker, '법카 찬스', '뱀파이어 흡혈') ? damage * 0.25 : 0) + (hasTrait(attacker, '사내 모기', '흡혈귀') ? damage * 0.20 : 0);
        if (healAmount > 0) { 
          attacker.hp = Math.min(attacker.originalHp, attacker.hp + Math.floor(healAmount)); 
          let lsSkill = null;
          if (hasSkill(attacker, '법카 찬스', '뱀파이어 흡혈') && Math.random() < 0.7) lsSkill = attacker.skills.includes('법카 찬스') ? '법카 찬스' : '뱀파이어 흡혈';
          else if (hasTrait(attacker, '사내 모기', '흡혈귀') && Math.random() < 0.5) lsSkill = attacker.trait.name;

          if (lsSkill) {
             log.push({ type: 'heal', text: `🩸 [${attacker.name}]의 <${lsSkill}>! 체력을 ${Math.floor(healAmount)} 회복합니다.`, state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) }, actor: attacker.key, heal: Math.floor(healAmount), skill: lsSkill });
          }
        }

        // 예토전생 체력량 증가 (30% -> 40%)
        if(defender.hp <= 0 && hasSkill(defender, '엄마 호출', '예토전생') && !defender.revived) {
          defender.hp = Math.floor(defender.originalHp * 0.4); defender.revived = true;
          let reviveName = defender.skills.includes('엄마 호출') ? '엄마 호출' : '예토전생';
          log.push({ type: 'revive', text: `🧟 [${defender.name}] : 기적처럼 <${reviveName}>로 부활합니다!`, state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) }, actor: defender.key });
        }
      }
    }
    const isP1Win = p1.hp > 0;
    log.push({ type: 'end', text: `🏁 교전 종료! 승리: [${isP1Win ? p1.name : p2.name}]`, state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) }, winner: isP1Win ? 'p1' : 'p2' });
    return log;
  };

  const executeAIBattle = async () => {
    const simLog = simulateBattleLog(selectedCard, aiOpponent);
    setBattleLog(simLog); setLiveState({ p1Hp: selectedCard.stats.hp, p2Hp: aiOpponent.stats.hp, p1Max: selectedCard.stats.hp, p2Max: aiOpponent.stats.hp, currentAction: null });
    setBattleStep(0); setBattleResult(null); setCurrentView('battle');
  };

  useEffect(() => {
    if ((currentView === 'battle' || currentView === 'battle_pvp_play') && battleLog.length > 0 && battleStep < battleLog.length) {
      const stepData = battleLog[battleStep];
      let delay = 900;
      if (stepData.type === 'start') delay = 1500;
      else if (stepData.type === 'critical') delay = 1400;
      else if (stepData.type === 'skill') delay = 1200;
      else if (stepData.type === 'dodge' || stepData.type === 'attack') delay = 800;
      else if (stepData.type === 'heal') delay = 1000;
      else if (stepData.type === 'end') delay = 1000;
      
      setLiveState(prev => ({ ...prev, currentAction: stepData }));

      if (stepData.type === 'critical') playSfx('crit'); 
      else if (stepData.type === 'skill') playSfx('skill'); 
      else if (stepData.type === 'dodge') playSfx('dodge'); 
      else if (stepData.type === 'attack') playSfx('hit');
      else if (stepData.type === 'heal') playSfx('heal');

      // 체력바 감소 및 상승(힐)을 이펙트 뒤로 딜레이
      const hpDelay = ['attack', 'critical', 'skill', 'revive', 'heal'].includes(stepData.type) ? 300 : 0;
      const hpTimer = setTimeout(() => {
          setLiveState(prev => ({ ...prev, p1Hp: stepData.state.p1Hp, p2Hp: stepData.state.p2Hp }));
      }, hpDelay);

      const nextTimer = setTimeout(() => {
        if (stepData.type === 'end') { 
          const isHost = battleType !== 'PvP' || pvpRoomData?.host?.uid === user?.uid;
          const amIWinner = stepData.winner === (isHost ? 'p1' : 'p2');
          playSfx(amIWinner ? 'success' : 'error'); 
          handleBattleEnd(amIWinner); 
        }
        else { setBattleStep(s => s + 1); }
      }, delay);

      return () => { clearTimeout(hpTimer); clearTimeout(nextTimer); };
    }
  }, [currentView, battleStep, battleLog, battleType, pvpRoomData, user]);

  const handleBattleEnd = async (isWin) => {
    setBattleResult(isWin ? 'win' : 'lose');
    if (!user || !userData) return;
    const userRef = doc(db, USERS_PATH, user.uid);
    try {
      if (battleType === 'AI') {
        if (isWin) await updateDoc(userRef, { money: (userData.money || 0) + battleReward, wins: (userData.wins || 0) + 1, aiWins: (userData.aiWins || 0) + 1 });
        else await updateDoc(userRef, { losses: (userData.losses || 0) + 1 });
      } else {
        if (isWin) await updateDoc(userRef, { money: (userData.money || 0) + battleBet * 2, wins: (userData.wins || 0) + 1 });
        else await updateDoc(userRef, { losses: (userData.losses || 0) + 1 });
      }
    } catch(e) { console.error(e); }
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleCreatePvPRoom = async (e) => {
    e.preventDefault();
    if(userData.money < battleBet) { showToast("자금이 부족합니다", "error"); return; }
    if(!pvpRoomName.trim()) { showToast("방 이름을 입력하세요", "warning"); return; }
    setIsProcessing(true);
    try {
      const code = generateRoomCode();
      await setDoc(doc(db, MATCHES_PATH, code), { id: code, roomName: pvpRoomName.trim(), host: { uid: user.uid, nickname: userData.nickname }, hostCard: selectedCard, guest: null, guestCard: null, bet: battleBet, status: 'waiting', chat: [], battleLog: null, createdAt: Date.now() });
      setPvpRoomId(code); setBattleType('PvP'); setCurrentView('pvp_room');
    } catch(err) { showToast("방 생성 실패", "error"); }
    setIsProcessing(false);
  };

  const handleJoinPvPRoom = async (roomId) => {
    setIsProcessing(true);
    try {
      const matchRef = doc(db, MATCHES_PATH, roomId);
      const snap = await getDoc(matchRef);
      if(snap.exists()) {
        const data = snap.data();
        if(data.status !== 'waiting') showToast("이미 게임이 시작되었거나 가득 찬 방입니다.", "warning");
        else if(userData.money < data.bet) showToast(`입장 자금이 부족합니다. (필요: ${formatMoney(data.bet)} GOLD)`, "error");
        else {
          await updateDoc(matchRef, { guest: { uid: user.uid, nickname: userData.nickname }, guestCard: selectedCard, status: 'ready' });
          setBattleBet(data.bet); setPvpRoomId(roomId); setBattleType('PvP'); setCurrentView('pvp_room');
        }
      } else { showToast("존재하지 않는 방입니다.", "error"); }
    } catch(err) { showToast("입장 실패", "error"); }
    setIsProcessing(false);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if(!chatInput.trim() || !pvpRoomId) return;
    try { await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), { chat: arrayUnion({ sender: userData.nickname, text: chatInput.trim(), time: Date.now() }) }); setChatInput(''); } catch(err) {}
  };

  const handleStartPvPBattle = async () => {
    if(!pvpRoomData || pvpRoomData.host.uid !== user.uid || pvpRoomData.status !== 'ready') return;
    await updateDoc(doc(db, USERS_PATH, pvpRoomData.host.uid), { money: userData.money - pvpRoomData.bet });
    await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), { status: 'battling', battleLog: simulateBattleLog(pvpRoomData.hostCard, pvpRoomData.guestCard) });
  };

  const handleAddGuestbook = async (e) => {
    e.preventDefault();
    if(!guestbookInput.trim() || !viewingProfileUserId) return;
    try {
      const targetRef = doc(db, USERS_PATH, viewingProfileUserId);
      await updateDoc(targetRef, {
        guestbook: arrayUnion({
          writerId: user.uid,
          writerName: userData.nickname,
          text: guestbookInput.trim(),
          timestamp: Date.now()
        })
      });
      setGuestbookInput('');
    } catch(err) { showToast("방명록 작성 실패", "error"); }
  };

  const handleSaveProfileDesc = async () => {
    if(!user) return;
    try {
      await updateDoc(doc(db, USERS_PATH, user.uid), { profileDesc: editProfileDesc });
      setIsEditingProfileDesc(false);
      showToast("프로필 업데이트 완료", "success");
    } catch(err) { showToast("업데이트 실패", "error"); }
  };

  // ==========================================
  // 렌더링 뷰 (Views)
  // ==========================================
  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 relative z-10 overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-100">
        <source src="https://res.cloudinary.com/dkotceims/video/upload/v1777616211/14904105-hd_1920_1080_30fps_i7kg6w.mp4" type="video/mp4" />
      </video>
      <div className="text-center mb-24 animate-fade-in flex flex-col items-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-black text-white font-logo tracking-[0.1em] drop-shadow-[0_0_20px_rgba(0,0,0,1)] hover:scale-105 transition-transform duration-700">ROG CARD</h1>
        <p className="font-mono text-base tracking-[0.4em] text-white/90 drop-shadow-[0_0_10px_rgba(0,0,0,1)] mt-10">직접 만든 카드를 강화하세요.</p>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6 z-10 animate-slide-up bg-black/60 backdrop-blur-2xl border border-white/20 p-8 relative transition-all duration-300 hover:border-white/40 rounded-none">
        <HUDCorner />
        <div>
          <label className="block font-mono text-sm text-white/50 mb-3 tracking-widest font-light">아바타 선택</label>
          <div className="flex justify-between border-b border-white/10 pb-4">
            {ICONS_KEYS.map(iconName => (
              <div key={iconName} onClick={wrapClick(() => setSelectedIconName(iconName))} onMouseEnter={handleHover} className={`p-2 cursor-pointer transition-all duration-300 ${selectedIconName === iconName ? 'text-white border-b border-white scale-110' : 'text-white/30 hover:text-white/70 hover:scale-105'}`}>{getIcon(iconName)}</div>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-mono text-sm text-white/50 mb-2 tracking-widest font-light">닉네임</label>
          <input type="text" value={loginNickname} onChange={(e) => setLoginNickname(e.target.value.toUpperCase())} placeholder="닉네임 입력" maxLength={10} className="w-full p-3 bg-transparent border-b border-white/20 text-white font-sans text-lg focus:outline-none focus:border-white transition-all uppercase placeholder-white/20 rounded-none" required />
        </div>
        <div>
          <label className="block font-mono text-sm text-white/50 mb-2 tracking-widest font-light">비밀번호</label>
          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="비밀번호 (4자리 이상)" minLength={4} className="w-full p-3 bg-transparent border-b border-white/20 text-white font-sans text-lg focus:outline-none focus:border-white transition-all placeholder-white/20 rounded-none" required />
        </div>
        <button type="submit" disabled={isProcessing} onMouseEnter={handleHover} className="w-full py-4 bg-white/10 text-white font-light font-mono text-sm hover:bg-white hover:text-black disabled:opacity-50 transition-all uppercase tracking-widest mt-4 rounded-none">{isProcessing ? '초기화 중...' : '시스템 접속'}</button>
      </form>
    </div>
  );

  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-white/[0.01] backdrop-blur-3xl border-b border-white/10 p-5 px-8 flex justify-between items-center transition-all hover:bg-white/[0.03]">
      <div className="flex items-center gap-6">
        <h2 onClick={wrapClick(() => setCurrentView('lobby'))} onMouseEnter={handleHover} className="text-3xl font-black text-white cursor-pointer hover:opacity-70 transition-all font-logo tracking-[0.1em]">ROG CARD</h2>
        <span className="hidden md:flex text-white/30 text-xs font-mono items-center gap-1"><Users size={12}/> 접속 중: {onlineCount}명</span>
      </div>
      <div className="flex items-center gap-8 font-mono text-sm tracking-widest font-light">
        <button onClick={wrapClick(() => setCurrentView('shop'))} onMouseEnter={handleHover} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"><ShoppingCart size={16}/> 상점</button>
        <button onClick={wrapClick(() => setSoundEnabled(!soundEnabled))} className="hidden sm:flex text-white/50 hover:text-white transition-colors">{soundEnabled ? <span className="flex items-center gap-1"><Volume2 size={14}/> SOUND ON</span> : <span className="flex items-center gap-1"><VolumeX size={14}/> SOUND OFF</span>}</button>
        {userData && (<div className="flex items-center gap-6 cursor-pointer hover:opacity-80" onClick={wrapClick(()=>{setViewingProfileUserId(user.uid); setCurrentView('profile');})}><div className="flex items-center gap-2 text-white/70">{getIcon(userData.icon)} <span>{userData.nickname}</span></div><div className="text-white opacity-90 font-bold text-sm hidden sm:block">{formatMoney(userData.money)} GOLD</div></div>)}
      </div>
    </header>
  );

  const renderProfile = () => {
    const viewingUser = allUsers.find(u => u.userId === viewingProfileUserId);
    if (!viewingUser) return <div className="text-white">프로필을 불러올 수 없습니다.</div>;
    const viewingUserCards = allCards.filter(c => c.ownerId === viewingProfileUserId).sort((a,b) => b.level - a.level);
    const highestCard = viewingUserCards[0];
    const isMe = viewingUser.userId === user.uid;
    const achievements = checkAchievements(viewingUser, viewingUserCards);

    return (
      <div className="p-4 md:p-10 max-w-[1200px] mx-auto animate-fade-in relative z-10 w-full min-h-[80vh] flex flex-col">
        <div className="w-full flex justify-start mb-6"><button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button></div>
        
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center md:w-[350px]">
            <h3 className="text-white/50 font-mono text-sm tracking-widest mb-6 uppercase">대표 카드</h3>
            {highestCard ? <CardItem card={highestCard} className="w-full max-w-[320px] pointer-events-none" /> : <div className="w-full aspect-[2/3.1] border border-dashed border-white/20 bg-black/40 flex items-center justify-center text-white/30 font-mono text-sm rounded-none">카드가 없습니다.</div>}
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col gap-6 rounded-none">
              <HUDCorner />
              <div className="flex justify-between items-start border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/5 rounded-none border border-white/10">{getIcon(viewingUser.icon)}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-white font-mono tracking-widest">{viewingUser.nickname}</h2>
                    <p className="text-white/50 text-sm mt-1">가입일: {new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-bold font-mono text-xl">{formatMoney(viewingUser.money)} G</div>
                  <div className="text-white/50 font-mono text-sm">{viewingUser.wins} 승 / {viewingUser.losses} 패 ({viewingUser.wins+viewingUser.losses > 0 ? Math.round((viewingUser.wins/(viewingUser.wins+viewingUser.losses))*100) : 0}%)</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase">프로필 설명</h3>
                  {isMe && !isEditingProfileDesc && <button onClick={()=> {setIsEditingProfileDesc(true); setEditProfileDesc(viewingUser.profileDesc || '');}} className="text-white/30 hover:text-white"><Edit3 size={14}/></button>}
                </div>
                {isEditingProfileDesc ? (
                  <div className="flex gap-2">
                    <input type="text" value={editProfileDesc} onChange={e=>setEditProfileDesc(e.target.value)} maxLength={50} className="flex-1 bg-black/40 border border-white/20 p-2 text-white font-sans text-sm focus:border-white rounded-none" />
                    <button onClick={wrapClick(handleSaveProfileDesc)} className="px-4 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-mono rounded-none">저장</button>
                  </div>
                ) : (
                  <p className="text-white/80 font-sans bg-black/20 p-4 border border-white/5 rounded-none">{viewingUser.profileDesc || "자기소개가 아직 없습니다."}</p>
                )}
              </div>

              <div>
                <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase mb-3">달성한 업적 (클릭하여 확인)</h3>
                <div className="flex flex-wrap gap-2">
                  {achievements.length > 0 ? achievements.map((ach, i) => (
                    <button key={i} onClick={() => { playSfx('click'); setSelectedAchDesc(ach); }} className={`px-3 py-1.5 border font-mono text-xs rounded-none shadow-sm transition-colors ${selectedAchDesc === ach ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/20 text-white/70 hover:text-white'}`}>{ach}</button>
                  )) : <span className="text-white/30 text-xs font-mono">아직 달성한 업적이 없습니다.</span>}
                </div>
                {selectedAchDesc && (
                  <div className="mt-4 p-4 bg-black/40 border border-emerald-500/30 rounded-none animate-fade-in">
                    <span className="text-emerald-400 font-bold font-mono text-sm block mb-1">{selectedAchDesc}</span>
                    <span className="text-white/80 font-sans text-sm">{ACHIEVEMENTS_DATA[selectedAchDesc]}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex-1 flex flex-col min-h-[300px] rounded-none">
              <HUDCorner />
              <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase mb-4 flex items-center gap-2"><MessageSquare size={14}/> 방명록</h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {(viewingUser.guestbook || []).length > 0 ? viewingUser.guestbook.slice().reverse().map((gb, i) => (
                  <div key={i} className="bg-black/30 p-3 rounded-none border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-300 font-bold text-xs">{gb.writerName}</span>
                      <span className="text-white/30 text-[10px]">{new Date(gb.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-white/80 text-sm">{gb.text}</p>
                  </div>
                )) : <div className="text-center text-white/30 text-xs mt-10">첫 번째 방명록을 남겨보세요!</div>}
              </div>

              {!isMe && (
                <form onSubmit={(e) => handleAddGuestbook(e, viewingProfileUserId)} className="flex gap-2">
                  <input type="text" value={guestbookInput} onChange={e=>setGuestbookInput(e.target.value)} maxLength={100} placeholder={`${viewingUser.nickname}님에게 방명록 남기기...`} className="flex-1 bg-black/40 border border-white/20 p-3 text-white font-sans text-sm focus:outline-none focus:border-white transition-colors rounded-none" />
                  <button type="submit" className="px-4 bg-white/10 hover:bg-white hover:text-black text-white font-mono transition-colors rounded-none"><Send size={16}/></button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 새롭게 추가된 보유 카드 목록 섹션 */}
        <div className="mt-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative rounded-none">
          <HUDCorner />
          <h3 className="text-white/50 font-mono text-sm tracking-widest mb-6 uppercase flex items-center gap-2"><Hexagon size={16}/> 보유 자산 목록 ({viewingUserCards.length})</h3>
          {viewingUserCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {viewingUserCards.map(card => (
                <div key={card.id} className="cursor-pointer transition-transform hover:-translate-y-2" onClick={wrapClick(() => setPreviewCard(card))}>
                  <CardItem card={card} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/30 font-mono text-sm py-10">보유한 카드가 없습니다.</div>
          )}
        </div>

      </div>
    );
  };

  const renderLobby = () => {
    const userMaxLevels = {};
    allCards.forEach(c => {
      if (!userMaxLevels[c.ownerId] || c.level > userMaxLevels[c.ownerId]) {
        userMaxLevels[c.ownerId] = c.level;
      }
    });

    const topLevelUsers = [...allUsers].sort((a,b) => (userMaxLevels[b.userId] || 0) - (userMaxLevels[a.userId] || 0)).slice(0, 50);
    const topWins = [...allUsers].sort((a,b) => (b.wins || 0) - (a.wins || 0)).slice(0, 50);
    const richUsers = [...allUsers].sort((a,b) => (b.money || 0) - (a.money || 0)).slice(0, 50);
    
    const isAttended = userData?.lastAttendance === new Date().toISOString().split('T')[0];
    const topUser = rankingTab === 'level' ? topLevelUsers[0] : rankingTab === 'money' ? richUsers[0] : topWins[0];
    const topUserCard = topUser ? allCards.filter(c => c.ownerId === topUser.userId).sort((a,b) => b.level - a.level)[0] : null;
    const currentList = rankingTab === 'level' ? topLevelUsers : rankingTab === 'money' ? richUsers : topWins;

    return (
      <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in relative z-10 flex flex-col lg:flex-row gap-10 w-full h-full">
        <div className="w-full lg:w-[350px] flex flex-col gap-6 h-[80vh]">
           <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 flex flex-col h-[50%] relative transition-all hover:border-white/20 hover:bg-white/[0.04] rounded-none">
              <HUDCorner /><h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-4 uppercase">랭킹</h3>
              {topUserCard && (
                <div className="mb-4 flex gap-5 items-center bg-white/5 p-4 rounded-none border border-amber-500/30 shadow-lg cursor-pointer" onClick={wrapClick(() => { setViewingProfileUserId(topUser.userId); setCurrentView('profile'); })}>
                  <MiniCard card={topUserCard} />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-xs text-amber-400 font-mono tracking-widest mb-2 flex items-center gap-1"><Trophy size={12}/> RANK 1 ASSET</span>
                    <span className="text-lg font-bold text-white truncate">{topUserCard.name}</span>
                    <span className="text-sm text-white/50 font-mono mt-1 hover:underline">by {topUser.nickname}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mb-4 font-mono text-xs tracking-widest">
                <button onClick={wrapClick(()=>setRankingTab('level'))} className={`pb-1 ${rankingTab==='level' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>강화</button>
                <button onClick={wrapClick(()=>setRankingTab('win'))} className={`pb-1 ${rankingTab==='win' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>승리</button>
                <button onClick={wrapClick(()=>setRankingTab('money'))} className={`pb-1 ${rankingTab==='money' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>자산</button>
              </div>
              <div className="font-mono text-sm tracking-wide overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar">
                {currentList.map((u, i) => (
                  <div key={u.userId} className={`flex justify-between items-center pb-2 border-b border-white/5 ${u.userId === user?.uid ? 'text-white font-bold' : 'text-white/60'}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 opacity-30 text-xs">{String(i+1).padStart(2,'0')}</span> 
                      <span className="truncate w-24 cursor-pointer hover:text-emerald-300 transition-colors" onClick={wrapClick(()=>{setViewingProfileUserId(u.userId); setCurrentView('profile');})}>{u.nickname}</span>
                    </div>
                    <span>{rankingTab === 'level' ? `LV.${userMaxLevels[u.userId] || 0}` : rankingTab === 'money' ? formatMoney(u.money) : `${u.wins} W`}</span>
                  </div>
                ))}
              </div>
           </div>
           <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 flex flex-col h-[50%] relative overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.04] rounded-none">
              <HUDCorner /><h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-3 uppercase flex items-center gap-2">전체 채팅</h3>
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 font-mono text-xs mb-3 pr-2 custom-scrollbar">
                {globalChats.map((msg, i) => (
                  <div key={i} className="flex flex-col animate-slide-up">
                    {msg.sender !== 'SYSTEM' && <span className="mb-0.5 text-[10px] text-white/30">{msg.sender}</span>}
                    <span className={`break-words ${msg.sender === 'SYSTEM' ? 'text-amber-300 font-bold' : msg.sender === userData?.nickname ? 'text-emerald-300' : 'text-white/80'}`}>{msg.text}</span>
                  </div>
                ))}
                <div ref={el => el && el.scrollIntoView()} />
              </div>
              <form onSubmit={handleSendGlobalChat} className="flex gap-2 border-t border-white/10 pt-3">
                <input type="text" value={globalChatInput} onChange={e=>setGlobalChatInput(e.target.value)} className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white font-mono text-sm focus:outline-none focus:border-white placeholder-white/20 rounded-none" placeholder="메시지 입력..." />
                <button type="submit" className="text-white/50 hover:text-white font-mono text-xs">전송</button>
              </form>
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-6 relative">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 flex justify-between items-center relative transition-all hover:border-white/20 hover:bg-white/[0.04] rounded-none">
              <HUDCorner />
              <div><h3 className="font-mono font-light text-base text-white/70 tracking-widest mb-2 uppercase">일일 출석체크</h3><p className="font-sans text-base text-white/40 font-light">매일 출석해 골드를 수령하세요.</p></div>
              <button onClick={wrapClick(handleAttendance)} disabled={isAttended} className={`px-8 py-3 font-mono text-sm tracking-widest uppercase rounded-none ${isAttended ? 'text-white/20 border border-white/10' : 'bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black'}`}>{isAttended ? '수령 완료' : '수령'}</button>
            </div>
            
            <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 flex justify-between items-center relative transition-all hover:border-white/20 hover:bg-white/[0.04] rounded-none">
              <HUDCorner />
              <div><h3 className="font-mono font-light text-base text-white/70 tracking-widest mb-2 uppercase">골드 채굴하기</h3><p className="font-sans text-base text-white/40 font-light">클릭할 때마다 1 골드를 채굴합니다.</p></div>
              <button onClick={handleMineGold} className={`px-8 py-3 font-mono text-sm tracking-widest uppercase bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-transform active:scale-95 rounded-none`}>채굴</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative">
            <div onClick={wrapClick(() => setCurrentView('deck'))} className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04] rounded-none">
              <HUDCorner /><Hexagon size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
              <div className="relative z-10"><h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">카드 관리</h3><p className="font-sans text-base text-white/40 font-light">디지털 카드를 생성하고 한계를 돌파하세요.</p></div>
            </div>
            <div onClick={wrapClick(() => setCurrentView('battle_select'))} className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04] rounded-none">
              <HUDCorner /><Swords size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
              <div className="relative z-10"><h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">1:1 전투</h3><p className="font-sans text-base text-white/40 font-light">AI 및 타 유저와 대결하고 배팅하세요.</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShop = () => (
    <div className="p-4 md:p-10 max-w-6xl mx-auto animate-fade-in relative z-10 min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/20">
        <h2 className="text-3xl font-mono font-light text-white tracking-[0.2em] uppercase">시스템 상점</h2>
        <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/50 hover:text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30 hover:bg-white/[0.05] rounded-none">
          <HUDCorner /><ArrowUpCircle size={36} className="text-emerald-400 mb-6" strokeWidth={1} />
          <h3 className="font-mono font-light text-xl text-white mb-2">강화 확률 부스트</h3>
          <p className="text-base font-sans text-white/50 mb-6 flex-1">다음 강화 시 성공 확률을 10% 증가시킵니다.</p>
          <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
            <span className="font-mono text-white/40 text-sm">보유: {userData?.items?.boost || 0}</span>
            <button onClick={wrapClick(()=>handleBuyItem('boost', 50000, '확률 부스트'))} disabled={isProcessing} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black rounded-none">50,000 G</button>
          </div>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30 hover:bg-white/[0.05] rounded-none">
          <HUDCorner /><Shield size={36} className="text-blue-400 mb-6" strokeWidth={1} />
          <h3 className="font-mono font-light text-xl text-white mb-2">하락/파괴 보호권</h3>
          <p className="text-base font-sans text-white/50 mb-6 flex-1">강화 실패 시 등급 하락 및 파괴를 1회 막아줍니다.</p>
          <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
            <span className="font-mono text-white/40 text-sm">보유: {userData?.items?.protect || 0}</span>
            <button onClick={wrapClick(()=>handleBuyItem('protect', 150000, '하락/파괴 보호권'))} disabled={isProcessing} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black rounded-none">150,000 G</button>
          </div>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30 hover:bg-white/[0.05] rounded-none">
          <HUDCorner /><Plus size={36} className="text-amber-400 mb-6" strokeWidth={1} />
          <h3 className="font-mono font-light text-xl text-white mb-2">카드 슬롯 확장</h3>
          <p className="text-base font-sans text-white/50 mb-6 flex-1">보유 가능한 카드의 최대 개수를 1칸 늘립니다.</p>
          <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
            <span className="font-mono text-white/40 text-sm">현재: {userData?.maxSlots || 3} / 10</span>
            <button onClick={wrapClick(()=>handleBuyItem('slot', 50000, '카드 슬롯 확장'))} disabled={isProcessing || (userData?.maxSlots >= 10)} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black disabled:opacity-30 rounded-none">50,000 G</button>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-mono font-light text-white tracking-widest mb-6 uppercase border-b border-white/10 pb-2">프레임 스킨 (상세 정보에서 장착)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {id: 'frame_rust', name: '녹슨 고철', desc: '세월의 흔적이 묻은 앤틱 프레임', price: 10000, color: 'text-[#a1662f]'},
          {id: 'frame_hologram', name: '홀로그램 스캔라인', desc: '화려한 스캔라인 오버레이', price: 50000, color: 'text-cyan-300'},
          {id: 'frame_blood', name: '블러드 펄스', desc: '핏빛 쉐도우 효과', price: 100000, color: 'text-red-500'},
          {id: 'frame_obsidian', name: '옵시디언 엣지', desc: '고급스러운 다크 엣지 음영', price: 300000, color: 'text-gray-400'},
          {id: 'frame_gold', name: '골든 아우라', desc: '황금빛 프레임 & 글로우', price: 500000, color: 'text-yellow-400'},
          {id: 'frame_neon', name: '네온 사이버', desc: '시안/핑크 사이버펑크 네온', price: 1000000, color: 'text-pink-400'}
        ].map(f => (
          <div key={f.id} className="bg-white/[0.02] border border-white/10 p-5 flex items-center justify-between transition-colors hover:bg-white/[0.05] rounded-none">
            <div><div className={`${f.color} font-mono mb-1 text-sm font-bold`}>{f.name}</div><div className="text-xs text-white/50">{f.desc}</div></div>
            {userData?.frames?.includes(f.id) ? <button disabled className="px-4 py-2 bg-white/20 text-white/50 font-mono text-[10px] whitespace-nowrap rounded-none">보유 중</button> : <button onClick={()=>handleBuyItem(f.id, f.price, f.name)} className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black font-mono text-[10px] whitespace-nowrap rounded-none">{formatMoney(f.price)} G</button>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeck = () => {
    const maxSlots = userData?.maxSlots || 3;
    const renderSlots = Array.from({ length: maxSlots });

    return (
      <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in min-h-[80vh] relative z-10 flex flex-col">
        <div className="w-full flex justify-start mb-6">
          <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-6 border-b border-white/20">
          <div className="flex items-center gap-4"><h2 className="text-2xl font-mono font-light text-white tracking-[0.2em] uppercase">카드 관리</h2><span className="font-mono text-sm text-white/40 tracking-widest bg-white/5 px-3 py-1 border border-white/10 rounded-none">보유량: {myCards.length}/{maxSlots}</span></div>
          <div className="relative"><button onClick={wrapClick(() => setShowCreateModal(true))} className="flex items-center gap-3 px-6 py-3 text-white font-mono font-light text-sm transition-all uppercase hover:scale-105 bg-white/10 border border-white/20 hover:bg-white hover:text-black rounded-none"><Plus size={14} /> 신규 카드 생성 [-{formatMoney(CREATE_CARD_COST)} G]</button></div>
        </div>

        {myCards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 font-sans font-light text-xl text-white/40 bg-white/[0.01] border border-white/5 backdrop-blur-md rounded-none"><span className="mb-2">보유 중인 카드가 없습니다.</span><span>신규 카드를 생성하여 시작하세요.</span></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {renderSlots.map((_, i) => {
              const card = myCards[i];
              if (!card) return (<div key={`empty-${i}`} className="w-full aspect-[2/3.1] border-2 border-dashed border-white/10 bg-white/[0.01] rounded-none flex flex-col items-center justify-center text-white/20 font-mono text-sm"><Plus size={24} className="mb-2 opacity-50"/><span>EMPTY SLOT</span></div>);
              return (
                <div key={card.id} className="relative group">
                  <CardItem card={card} />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-md z-20 p-5 rounded-none">
                    <button onClick={wrapClick(() => { setSelectedCard(card); setCurrentView('card_details'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105 rounded-none"><Info size={14} className="inline mr-1"/> 상세 정보</button>
                    <button onClick={wrapClick(() => { setSelectedCard(card); setCurrentView('enhance'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105 rounded-none">카드 강화</button>
                    <button onClick={wrapClick(() => startAIBattleSetup(card))} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105 rounded-none">전투 참가</button>
                    <button onClick={wrapClick(() => handleSellCard(card))} className="w-full py-2 mt-2 text-white/50 bg-transparent font-mono text-[10px] underline hover:text-white hover:scale-105 rounded-none">카드 판매</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in overflow-y-auto">
            <form onSubmit={handleCreateCard} className="bg-white/[0.02] border border-white/10 p-6 sm:p-10 w-full max-w-md relative animate-slide-up bg-black/40 rounded-none">
              <HUDCorner /><h3 className="font-mono font-light text-xl text-white mb-8 tracking-widest uppercase">신규 카드 생성</h3>
              {!cropImage ? (
                <div className="mb-8 w-full"><input type="file" accept="image/*" onChange={handleFileChange} className="w-full font-mono text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:bg-transparent file:text-white cursor-pointer p-2 border-b border-white/20 rounded-none" required /></div>
              ) : (
                <div className="mb-8 w-full flex flex-col items-center gap-4">
                  <div className="relative w-[200px] h-[310px] bg-black border border-white/20 overflow-hidden cursor-move touch-none shrink-0" onMouseDown={handleCropPointerDown} onMouseMove={handleCropPointerMove} onMouseUp={handleCropPointerUp} onMouseLeave={handleCropPointerUp} onTouchStart={handleCropPointerDown} onTouchMove={handleCropPointerMove} onTouchEnd={handleCropPointerUp}>
                    <img ref={imgRef} src={cropImage} alt="crop" className="absolute max-w-none pointer-events-none" onLoad={() => { setImgLoaded(true); setCropPan({x:0, y:0}); }} style={{ width: imgLoaded && imgRef.current ? `${imgRef.current.naturalWidth * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom}px` : 'auto', height: imgLoaded && imgRef.current ? `${imgRef.current.naturalHeight * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom}px` : 'auto', left: imgLoaded && imgRef.current ? `${100 - (imgRef.current.naturalWidth * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom)/2 + cropPan.x}px` : '0px', top: imgLoaded && imgRef.current ? `${155 - (imgRef.current.naturalHeight * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom)/2 + cropPan.y}px` : '0px' }} />
                  </div>
                  <input type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={handleZoomChange} className="w-[200px] accent-emerald-400 h-1 bg-white/20 appearance-none cursor-pointer mt-2" />
                  <button type="button" onClick={() => setCropImage(null)} className="text-white/50 text-xs font-mono underline hover:text-white mt-1">다른 이미지 선택</button>
                </div>
              )}
              <div className="mb-6"><label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">이름 (최대 10자)</label><input type="text" name="cardName" maxLength="10" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-sans text-lg focus:border-white uppercase rounded-none" required /></div>
              <div className="mb-10"><label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">설명 (최대 60자)</label><textarea name="cardDescription" maxLength="60" rows="3" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-sans text-base focus:border-white resize-none rounded-none" placeholder="카드의 기원 기록"></textarea></div>
              <div className="flex gap-4"><button type="button" onClick={wrapClick(() => setShowCreateModal(false))} className="flex-1 py-4 border border-white/20 text-white/50 font-mono text-sm uppercase hover:text-white rounded-none">취소</button><button type="submit" disabled={isProcessing} className="flex-1 py-4 bg-white/10 text-white border border-white/20 font-mono text-sm uppercase hover:bg-white hover:text-black disabled:opacity-30 rounded-none">{isProcessing ? '처리 중...' : '확인 및 생성'}</button></div>
            </form>
          </div>
        )}
      </div>
    );
  };

  const renderCardDetails = () => {
    if (!selectedCard) return null;
    const framesList = [
      { id: 'frame_rust', name: '녹슨 고철', desc: '세월의 흔적이 묻은 앤틱 프레임' }, { id: 'frame_hologram', name: '홀로그램 스캔라인', desc: '화려한 스캔라인 오버레이' }, { id: 'frame_blood', name: '블러드 펄스', desc: '핏빛 쉐도우 효과' },
      { id: 'frame_obsidian', name: '옵시디언 엣지', desc: '고급스러운 다크 엣지 음영' }, { id: 'frame_gold', name: '골든 아우라', desc: '황금빛 프레임 효과' }, { id: 'frame_neon', name: '네온 사이버', desc: '사이버펑크 네온 효과' }
    ];

    return (
      <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
        <div className="w-full flex justify-start mb-8"><button onClick={wrapClick(() => setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button></div>
        <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full">
          <div className="w-64 md:w-80 lg:w-[360px]"><CardItem card={selectedCard} className="pointer-events-none" /></div>
          <div className="flex-1 w-full flex flex-col gap-8">
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative rounded-none">
              <HUDCorner /><h4 className="font-mono text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">카드 상세 정보</h4>
              <div className="flex flex-col gap-6">
                <div><span className="font-mono text-xs text-white/40 block mb-1">DESIGNATION</span><div className="flex items-center gap-4"><span className="font-sans font-bold text-3xl text-white">{selectedCard.name}</span>{selectedCard.uniqueTrait && <span className={`px-2 py-1 border text-sm font-mono font-bold whitespace-nowrap rounded-none ${TRAIT_COLORS[selectedCard.uniqueTrait.name] || 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}>{selectedCard.uniqueTrait.name}</span>}</div></div>
                <div><span className="font-mono text-xs text-white/40 block mb-1">DESCRIPTION</span><span className="font-sans text-base text-white/80 block bg-black/20 p-3 rounded-none border border-white/5">"{selectedCard.description}"</span></div>
                {selectedCard.uniqueTrait && <div><span className="font-mono text-xs text-white/40 block mb-1">UNIQUE TRAIT</span><span className={`font-sans text-base block p-3 border rounded-none ${TRAIT_COLORS[selectedCard.uniqueTrait.name] ? TRAIT_COLORS[selectedCard.uniqueTrait.name] : 'bg-emerald-900/20 border-emerald-500/20 text-emerald-300'}`}>{selectedCard.uniqueTrait.desc}</span></div>}
                <div>
                  <span className="font-mono text-xs text-white/40 block mb-3">ACQUIRED SKILLS (클릭하여 설명 확인)</span>
                  <div className="flex flex-wrap gap-2">{selectedCard.unlockedSkills.length > 0 ? selectedCard.unlockedSkills.map(s => (<button key={s} onClick={() => { playSfx('click'); setSelectedSkillDesc(s); }} className={`px-3 py-1.5 font-mono text-sm border rounded-none transition-colors duration-300 ${selectedSkillDesc === s ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>{s}</button>)) : <span className="text-white/30 font-mono text-sm">보유 스킬 없음</span>}</div>
                  {selectedSkillDesc && (<div className="mt-4 p-4 bg-black/40 border border-emerald-500/30 rounded-none animate-fade-in"><span className="text-emerald-400 font-bold font-mono text-base block mb-1">{selectedSkillDesc}</span><span className="text-white/80 font-sans text-base">{SKILLS_DATA[selectedSkillDesc]}</span></div>)}
                </div>
              </div>
            </div>
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative rounded-none">
              <HUDCorner /><h4 className="font-mono text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">프레임 장착</h4>
              <div className="flex flex-col gap-3 font-mono text-sm h-64 overflow-y-auto custom-scrollbar pr-2">
                {framesList.map(frame => {
                  const isOwned = userData?.frames?.includes(frame.id);
                  const isEquipped = selectedCard.equippedFrame === frame.id;
                  return (
                    <div key={frame.id} className={`flex items-center justify-between p-4 border border-white/10 rounded-none ${isEquipped ? 'border-emerald-500/50 bg-emerald-500/10' : 'bg-black/40'}`}>
                      <div className="flex flex-col gap-1"><span className={`font-bold text-base ${isEquipped ? 'text-emerald-400' : 'text-white'}`}>{frame.name}</span><span className="text-white/40 text-xs">{frame.desc}</span></div>
                      <div>{!isOwned ? <span className="text-white/30 text-xs bg-white/5 px-3 py-1.5 rounded-none border border-white/10">미보유</span> : isEquipped ? <button onClick={wrapClick(() => handleEquipCardFrame(null))} disabled={isProcessing} className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-none hover:bg-red-500 hover:text-white">해제</button> : <button onClick={wrapClick(() => handleEquipCardFrame(frame.id))} disabled={isProcessing} className="px-5 py-2.5 bg-white/10 text-white rounded-none hover:bg-white hover:text-black">장착</button>}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEnhancement = () => {
    if (!selectedCard) return null;
    const isMax = selectedCard.level >= 20;
    const nextRule = !isMax ? ENHANCEMENT_RULES[selectedCard.level + 1] : null;
    const cost = !isMax ? COST_BY_LEVEL[selectedCard.level + 1] : 0;
    
    let effectClass = "";
    if (enhanceVisualState === 'charging_fast') effectClass = "animate-shake pointer-events-none brightness-125 scale-[1.02] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]";
    else if (enhanceVisualState === 'charging_tension') effectClass = "animate-tension-shake pointer-events-none brightness-150 saturate-150 scale-[1.05] drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]";
    else if (enhanceVisualState.startsWith('success')) { const lvl = parseInt(enhanceVisualState.split('_')[1]); effectClass = lvl >= 15 ? "animate-flash-bang drop-shadow-[0_0_50px_rgba(0,255,255,1)] scale-110" : lvl >= 10 ? "animate-flash-bang drop-shadow-[0_0_30px_rgba(255,255,0,0.8)] scale-[1.05]" : "animate-flash-bang drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"; }
    else if (enhanceVisualState === 'fail') effectClass = "animate-shake grayscale brightness-50";
    else if (enhanceVisualState === 'destroyed') effectClass = "animate-shatter opacity-0";

    return (
      <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
        {enhanceVisualState.startsWith('success') && parseInt(enhanceVisualState.split('_')[1]) >= 8 && <div className="absolute inset-0 bg-white/20 animate-flash-white pointer-events-none z-0"></div>}
        <div className="w-full flex justify-start mb-8"><button onClick={wrapClick(() => setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button></div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full">
          <div className="w-full lg:w-1/3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative order-2 lg:order-1 rounded-none">
            <HUDCorner /><h4 className="font-mono font-light text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">카드 능력치</h4>
            <div className="space-y-4 font-mono text-base tracking-widest font-light">
              <div className="flex justify-between"><span>HP</span> <span className="text-white font-bold">{selectedCard.stats.hp}</span></div>
              <div className="flex justify-between"><span>ATK</span> <span className="text-white font-bold">{selectedCard.stats.atk}</span></div>
              <div className="flex justify-between"><span>DEF</span> <span className="text-white font-bold">{selectedCard.stats.def}%</span></div>
              <div className="flex justify-between"><span>SPD</span> <span className="text-white font-bold">{selectedCard.stats.spd}</span></div>
              <div className="flex justify-between"><span>CRT</span> <span className="text-white font-bold">{selectedCard.stats.crit}%</span></div>
              <div className="flex justify-between border-t border-white/10 pt-4"><span className="text-white/60">행운 보너스</span> <span className="text-emerald-400 font-bold">+{(selectedCard.stats.luck * 0.3).toFixed(1)}%</span></div>
            </div>
          </div>
          <div className="w-64 md:w-80 lg:w-[360px] order-1 lg:order-2 flex flex-col items-center relative">
            <div className={`transition-all duration-300 w-full ${effectClass}`}>{enhanceVisualState !== 'destroyed' && <CardItem card={selectedCard} className="pointer-events-none" />}{enhanceVisualState.startsWith('success') && <div className="absolute inset-0 bg-white/50 mix-blend-overlay animate-flash-bang pointer-events-none rounded-none"></div>}</div>
          </div>
          <div className="w-full lg:w-1/3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative order-3 flex flex-col justify-center min-h-[300px] rounded-none">
            <HUDCorner />
            {isMax ? (<div className="text-center text-white font-mono font-light text-2xl tracking-[0.2em] uppercase">최대 성능 도달</div>) : (
              <>
                <div className="text-center mb-6 flex items-center justify-center gap-6 font-mono tracking-widest"><span className="text-white/30 text-xl font-light">LV.{selectedCard.level}</span><ArrowRight className="text-white/20" size={20}/><span className="text-3xl font-bold text-white drop-shadow-md">LV.{selectedCard.level + 1}</span></div>
                <div className="w-full mb-6 font-mono text-xs tracking-widest">
                  <div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={useBoost} onChange={()=>setUseBoost(!useBoost)} disabled={!(userData?.items?.boost > 0)} className="accent-white cursor-pointer"/><span className={userData?.items?.boost > 0 ? "text-white" : "text-white/30"}>부스트 사용 (보유: {userData?.items?.boost || 0})</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={useProtect} onChange={()=>setUseProtect(!useProtect)} disabled={!(userData?.items?.protect > 0) || nextRule.onFail === 'keep'} className="accent-white cursor-pointer"/><span className={userData?.items?.protect > 0 && nextRule.onFail !== 'keep' ? "text-white" : "text-white/30"}>보호권 사용 (보유: {userData?.items?.protect || 0})</span></div>
                </div>
                <div className="w-full mb-8 font-mono text-sm tracking-widest font-light">
                  <div className="flex justify-between mb-4 text-white/50"><span>기본 확률</span><span>{nextRule.successRate}%</span></div>
                  <div className="flex justify-between text-white border-t border-white/10 pt-4"><span>현재 확률</span><span className={useBoost ? "text-emerald-400 font-bold" : ""}>{Math.min(99, (nextRule.successRate + selectedCard.stats.luck * 0.3 + (useBoost?10:0))).toFixed(1)}%</span></div>
                </div>
                <div className="w-full mb-10 font-mono text-xs tracking-widest p-4 border border-white/5 bg-black/20 rounded-none">
                  <span className="text-white/40 block mb-3 uppercase">실패 시:</span>
                  {(nextRule.onFail === 'keep' || useProtect) && <span className="text-white/80">안전 (등급 유지) {useProtect && <span className="text-emerald-400 font-bold">[보호됨]</span>}</span>}
                  {(nextRule.onFail === 'down' && !useProtect) && <span className="text-white/80">등급 하락 -{nextRule.levelDownOnFail}</span>}
                  {(nextRule.onFail === 'mixed' && !useProtect) && (<div className="space-y-2"><span className="text-white/80 block">등급 하락 -{nextRule.levelDownOnFail} ({100-nextRule.destroyChance}%)</span><span className="text-red-500 font-bold block animate-pulse">카드 영구 파괴 ({nextRule.destroyChance}%)</span></div>)}
                </div>
                <button onClick={wrapClick(() => handleEnhance(selectedCard))} disabled={isProcessing || enhanceVisualState !== 'idle'} className="w-full py-4 bg-white/10 border border-white/20 text-white font-mono text-sm uppercase hover:bg-white hover:text-black disabled:opacity-30 rounded-none">카드 강화 [ -{formatMoney(cost)} GOLD ]</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBattleSelect = () => (
    <div className="p-4 md:p-10 max-w-5xl mx-auto animate-fade-in relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
      <h2 className="text-3xl font-mono font-light text-white mb-16 tracking-[0.2em] uppercase drop-shadow-md">전투 모드 선택</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div onClick={wrapClick(() => { if(myCards.length === 0) { showToast("보유한 카드가 없습니다", "error"); return; } startAIBattleSetup(myCards[0]); })} className="group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 cursor-pointer text-center flex flex-col items-center hover:bg-white/[0.05] hover:-translate-y-2 transition-all rounded-none">
          <HUDCorner /><Cpu size={48} strokeWidth={1} className="text-white/30 group-hover:text-white mb-8 transition-colors group-hover:scale-110" />
          <h3 className="text-xl font-mono font-light text-white mb-3 tracking-widest uppercase">AI와 대전하기</h3>
          <p className="text-white/40 text-base font-sans font-light">가상 적들과 대결하여 골드를 벌어보세요.</p>
        </div>
        <div onClick={wrapClick(() => { if(myCards.length === 0) { showToast("보유한 카드가 없습니다", "error"); return; } if(!selectedCard) setSelectedCard(myCards[0]); setCurrentView('pvp_setup'); })} className="group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 cursor-pointer text-center flex flex-col items-center hover:bg-white/[0.05] hover:-translate-y-2 transition-all rounded-none">
          <HUDCorner /><User size={48} strokeWidth={1} className="text-white/30 group-hover:text-white mb-8 transition-colors group-hover:scale-110" />
          <h3 className="text-xl font-mono font-light text-white mb-3 tracking-widest uppercase">유저와 대결하기</h3>
          <p className="text-white/40 text-base font-sans font-light">방을 개설하고 실시간으로 대결하세요.</p>
        </div>
      </div>
      <button onClick={wrapClick(() => setCurrentView('lobby'))} className="mt-16 text-white/30 hover:text-white font-mono text-sm tracking-widest uppercase transition-colors">뒤로 가기</button>
    </div>
  );

  const renderPvPSetup = () => (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <h2 className="text-3xl font-mono font-light tracking-[0.2em] text-white mb-12 uppercase">유저와 대결하기</h2>
      <div className="w-full max-w-6xl mb-12">
        <h3 className="text-white/50 font-mono text-xs tracking-widest mb-6 text-center uppercase">출전 카드 선택</h3>
        <div className="flex overflow-x-auto gap-4 pb-6 pt-8 px-2 custom-scrollbar">
          {myCards.map(card => (
            <div key={card.id} className="min-w-[140px] max-w-[140px] md:min-w-[160px] md:max-w-[160px] flex-shrink-0 cursor-pointer" onClick={wrapClick(() => setSelectedCard(card))}><CardItem card={card} className={`transition-all duration-300 ${selectedCard?.id === card.id ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-100'}`} /></div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <div className="flex-[2] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col min-h-[300px] rounded-none">
          <HUDCorner /><h3 className="text-base font-mono font-light text-white mb-6 tracking-widest uppercase">활성화된 대기방</h3>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {activeRooms.length === 0 ? (<div className="text-center text-white/30 font-mono text-sm mt-10">생성된 방이 없습니다.</div>) : (
              activeRooms.map(room => (
                <div key={room.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center rounded-none">
                  <div className="flex flex-col flex-1 min-w-0 pr-4"><span className="font-mono text-white text-base truncate">{room.roomName}</span><span className="font-mono text-xs text-white/50 truncate">Host: {room.host.nickname}</span></div>
                  <div className="flex items-center gap-4 whitespace-nowrap"><span className="font-mono text-amber-400 text-sm">{formatMoney(room.bet)} G</span><button onClick={wrapClick(() => handleJoinPvPRoom(room.id))} disabled={!selectedCard} className="px-4 py-2 bg-white/10 text-white font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-30 rounded-none">참가</button></div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col rounded-none">
          <HUDCorner /><h3 className="text-base font-mono font-light text-white mb-8 tracking-widest uppercase">새로운 방 개설</h3>
          <label className="text-white/40 text-xs font-mono mb-2 tracking-widest uppercase">방 이름</label>
          <input type="text" value={pvpRoomName} onChange={(e) => setPvpRoomName(e.target.value)} placeholder={`${userData.nickname}의 방`} maxLength={15} className="w-full bg-transparent border-b border-white/30 p-2 text-white font-mono text-base focus:border-white focus:outline-none mb-8 placeholder-white/20 transition-colors rounded-none" />
          <label className="text-white/40 text-xs font-mono mb-2 tracking-widest uppercase">배팅 금액 (GOLD)</label>
          <input type="number" value={battleBet} onChange={(e) => setBattleBet(Number(e.target.value))} min="1000" max={userData.money} step="1000" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-mono text-xl focus:border-white focus:outline-none mb-10 transition-colors rounded-none" />
          <button onClick={wrapClick(handleCreatePvPRoom)} disabled={isProcessing || !selectedCard} className="mt-auto py-4 bg-white/10 text-white font-mono text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all disabled:opacity-30 rounded-none">개설 및 대기</button>
        </div>
      </div>
      <button onClick={wrapClick(() => setCurrentView('battle_select'))} className="mt-16 text-white/30 hover:text-white font-mono text-sm tracking-widest uppercase transition-colors">뒤로 가기</button>
    </div>
  );

  const renderPvPRoom = () => {
    if (!pvpRoomData) return null;
    const isHost = pvpRoomData.host.uid === user.uid;
    const opponent = isHost ? pvpRoomData.guest : pvpRoomData.host;
    const myMatchCard = isHost ? pvpRoomData.hostCard : pvpRoomData.guestCard;
    const oppMatchCard = isHost ? pvpRoomData.guestCard : pvpRoomData.hostCard;
    const isReady = pvpRoomData.status === 'ready';

    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
          <div className="flex-[2] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 relative flex flex-col items-center transition-all duration-500 hover:border-white/20 rounded-none">
            <HUDCorner /><h2 className="text-base font-mono text-white/50 mb-12 uppercase">{pvpRoomData.roomName} <span className="text-xs">({pvpRoomId})</span></h2>
            <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-center mb-16">
              <div className="flex flex-col items-center w-56"><span className="text-white/70 font-mono text-sm mb-4">{userData.nickname}</span><CardItem card={myMatchCard} /></div>
              <div className="flex flex-col items-center gap-4"><div className="text-white/40 text-xs tracking-[0.2em] font-mono">TOTAL WAGER</div><div className="text-amber-400 font-mono font-bold text-3xl bg-white/5 px-6 py-3 rounded-none border border-amber-500/30 whitespace-nowrap">{formatMoney(pvpRoomData.bet * 2)} GOLD</div></div>
              <div className="flex flex-col items-center w-56"><span className="text-white/70 font-mono text-sm mb-4">{opponent ? opponent.nickname : '대기 중...'}</span><CardItem card={oppMatchCard} className={!oppMatchCard ? 'opacity-30 grayscale' : ''} /></div>
            </div>
            {isHost ? (<button onClick={wrapClick(handleStartPvPBattle)} disabled={!isReady} className="w-full max-w-md py-4 bg-white text-black font-mono text-base hover:bg-white/80 disabled:opacity-30 font-bold uppercase tracking-[0.2em] rounded-none">{isReady ? '전투 시작' : '상대 대기 중...'}</button>) : (<div className="w-full max-w-md py-4 border border-white/20 text-white/40 text-center font-mono text-sm uppercase tracking-[0.2em] rounded-none">호스트의 시작 대기 중...</div>)}
            <button onClick={wrapClick(async () => { if (isHost) { try { await deleteDoc(doc(db, MATCHES_PATH, pvpRoomId)); } catch(e){} } setPvpRoomId(null); setCurrentView('lobby'); })} className="mt-8 text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors">방 나가기</button>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 relative flex flex-col overflow-hidden h-[400px] lg:h-[550px] rounded-none">
            <HUDCorner />
            <div className="p-5 border-b border-white/10 font-mono font-light text-sm text-white/50 tracking-widest uppercase flex justify-center gap-2"><MessageSquare size={16} /> 통신 채널</div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 font-mono text-xs custom-scrollbar">
              {pvpRoomData.chat.map((msg, i) => (<div key={i} className={`flex flex-col ${msg.sender === userData.nickname ? 'items-end' : 'items-start'} animate-slide-up`}><span className="text-[10px] text-white/30 mb-1">{msg.sender}</span><div className={`px-4 py-2 ${msg.sender === userData.nickname ? 'bg-white/10 text-white' : 'border border-white/10 text-white/70'} max-w-[90%] break-words rounded-none`}>{msg.text}</div></div>))}
              <div ref={el => el && el.scrollIntoView()} />
            </div>
            <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 flex gap-3"><input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} className="flex-1 bg-transparent border-b border-white/20 px-2 py-2 text-white font-mono text-sm focus:outline-none focus:border-white transition-colors placeholder-white/20 rounded-none" placeholder="메시지 입력" /><button type="submit" className="text-white/50 hover:text-white font-mono text-xs tracking-widest uppercase">전송</button></form>
          </div>
        </div>
      </div>
    );
  };

  const renderBattleAISetup = () => {
    if (!selectedCard || !aiOpponent) { if(myCards.length > 0) startAIBattleSetup(myCards[0]); return null; }
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
        <h2 className="text-3xl font-mono font-light tracking-[0.2em] text-white mb-12 uppercase">AI 교전 준비</h2>
        <div className="w-full max-w-5xl mb-8">
          <h3 className="text-white/50 font-mono text-xs tracking-widest mb-4 text-center uppercase">출전 카드 변경</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 pt-8 px-2 custom-scrollbar">
            {myCards.map(card => (<div key={card.id} className="min-w-[140px] max-w-[140px] md:min-w-[160px] md:max-w-[160px] flex-shrink-0 cursor-pointer" onClick={wrapClick(() => startAIBattleSetup(card))}><CardItem card={card} className={`transition-all duration-300 ${selectedCard?.id === card.id ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-100'}`} /></div>))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-5xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 relative transition-all rounded-none">
          <HUDCorner />
          <div className="flex flex-col items-center flex-1"><h3 className="text-white/50 font-mono text-xs tracking-widest mb-6 uppercase">아군 자산</h3><div className="w-56"><CardItem card={selectedCard} /></div></div>
          <div className="flex flex-col items-center flex-1 w-full min-w-[300px]">
            <div className="text-white/40 text-xs tracking-[0.2em] font-mono mb-2">EXPECTED REWARD</div>
            <div className="text-amber-400 font-mono font-bold text-3xl bg-white/5 px-6 py-3 rounded-none border border-amber-500/30 mb-8 whitespace-nowrap">{formatMoney(battleReward)} GOLD</div>
            <div className="w-full text-center"><button onClick={wrapClick(executeAIBattle)} onMouseEnter={handleHover} className="w-full py-4 bg-white/10 border border-white/20 text-white font-mono text-sm hover:bg-white hover:text-black transition-all uppercase font-bold rounded-none">교전 시작</button></div>
            <button onClick={wrapClick(() => setCurrentView('battle_select'))} className="mt-10 text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors">뒤로 가기</button>
          </div>
          <div className="flex flex-col items-center flex-1"><h3 className="text-white/50 font-mono text-xs tracking-widest mb-6 uppercase flex items-center gap-2"><Crosshair size={14} strokeWidth={1}/> 적대 자산 (AI)</h3><div className="w-56"><CardItem card={aiOpponent} /></div></div>
        </div>
      </div>
    );
  };

  const renderBattle = () => {
    if (!liveState) return null;
    const p1HpPercent = Math.max(0, (liveState.p1Hp / liveState.p1Max) * 100);
    const p2HpPercent = Math.max(0, (liveState.p2Hp / liveState.p2Max) * 100);
    const action = liveState.currentAction;
    const isP1Acting = action?.actor === 'p1' || action?.attacker === 'p1';
    const isP2Acting = action?.actor === 'p2' || action?.attacker === 'p2';
    const isP1Hit = action?.defender === 'p1';
    const isP2Hit = action?.defender === 'p2';
    const stepParity = battleStep % 2;
    let p1Anim = ''; let p2Anim = '';

    if (isP1Acting) {
        if (action?.type === 'dodge') p1Anim = `animate-dodge-left-${stepParity}`;
        else if (action?.type === 'skill') p1Anim = `animate-skill-charge-${stepParity}`;
        else p1Anim = `animate-attack-right-${stepParity}`;
    } else if (isP1Hit) {
        if (action?.type === 'critical') p1Anim = `animate-hit-heavy-${stepParity}`;
        else p1Anim = `animate-hit-light-${stepParity}`;
    }
    if (isP2Acting) {
        if (action?.type === 'dodge') p2Anim = `animate-dodge-right-${stepParity}`;
        else if (action?.type === 'skill') p2Anim = `animate-skill-charge-${stepParity}`;
        else p2Anim = `animate-attack-left-${stepParity}`;
    } else if (isP2Hit) {
        if (action?.type === 'critical') p2Anim = `animate-hit-heavy-${stepParity}`;
        else p2Anim = `animate-hit-light-${stepParity}`;
    }

    return (
      <div className="min-h-[85vh] flex flex-col p-4 max-w-6xl mx-auto relative overflow-hidden animate-fade-in z-10 w-full">
        {action?.type === 'critical' && <div key={`flash-${battleStep}`} className="absolute inset-0 bg-red-600/40 animate-flash-red pointer-events-none z-0 mix-blend-color-burn"></div>}
        
        <div className="flex justify-between items-center gap-8 mb-16 mt-6 font-mono border-b border-white/10 pb-8 z-10">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm tracking-widest mb-2 font-bold uppercase text-white/80"><span>{battleType === 'PvP' ? pvpRoomData?.hostCard.name : selectedCard.name}</span><span className="text-white drop-shadow-[0_0_5px_#fff]">{Math.ceil(liveState.p1Hp)} <span className="text-xs text-white/50">/ {liveState.p1Max}</span></span></div>
            <div className="h-6 bg-white/5 relative overflow-hidden border border-white/20 p-0.5 rounded-none"><div className={`h-full transition-all duration-300 ease-out ${p1HpPercent > 50 ? 'bg-emerald-400' : p1HpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} style={{width: `${p1HpPercent}%`}}></div></div>
          </div>
          <div className="text-2xl font-light text-white/20 tracking-[0.2em] font-mono">VS</div>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm tracking-widest mb-2 font-bold uppercase text-white/80"><span className="text-white drop-shadow-[0_0_5px_#fff]">{Math.ceil(liveState.p2Hp)} <span className="text-xs text-white/50">/ {liveState.p2Max}</span></span><span>{battleType === 'PvP' ? pvpRoomData?.guestCard.name : aiOpponent.name}</span></div>
            <div className="h-6 bg-white/5 relative overflow-hidden flex justify-end border border-white/20 p-0.5 rounded-none"><div className={`h-full transition-all duration-300 ease-out ${p2HpPercent > 50 ? 'bg-emerald-400' : p2HpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} style={{width: `${p2HpPercent}%`}}></div></div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center gap-16 md:gap-40 relative z-10 perspective-1000">
          <div className={`transition-all duration-100 ${p1Anim} ${liveState.p1Hp <= 0 ? 'opacity-20 grayscale blur-[2px]' : ''} relative`}>
             <div className="w-48 md:w-64 shadow-[0_0_30px_rgba(0,0,0,1)]"><CardItem card={battleType === 'PvP' ? pvpRoomData?.hostCard : selectedCard} /></div>
             {isP1Hit && action?.damage > 0 && (<div key={`dmg-p1-${battleStep}`} className={`absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap ${action?.type === 'critical' ? 'animate-floating-crit-dmg text-7xl font-black text-red-500' : 'animate-floating-dmg text-5xl font-bold text-white'}`}>-{action.damage}</div>)}
             {action?.type === 'dodge' && action?.actor === 'p1' && <div key={`dodge-p1-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black italic text-cyan-400 animate-float-up pointer-events-none z-50">EVADED!</div>}
             {action?.type === 'skill' && action?.actor === 'p1' && <div key={`skill-p1-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-skill-text text-4xl font-black text-cyan-400 whitespace-nowrap">{action.skill}</div>}
             {action?.type === 'heal' && action?.actor === 'p1' && <div key={`heal-p1-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-floating-heal text-4xl font-black whitespace-nowrap">+{action.heal}</div>}
          </div>
          <div className={`transition-all duration-100 ${p2Anim} ${liveState.p2Hp <= 0 ? 'opacity-20 grayscale blur-[2px]' : ''} relative`}>
             <div className="w-48 md:w-64 shadow-[0_0_30px_rgba(0,0,0,1)]"><CardItem card={battleType === 'PvP' ? pvpRoomData?.guestCard : aiOpponent} /></div>
             {isP2Hit && action?.damage > 0 && (<div key={`dmg-p2-${battleStep}`} className={`absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap ${action?.type === 'critical' ? 'animate-floating-crit-dmg text-7xl font-black text-red-500' : 'animate-floating-dmg text-5xl font-bold text-white'}`}>-{action.damage}</div>)}
             {action?.type === 'dodge' && action?.actor === 'p2' && <div key={`dodge-p2-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold italic text-cyan-400 animate-float-up pointer-events-none z-50">EVADED!</div>}
             {action?.type === 'skill' && action?.actor === 'p2' && <div key={`skill-p2-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-skill-text text-4xl font-black text-red-400 whitespace-nowrap">{action.skill}</div>}
             {action?.type === 'heal' && action?.actor === 'p2' && <div key={`heal-p2-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-floating-heal text-4xl font-black whitespace-nowrap">+{action.heal}</div>}
          </div>
        </div>

        {battleResult && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in">
            <div className="bg-transparent border border-white/20 p-12 text-center max-w-lg w-full relative rounded-none">
              <HUDCorner />
              <h2 className={`font-sans font-black text-5xl tracking-[0.2em] mb-8 uppercase ${battleResult==='win'?'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]':'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>{battleResult === 'win' ? 'VICTORY' : 'DEFEAT'}</h2>
              <div className="text-base mb-12 font-mono tracking-widest text-white/50 uppercase bg-white/5 p-4 rounded-none border border-white/10"><p className={battleResult==='win' ? 'text-emerald-400 font-bold' : ''}>{battleResult==='win' ? `자금 획득: +${formatMoney(battleType === 'AI' ? battleReward : battleBet * 2)} GOLD` : `자금 손실: -${formatMoney(battleType === 'AI' ? 0 : battleBet)} GOLD`}</p></div>
              <button onClick={wrapClick(() => { setPvpRoomId(null); setCurrentView('lobby'); })} className="w-full py-4 bg-white/10 text-white hover:bg-white hover:text-black transition-all font-mono text-sm uppercase font-bold rounded-none">시스템 복귀</button>
            </div>
          </div>
        )}

        <div className="h-40 mt-10 overflow-y-auto flex flex-col justify-end font-mono text-[12px] tracking-widest text-white/40 border-t border-white/10 pt-4 custom-scrollbar z-10 bg-black/40 rounded-none px-4 transition-all hover:bg-black/60">
          {battleLog.slice(0, battleStep + 1).map((log, i) => (
            <div key={i} className={`py-1 animate-slide-up uppercase transition-colors ${log.type === 'critical' ? 'text-red-400 font-bold text-lg' : ''} ${log.type === 'skill' ? 'text-cyan-300 font-bold text-sm' : ''} ${log.type === 'heal' ? 'text-emerald-400 font-bold text-sm' : ''}`}>{log.text}</div>
          ))}
          <div ref={el => el && el.scrollIntoView()} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      <style>{`
        @font-face { font-family: 'SlowGothic'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-01@1.0/neurimboGothicRegular.woff2') format('woff2'); font-weight: normal; font-display: swap; }
        @font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Thin.woff2') format('woff2'); font-weight: 100; font-display: swap; }
        @font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
        @font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
        body { margin:0; background-color: #050505; color: #fff; font-family: 'Pretendard', system-ui, sans-serif; letter-spacing: 0.5px; }
        .font-mono, .font-sans, .font-serif, input, button, textarea { font-family: 'Pretendard', system-ui, sans-serif !important; }
        .font-logo { font-family: 'SlowGothic', sans-serif !important; }
        .bg-obsidian { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(circle at 50% 50%, #202025 0%, #050505 80%); filter: blur(40px); opacity: 0.9; }

        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-3px);} 75% {transform: translateX(3px);} }
        @keyframes tension-shake { 0%, 100% {transform: translate(0,0);} 10% {transform: translate(-2px, 2px);} 30% {transform: translate(2px, -2px);} 50% {transform: translate(-2px, -2px);} 70% {transform: translate(2px, 2px);} 90% {transform: translate(-2px, 1px);} }
        @keyframes shatter { 0% { opacity: 1; transform: scale(1); filter: brightness(2); } 100% { opacity: 0; transform: scale(0.95); filter: grayscale(1) blur(4px); } }
        @keyframes flash-bang { 0% { filter: brightness(1); opacity: 1; } 10% { filter: brightness(3); opacity: 1; transform: scale(1.05); } 100% { filter: brightness(1.2); opacity: 1; transform: scale(1); } }
        @keyframes flash-white { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes flash-red { 0% { background-color: rgba(239, 68, 68, 0.5); } 100% { background-color: transparent; } }
        @keyframes float-up { 0% { transform: translate(-50%, -50%); opacity: 1; } 100% { transform: translate(-50%, -100%); opacity: 0; } }
        @keyframes foil-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes holo-shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes scanline { 0% { top: -30%; } 100% { top: 110%; } }
        @keyframes blood-pulse { 0%, 100% { box-shadow: inset 0 0 30px rgba(220,38,38,0.4); border-color: rgba(185,28,28,0.5); } 50% { box-shadow: inset 0 0 80px rgba(220,38,38,0.9); border-color: rgba(239,68,68,1); } }
        @keyframes obsidian-shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        @keyframes continuous-glow {
            0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
            50% { filter: drop-shadow(0 0 15px currentColor); }
        }
        
        /* Dynamic Battle Animations */
        @keyframes attack-right { 0% { transform: translateX(0) scale(1); z-index: 30;} 20% { transform: translateX(-15px) scale(1.05); } 40% { transform: translateX(100px) scale(1.15); z-index: 50;} 100% { transform: translateX(0) scale(1); z-index: 10;} }
        @keyframes attack-left { 0% { transform: translateX(0) scale(1); z-index: 30;} 20% { transform: translateX(15px) scale(1.05); } 40% { transform: translateX(-100px) scale(1.15); z-index: 50;} 100% { transform: translateX(0) scale(1); z-index: 10;} }
        @keyframes dodge-left { 0% { transform: translateX(0); } 30% { transform: translateX(-50px) skewX(-10deg); opacity: 0.3; } 100% { transform: translateX(0) skewX(0); opacity: 1; } }
        @keyframes dodge-right { 0% { transform: translateX(0); } 30% { transform: translateX(50px) skewX(10deg); opacity: 0.3; } 100% { transform: translateX(0) skewX(0); opacity: 1; } }
        @keyframes hit-light { 0% { transform: translateX(0); filter: brightness(1); } 20% { transform: translateX(-5px); filter: brightness(2) contrast(150%); } 40% { transform: translateX(5px); } 60% { transform: translateX(-5px); filter: brightness(1) contrast(100%); } 100% { transform: translateX(0); } }
        @keyframes hit-heavy { 0% { transform: scale(1); filter: brightness(1); } 10% { transform: scale(0.9) rotate(-3deg); filter: brightness(3) sepia(1) hue-rotate(-50deg) saturate(300%); box-shadow: 0 0 50px red; } 30% { transform: scale(1.05) rotate(3deg); } 50% { transform: scale(0.95) rotate(-3deg); } 100% { transform: scale(1) rotate(0); filter: brightness(1); box-shadow: none; } }
        @keyframes skill-charge { 0% { filter: drop-shadow(0 0 0px #0ff); transform: scale(1); } 50% { filter: drop-shadow(0 0 30px #0ff) brightness(1.5); transform: scale(1.1); } 100% { filter: drop-shadow(0 0 0px #0ff); transform: scale(1); } }
        @keyframes slash-mark { 0% { transform: scale(0) rotate(45deg); opacity: 1; filter: drop-shadow(0 0 5px #fff); } 30% { transform: scale(1.2) rotate(45deg); opacity: 1; } 100% { transform: scale(1.5) rotate(45deg); opacity: 0; } }
        @keyframes crit-slash-mark { 0% { transform: scale(0) rotate(-45deg); opacity: 1; filter: drop-shadow(0 0 10px #f00); } 20% { transform: scale(1.5) rotate(-45deg); opacity: 1; background-color: #f00; } 100% { transform: scale(2.5) rotate(-45deg); opacity: 0; } }
        @keyframes floating-dmg { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 20% { transform: translate(-50%, -100%) scale(1.5); opacity: 1; } 80% { transform: translate(-50%, -150%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -200%) scale(1); opacity: 0; } }
        @keyframes floating-crit-dmg { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 10% { transform: translate(-50%, -120%) scale(2.5) rotate(-5deg); opacity: 1; text-shadow: 0 0 20px red; } 30% { transform: translate(-50%, -100%) scale(1.8) rotate(3deg); opacity: 1; text-shadow: 0 0 30px red; } 80% { transform: translate(-50%, -150%) scale(1.5) rotate(0deg); opacity: 1; } 100% { transform: translate(-50%, -250%) scale(1); opacity: 0; } }
        @keyframes skill-text { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0; } 20% { transform: translate(-50%, -100%) scale(1.5); opacity: 1; } 80% { transform: translate(-50%, -100%) scale(1.5); opacity: 1; } 100% { transform: translate(-50%, -150%) scale(2); opacity: 0; } }
        @keyframes floating-heal { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 20% { transform: translate(-50%, -100%) scale(1.5); opacity: 1; text-shadow: 0 0 20px #10b981; } 80% { transform: translate(-50%, -150%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -200%) scale(1); opacity: 0; } }

        .animate-floating-heal { animation: floating-heal 1.2s ease-out forwards; color: #10b981; }
        .animate-attack-right-0, .animate-attack-right-1 { animation: attack-right 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-attack-left-0, .animate-attack-left-1 { animation: attack-left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-dodge-left-0, .animate-dodge-left-1 { animation: dodge-left 0.5s ease-out forwards; }
        .animate-dodge-right-0, .animate-dodge-right-1 { animation: dodge-right 0.5s ease-out forwards; }
        .animate-hit-light-0, .animate-hit-light-1 { animation: hit-light 0.4s ease-out forwards; }
        .animate-hit-heavy-0, .animate-hit-heavy-1 { animation: hit-heavy 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards; }
        .animate-skill-charge-0, .animate-skill-charge-1 { animation: skill-charge 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out both; }
        .animate-tension-shake { animation: tension-shake 0.1s infinite; }
        .animate-shatter { animation: shatter 0.5s ease-out forwards; }
        .animate-flash-bang { animation: flash-bang 0.6s ease-out forwards; }
        .animate-flash-white { animation: flash-white 0.8s ease-out forwards; }
        .animate-slash-mark { animation: slash-mark 0.3s ease-out forwards; }
        .animate-crit-slash-mark { animation: crit-slash-mark 0.5s ease-out forwards; }
        .animate-floating-dmg { animation: floating-dmg 0.8s ease-out forwards; }
        .animate-floating-crit-dmg { animation: floating-crit-dmg 1.2s ease-out forwards; }
        .animate-skill-text { animation: skill-text 1.2s ease-out forwards; }

        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px;}
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

        .holographic-overlay {
            background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.5) 25%, transparent 30%, transparent 40%, rgba(255,255,255,0.5) 45%, transparent 50%);
            background-size: 200% 200%;
            animation: holo-shine 5s infinite linear;
        }
      `}</style>
      <audio ref={bgmRef} src="https://res.cloudinary.com/dkotceims/video/upload/v1777608697/%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC_BGM_-_%EB%A0%88%EC%A7%80%EC%8A%A4%ED%83%95%EC%8A%A4_%EB%B3%B8%EB%B6%80_w7ucsi.mp3" loop preload="auto" />
      {currentView === 'login' ? renderLogin() : (
        <div className="relative z-10 flex flex-col min-h-screen">
          {renderHeader()}
          <main className="flex-1 flex flex-col items-center justify-center w-full">
            {currentView === 'lobby' && renderLobby()}
            {currentView === 'profile' && renderProfile()}
            {currentView === 'shop' && renderShop()}
            {currentView === 'deck' && renderDeck()}
            {currentView === 'card_details' && renderCardDetails()}
            {currentView === 'enhance' && renderEnhancement()}
            {currentView === 'battle_select' && renderBattleSelect()}
            {currentView === 'battle_ai_setup' && renderBattleAISetup()}
            {currentView === 'pvp_setup' && renderPvPSetup()}
            {currentView === 'pvp_room' && renderPvPRoom()}
            {currentView === 'battle' && renderBattle()}
            {currentView === 'battle_pvp_play' && renderBattle()}
          </main>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {previewCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in" onClick={() => setPreviewCard(null)}>
          <div className="relative w-full max-w-sm flex flex-col items-center animate-slide-up transform scale-110 md:scale-125" onClick={e => e.stopPropagation()}>
            <CardItem card={previewCard} className="w-full pointer-events-none" />
            <button onClick={wrapClick(() => setPreviewCard(null))} onMouseEnter={handleHover} className="mt-8 px-8 py-3 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-mono text-sm tracking-widest uppercase transition-colors duration-300 rounded-none">닫기</button>
          </div>
        </div>
      )}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in">
          <div className="bg-white/[0.02] border border-white/10 p-10 w-full max-w-sm relative transition-all duration-300 rounded-none">
            <HUDCorner />
            <h3 className="font-mono font-light text-xl text-white mb-4 tracking-widest uppercase">{confirmModal.title}</h3>
            <p className="font-sans text-base text-white/60 mb-10 whitespace-pre-wrap leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-4 font-mono font-light text-sm tracking-widest uppercase">
              <button onClick={wrapClick(confirmModal.onCancel || (() => setConfirmModal(null)))} onMouseEnter={handleHover} className="flex-1 py-3 border border-white/20 text-white/50 hover:text-white transition-colors duration-300 rounded-none">{confirmModal.cancelText || "취소"}</button>
              <button onClick={wrapClick(confirmModal.onConfirm)} onMouseEnter={handleHover} disabled={isProcessing} className="flex-1 py-3 bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-30 rounded-none">{isProcessing ? '처리 중...' : (confirmModal.confirmText || "확인")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}