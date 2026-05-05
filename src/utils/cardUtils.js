// 카드 관련 순수 유틸 함수 모음
// 컴포넌트/상태와 무관한 순수 함수여야 테스트가 쉽고 재사용성이 높음

import { COST_BY_LEVEL, UNIQUE_TRAITS, SKILL_UNLOCKS } from '../constants/gameData';

// 판매 가격 = 누적 강화 비용의 80% + 레벨 제곱 보너스
// 강화 비용을 전액 돌려주지 않는 이유: 경제 밸런스 유지
export const getSellPrice = (level) => {
  let cumulativeCost = 0;
  for (let i = 1; i <= level; i++) cumulativeCost += (COST_BY_LEVEL[i] || 0);
  return Math.floor((1000 + cumulativeCost * 0.8) + (level * level * 2000));
};

// 카드 생성 시 랜덤 고유 특성 부여 - 게임의 다양성과 재미를 위한 요소
export const getRandomTrait = () => UNIQUE_TRAITS[Math.floor(Math.random() * UNIQUE_TRAITS.length)];

// 주어진 레벨까지 해금된 스킬 목록 반환
// 레벨업 시마다 호출하여 unlockedSkills 배열을 갱신함
export const getUnlockedSkills = (level) => {
  const skills = [];
  for (let i = 1; i <= level; i++) {
    if (SKILL_UNLOCKS[i]) skills.push(SKILL_UNLOCKS[i]);
  }
  return skills;
};

// 레벨에 따라 카드 테두리 스타일(홀로그램 등급) 클래스를 반환
// 높은 레벨일수록 화려한 효과로 성취감과 희귀감 부여
export const getFoilClass = (level) => {
  if (level >= 20) return 'bg-[length:200%_200%] bg-gradient-to-tr from-cyan-400 via-purple-500 to-yellow-400 animate-foil-shift p-[2px] shadow-[0_0_20px_rgba(0,255,255,0.4)]';
  if (level >= 18) return 'bg-[length:200%_200%] bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-800 animate-foil-shift p-[2px] shadow-[0_0_15px_rgba(255,0,255,0.3)]';
  if (level >= 15) return 'bg-[length:200%_200%] bg-gradient-to-tr from-red-600 via-red-900 to-black animate-foil-shift p-[2px] shadow-[0_0_15px_rgba(255,51,0,0.3)]';
  if (level >= 11) return 'bg-[length:200%_200%] bg-gradient-to-tr from-yellow-300 via-yellow-600 to-amber-900 animate-foil-shift p-[2px]';
  if (level >= 8)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-purple-400 via-purple-700 to-black animate-foil-shift p-[2px]';
  if (level >= 5)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-blue-400 via-blue-700 to-black animate-foil-shift p-[2px]';
  return 'bg-gradient-to-b from-gray-500 to-gray-800 p-[1px]';
};

// 레벨에 따라 카드 레벨 텍스트 색상 클래스 반환 (글로우 효과 포함)
export const getTierTextColor = (level) => {
  if (level >= 20) return 'text-cyan-300 drop-shadow-[0_0_8px_#67e8f9]';
  if (level >= 18) return 'text-fuchsia-400 drop-shadow-[0_0_8px_#e879f9]';
  if (level >= 15) return 'text-red-400 drop-shadow-[0_0_8px_#f87171]';
  if (level >= 11) return 'text-yellow-400 drop-shadow-[0_0_5px_#facc15]';
  if (level >= 8)  return 'text-purple-400 drop-shadow-[0_0_5px_#c084fc]';
  if (level >= 5)  return 'text-blue-400 drop-shadow-[0_0_5px_#60a5fa]';
  return 'text-gray-300';
};
