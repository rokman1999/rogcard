// 이 파일은 순수 게임 기획 데이터만 담는다.
// 로직/UI와 분리해야 기획자가 수치 조정 시 코드 실수 위험이 없기 때문.
export const CREATE_CARD_COST = 5000;
export const STARTING_GOLD = 1000000; // 초기 자금: 신규 유저 진입 장벽을 낮추기 위해 100만 골드

export const STATS_BY_LEVEL = [
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

export const COST_BY_LEVEL = [
  null, 100, 200, 400, 700, 1200, 2000, 3500, 6000, 10000,
  18000, 30000, 50000, 80000, 130000, 200000, 300000, 450000, 650000, 1000000,
];

export const getSellPrice = (level) => {
  let cumulativeCost = 0;
  for (let i = 1; i <= level; i++) cumulativeCost += (COST_BY_LEVEL[i] || 0);
  return Math.floor((1000 + cumulativeCost * 0.8) + (level * level * 2000));
};

export const ENHANCEMENT_RULES = [
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

export const UNIQUE_TRAITS = [
  { name: '강철 바디', desc: '선천적으로 단단하여 적의 공격을 15% 덜 받습니다.' },
  { name: '암살자', desc: '태생적인 킬러. 치명타 확률이 15% 상승합니다.' },
  { name: '광전사', desc: '피를 볼수록 강해집니다. 체력 50% 이하 시 데미지가 1.3배 상승합니다.' },
  { name: '흡혈귀', desc: '공격 시 가한 데미지의 20%를 체력으로 훔쳐옵니다.' },
  { name: '바람돌이', desc: '몸이 깃털처럼 가볍습니다. 회피율이 10% 상승합니다.' },
  { name: '럭키가이', desc: '운빨이 최고. 강화 성공 확률과 치명타 확률이 소폭 상승합니다.' }
];

export const getRandomTrait = () => UNIQUE_TRAITS[Math.floor(Math.random() * UNIQUE_TRAITS.length)];

export const SKILL_UNLOCKS = {
  3: '선빵필승', 5: '뚝배기 브레이커', 8: '닌자 무빙', 10: '풀악셀', 12: '뱀파이어 흡혈', 14: '우주 방어력', 15: '눈깔 뒤집힘', 18: '예토전생', 20: '원펀맨'
};

export const SKILLS_DATA = {
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

export const getUnlockedSkills = (level) => {
  const skills = [];
  for (let i = 1; i <= level; i++) {
    if (SKILL_UNLOCKS[i]) skills.push(SKILL_UNLOCKS[i]);
  }
  return skills;
};
