// 카드 관련 순수 유틸 함수 모음
// 컴포넌트/상태와 무관한 순수 함수여야 테스트가 쉽고 재사용성이 높음

import { COST_BY_LEVEL, UNIQUE_TRAITS } from '../constants/gameData';

// 판매 가격 = 누적 강화 비용의 80% + 레벨 제곱 보너스
// 강화 비용을 전액 돌려주지 않는 이유: 경제 밸런스 유지
export const getSellPrice = (level) => {
  let cumulativeCost = 0;
  for (let i = 1; i <= level; i++) cumulativeCost += (COST_BY_LEVEL[i] || 0);
  return Math.floor((1000 + cumulativeCost * 0.8) + (level * level * 2000));
};

// 카드 생성 시 랜덤 고유 특성 부여 - 게임의 다양성과 재미를 위한 요소
export const getRandomTrait = () => UNIQUE_TRAITS[Math.floor(Math.random() * UNIQUE_TRAITS.length)];

// 레벨에 따라 카드 테두리 스타일(홀로그램 등급) 클래스를 반환
// 높은 레벨일수록 화려한 효과로 성취감과 희귀감 부여
export const getFoilClass = (level) => {
  if (level >= 28) return 'bg-[length:300%_300%] bg-gradient-to-tr from-white via-cyan-200 to-yellow-200 animate-foil-shift p-[4px] shadow-[0_0_50px_rgba(255,255,255,0.9),0_0_100px_rgba(0,255,255,0.6),0_0_150px_rgba(255,255,255,0.3)]';
  if (level >= 25) return 'bg-[length:200%_200%] bg-gradient-to-tr from-cyan-200 via-white to-cyan-400 animate-foil-shift p-[3px] shadow-[0_0_35px_rgba(0,255,255,0.7),0_0_70px_rgba(255,255,255,0.4)]';
  if (level >= 21) return 'bg-[length:200%_200%] bg-gradient-to-tr from-cyan-400 via-white to-cyan-600 animate-foil-shift p-[2px] shadow-[0_0_28px_rgba(0,255,255,0.55),0_0_50px_rgba(255,255,255,0.2)]';
  if (level >= 20) return 'bg-[length:200%_200%] bg-gradient-to-tr from-cyan-400 via-purple-400 to-yellow-400 animate-foil-shift p-[2px] shadow-[0_0_22px_rgba(167,139,250,0.5),0_0_40px_rgba(0,255,255,0.3)]';
  if (level >= 18) return 'bg-[length:200%_200%] bg-gradient-to-tr from-fuchsia-400 via-pink-600 to-purple-900 animate-foil-shift p-[2px] shadow-[0_0_18px_rgba(232,121,249,0.6),0_0_35px_rgba(255,0,255,0.3)]';
  if (level >= 15) return 'bg-[length:200%_200%] bg-gradient-to-tr from-red-500 via-red-800 to-rose-900 animate-foil-shift p-[2px] shadow-[0_0_18px_rgba(239,68,68,0.5),0_0_35px_rgba(255,0,0,0.2)]';
  if (level >= 11) return 'bg-[length:200%_200%] bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-800 animate-foil-shift p-[2px] shadow-[0_0_14px_rgba(251,191,36,0.5),0_0_28px_rgba(245,158,11,0.2)]';
  if (level >= 8)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-violet-400 via-purple-600 to-indigo-900 animate-foil-shift p-[2px] shadow-[0_0_12px_rgba(167,139,250,0.4)]';
  if (level >= 5)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-blue-300 via-blue-600 to-indigo-900 animate-foil-shift p-[2px] shadow-[0_0_10px_rgba(96,165,250,0.4)]';
  if (level >= 3)  return 'bg-gradient-to-b from-slate-400 via-slate-600 to-slate-900 p-[1px] shadow-[0_0_6px_rgba(148,163,184,0.25)]';
  return 'bg-gradient-to-b from-zinc-600 to-zinc-900 p-[1px] shadow-[0_0_4px_rgba(100,100,100,0.2)]';
};

// 레벨에 따라 카드 레벨 텍스트 색상 클래스 반환 (글로우 효과 포함)
export const getTierTextColor = (level) => {
  if (level >= 28) return 'text-white drop-shadow-[0_0_12px_#ffffff]';
  if (level >= 25) return 'text-cyan-100 drop-shadow-[0_0_10px_#cffafe]';
  if (level >= 21) return 'text-cyan-300 drop-shadow-[0_0_10px_#67e8f9]';
  if (level >= 20) return 'animate-rainbow-text drop-shadow-[0_0_8px_currentColor]';
  if (level >= 18) return 'text-fuchsia-400 drop-shadow-[0_0_8px_#e879f9]';
  if (level >= 15) return 'text-red-400 drop-shadow-[0_0_8px_#f87171]';
  if (level >= 11) return 'text-yellow-400 drop-shadow-[0_0_5px_#facc15]';
  if (level >= 8)  return 'text-purple-400 drop-shadow-[0_0_5px_#c084fc]';
  if (level >= 5)  return 'text-blue-400 drop-shadow-[0_0_5px_#60a5fa]';
  return 'text-gray-300';
};
