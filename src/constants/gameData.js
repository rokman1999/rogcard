// 이 파일은 순수 게임 기획 데이터만 담는다.
// 로직/UI와 분리해야 기획자가 수치 조정 시 코드 실수 위험이 없기 때문.

export const CREATE_CARD_COST = 5000;
export const STARTING_GOLD = 1000000;

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
  { hp: 3500, atk: 800, def: 80, spd: 300, crit: 100, luck: 100 }, // LV.21 초월
  { hp: 3850, atk: 870, def: 87, spd: 315, crit: 105, luck: 105 }, // LV.22
  { hp: 4200, atk: 950, def: 94, spd: 332, crit: 110, luck: 110 }, // LV.23
  { hp: 4600, atk: 1040, def: 102, spd: 350, crit: 116, luck: 116 }, // LV.24
  { hp: 5100, atk: 1150, def: 112, spd: 370, crit: 123, luck: 123 }, // LV.25
  { hp: 5700, atk: 1280, def: 122, spd: 392, crit: 131, luck: 131 }, // LV.26
  { hp: 6400, atk: 1430, def: 134, spd: 416, crit: 140, luck: 140 }, // LV.27
  { hp: 7200, atk: 1600, def: 148, spd: 442, crit: 150, luck: 150 }, // LV.28
  { hp: 8100, atk: 1800, def: 163, spd: 470, crit: 162, luck: 161 }, // LV.29
  { hp: 9000, atk: 2000, def: 180, spd: 500, crit: 175, luck: 175 }, // LV.30
];

export const COST_BY_LEVEL = [
  null, 100, 200, 300, 500, 800, 1000, 1600, 2800, 4000,
  6500, 12000, 20000, 32000, 48000, 72000, 110000, 160000, 240000, 400000,
  1200000, null,
  2000000, 3500000, 6000000, 9000000, 13000000, 18000000, 25000000, 35000000, 50000000
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
  { successRate: 5,   onFail: 'mixed', destroyChance: 50, levelDownOnFail: 4 },
  null, // LV.21 초월 (강화 불가, 초월 합성으로만 달성)
  { successRate: 70, onFail: 'keep',  destroyChance: 0,  levelDownOnFail: 0 }, // LV.22
  { successRate: 60, onFail: 'keep',  destroyChance: 0,  levelDownOnFail: 0 }, // LV.23
  { successRate: 50, onFail: 'down',  destroyChance: 0,  levelDownOnFail: 1 }, // LV.24
  { successRate: 40, onFail: 'down',  destroyChance: 5,  levelDownOnFail: 1 }, // LV.25
  { successRate: 30, onFail: 'down',  destroyChance: 10, levelDownOnFail: 2 }, // LV.26
  { successRate: 20, onFail: 'mixed', destroyChance: 15, levelDownOnFail: 2 }, // LV.27
  { successRate: 15, onFail: 'mixed', destroyChance: 20, levelDownOnFail: 3 }, // LV.28
  { successRate: 10, onFail: 'mixed', destroyChance: 30, levelDownOnFail: 3 }, // LV.29
  { successRate: 5,  onFail: 'mixed', destroyChance: 50, levelDownOnFail: 4 }, // LV.30
];

export const UNIQUE_TRAITS = [
  { name: '무쇠뚝배기', desc: '선천적으로 얼굴이 두꺼워 적의 공격을 15% 덜 받습니다.' },
  { name: '키보드 워리어', desc: '온라인 여포. 팩트로 때려서 치명타 확률이 15% 상승합니다.' },
  { name: '주식 물린 자', desc: '분노 게이지 MAX. 체력 50% 이하 시 데미지가 1.3배 상승합니다.' },
  { name: '사내 모기', desc: '동료의 피를 빱니다. 공격 시 가한 데미지의 20%를 체력으로 훔쳐옵니다.' },
  { name: '탈주 닌자', desc: '불리하면 도망치는데 도가 텄습니다. 회피율이 10% 상승합니다.' },
  { name: '될놈될', desc: '가만히 있어도 떡상합니다. 강화 확률과 치명타 확률이 소폭 상승합니다.' },
  { name: '월급 루팡', desc: '숨만 쉬어도 체력이 찹니다. (기본 방어력 10% 보너스)' },
  { name: '점심 메뉴 결정장애', desc: '뭘 해도 망설이다 일단 지름. 공격이 랜덤하지만 가끔 미친 한방이 터집니다.' },
  { name: '배달비 실거주자', desc: '배달비를 더 냈는데 음식은 못 먹은 분노. 방어력이 20% 상승합니다.' },
  { name: '출근길 지옥철 생존자', desc: '매일 아침 살아돌아온 베테랑. 선공 확률이 30% 상승합니다.' },
  { name: '숙취 전사', desc: '어제 뭔가 마셨는데 잘 모르겠음. 체력은 낮지만 공격이 2배가 됩니다.' },
  { name: 'GPT 맹신자', desc: '\"GPT한테 물어봤는데\"... 치명타 확률이 이상하게 높습니다.' },
  { name: '영수증 수집가', desc: '모든 거래를 기억합니다. 피해를 받을 때마다 복수 데미지가 1%씩 누적됩니다.' },
  { name: '카페 자리 지킴이', desc: '아메리카노 한 잔으로 6시간 버팁니다. 회피율이 비정상적으로 높습니다.' },
  { name: '밈 제조기', desc: '상황을 웃음으로 승화시킵니다. 패배 직전 반격 데미지가 1.8배로 폭발합니다.' },
  { name: '무한 스크롤러', desc: '새벽 4시까지 유튜브 쇼츠를 봅니다. 체력은 낮지만 회피율이 20% 상승합니다.' }
];

export const TRAIT_COLORS = {
  '무쇠뚝배기': 'bg-slate-500/20 border-slate-500/50 text-slate-300',
  '키보드 워리어': 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  '주식 물린 자': 'bg-red-500/20 border-red-500/50 text-red-400',
  '사내 모기': 'bg-rose-500/20 border-rose-500/50 text-rose-400',
  '탈주 닌자': 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  '될놈될': 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  '월급 루팡': 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  '점심 메뉴 결정장애': 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  '배달비 실거주자': 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  '출근길 지옥철 생존자': 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
  '숙취 전사': 'bg-violet-500/20 border-violet-500/50 text-violet-400',
  'GPT 맹신자': 'bg-sky-500/20 border-sky-500/50 text-sky-400',
  '영수증 수집가': 'bg-lime-500/20 border-lime-500/50 text-lime-400',
  '카페 자리 지킴이': 'bg-brown-500/20 border-orange-900/50 text-orange-300',
  '밈 제조기': 'bg-pink-500/20 border-pink-500/50 text-pink-400',
  '무한 스크롤러': 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400',
};

export const getRandomTrait = () => UNIQUE_TRAITS[Math.floor(Math.random() * UNIQUE_TRAITS.length)];

export const SKILLS_DATA = {
  '선빵필승': '스피드와 무관하게 전투 시작 시 무조건 선공을 가져갑니다. 빠따가 최고죠.',
  '퇴사 선언': '스피드와 무관하게 전투 시작 시 무조건 선공을 가져갑니다. 사표가 최고죠.',
  '빛의 속도': '시공간을 비틀어 전투 시작 시 무조건 선제 공격을 가합니다.',
  '시간 정지': '시간을 멈추고 첫 타를 날립니다. 절대적인 선공권입니다.',
  '닌자 무빙': '20% 확률로 휙! 하고 물리 타격을 잔상만 남기며 회피합니다.',
  '칼퇴의 요정': '20% 확률로 휙! 하고 물리 타격을 잔상만 남기며 요리조리 회피합니다.',
  '환영 분신': '적의 눈을 속여 20% 확률로 공격을 완벽히 회피합니다.',
  '매트릭스 회피': '총알도 피하는 반사신경으로 20% 확률로 데미지를 무효화합니다.',
  '원펀맨': '모든 공격이 자비 없이 무조건 2배 데미지(치명타)로 꽂힙니다.',
  '비선실세': '모든 공격이 자비 없이 무조건 2배 데미지(치명타)로 꽂히는 압도적 권력입니다.',
  '신의 심판': '확률을 무시하고 타격마다 무조건 치명타를 발생시킵니다.',
  '필살의 일격': '매 공격이 급소를 찔러 100% 확률로 치명타가 터집니다.',
  '뚝배기 브레이커': '매 3번째 공격마다 적의 멘탈을 부수는 1.6배의 치명타를 날립니다.',
  '팩트 폭력': '매 3번째 공격마다 적의 멘탈을 부수는 1.6배의 뼈 때리는 치명타를 날립니다.',
  '무호흡 펀치': '연타의 끝에 3타마다 1.6배의 강력한 데미지를 꽂아넣습니다.',
  '연속 뺨치기': '3대 맞으면 정신을 못 차립니다. 3타마다 1.6배 데미지를 줍니다.',
  '풀악셀': '현재 체력이 50% 이하가 되면 리미터를 해제하여 공격력이 1.5배 상승합니다.',
  '분노의 야근': '현재 체력이 50% 이하가 되면 억눌린 빡침이 폭발하여 공격력이 1.5배 상승합니다.',
  '배수의 진': '체력이 절반 이하일 때 사력을 다해 1.5배의 피해를 입힙니다.',
  '마지막 발악': '죽기 직전의 힘을 쥐어짜 체력 50% 이하에서 공격력이 1.5배가 됩니다.',
  '눈깔 뒤집힘': '체력이 깎일수록 분노하여 최대 2.5배까지 데미지가 무식하게 상승합니다.',
  '비트코인 떡락': '체력이 깎일수록 파멸적인 분노를 느껴 최대 2.5배까지 데미지가 무식하게 상승합니다.',
  '복수귀': '잃은 체력에 비례하여 적에게 돌려주는 피해량이 최대 2.5배 상승합니다.',
  '광기의 칼날': '고통을 쾌락으로 승화시켜, 체력이 낮을수록 데미지가 폭발적으로 오릅니다.',
  '뱀파이어 흡혈': '적에게 입힌 피해의 25%를 달달하게 체력으로 훔쳐옵니다.',
  '법카 찬스': '적에게 입힌 피해의 25%를 달달하게 체력으로 환급(흡혈)받습니다.',
  '영혼 흡수': '공격 시 상대의 생명력을 25% 강탈하여 내 체력을 회복합니다.',
  '피의 축제': '피를 볼 때마다 희열을 느껴 가한 데미지의 25%를 회복합니다.',
  '우주 방어력': '적의 모든 공격에서 들어오는 최종 데미지를 10% 깎아냅니다.',
  '철면피': '얼굴이 두꺼워져 적의 모든 공격에서 들어오는 최종 데미지를 10% 무시합니다.',
  '절대 방벽': '보이지 않는 실드가 최종 타격 데미지의 10%를 방어합니다.',
  '티타늄 바디': '몸이 금속으로 변해 받는 모든 데미지가 10% 감소합니다.',
  '예토전생': 'HP가 0이 되어도 한 번은 좀비처럼 최대 체력 40%로 부활합니다.',
  '엄마 호출': 'HP가 0이 되어도 한 번은 엄마 빽으로 최대 체력 40% 상태로 부활합니다.',
  '불사조의 깃털': '죽음을 극복하고 최대 체력의 40%를 지닌 채 1회 부활합니다.',
  '타임 루프': '치명상을 입는 순간 시간을 되돌려 체력 40% 상태로 생존합니다.',
  '초월의 힘': '신을 뛰어넘은 존재. 적의 모든 방어와 회피를 무시하고 100% 확률로 치명타를 가하며 피해량의 50%를 회복합니다.',
  // 선공 신규
  '칼퇴의 신': '오후 6시 정각. 이미 가방을 들고 있었습니다. 무조건 선공을 가져갑니다.',
  '아이유 콘서트 선예매': '티켓팅에서 갈고닦은 반사신경으로 무조건 선공을 가져갑니다.',
  // 회피 신규
  '지각 핑계 달인': '15년 경력의 지각 핑계로 적의 공격을 20% 확률로 잘못 피합니다.',
  '부모님 전화 수신거부': '20% 확률로 귓등으로도 안 듣습니다.',
  // 치명타 확정 신규
  '발표자료 폰트 날아감': '당한 사람만 아는 그 공황. 무조건 2배 치명타가 꽂힙니다.',
  // 3타마다 치명 신규
  '삼겹살 3인분': '3번째 공격은 반드시 불판 위의 그것처럼 터집니다. 1.6배 데미지.',
  '삼성 vs 애플 3라운드': '논쟁의 세 번째 단계에서 폭발합니다. 3타마다 1.6배 데미지.',
  // 체력 낮을수록 강해짐 신규
  '마감 5분 전 집중력': '마감 임박 시 뇌가 초월합니다. 체력 50% 이하에서 공격력 1.5배.',
  '배터리 5% 경고': '빨간 불 켜지면 오히려 집중됩니다. 체력 50% 이하에서 공격력 1.5배.',
  // 잃은 체력 비례 신규
  '보증금 날린 분노': '집주인에게 쌓인 분노를 외부에 투사합니다. 잃은 체력 비례 최대 2.5배.',
  '스타벅스 영수증 분실': '영수증 하나 잃었을 뿐인데... 최대 2.5배의 분노 데미지.',
  // 흡혈 신규
  '구독 자동결제': '모르는 사이에 빠져나갑니다. 가한 데미지의 25%를 체력으로 회복.',
  '깻잎 논쟁 승리자': '기어코 쟁취합니다. 상대 체력의 25%를 빨아옵니다.',
  // 방어 신규
  '노이즈 캔슬링': '세상 모든 공격을 차단합니다. 받는 데미지 10% 감소.',
  '인스타 블로킹': '당신의 존재를 인식하지 않습니다. 받는 데미지 10% 무시.',
  // 부활 신규
  '카카오 서버 부활': 'Down되어도 다시 올라옵니다. HP 0 시 최대 체력 40%로 부활.',
  '메신저 읽씹 후 등장': '한참 잠수하다 갑자기 나타납니다. HP 0 시 체력 40%로 부활.'
};

export const SKILL_GROUPS = {
  PREEMPTIVE: ['선빵필승', '퇴사 선언', '빛의 속도', '시간 정지', '칼퇴의 신', '아이유 콘서트 선예매'],
  DODGE: ['닌자 무빙', '칼퇴의 요정', '환영 분신', '매트릭스 회피', '지각 핑계 달인', '부모님 전화 수신거부'],
  CRIT_GUARANTEE: ['원펀맨', '비선실세', '신의 심판', '필살의 일격', '발표자료 폰트 날아감'],
  CRIT_MULTI_HIT: ['뚝배기 브레이커', '팩트 폭력', '무호흡 펀치', '연속 뺨치기', '삼겹살 3인분', '삼성 vs 애플 3라운드'],
  LOW_HP_ATK: ['풀악셀', '분노의 야근', '배수의 진', '마지막 발악', '마감 5분 전 집중력', '배터리 5% 경고'],
  LOST_HP_ATK: ['눈깔 뒤집힘', '비트코인 떡락', '복수귀', '광기의 칼날', '보증금 날린 분노', '스타벅스 영수증 분실'],
  VAMPIRE: ['뱀파이어 흡혈', '법카 찬스', '영혼 흡수', '피의 축제', '구독 자동결제', '깻잎 논쟁 승리자'],
  DEFENSE: ['우주 방어력', '철면피', '절대 방벽', '티타늄 바디', '노이즈 캔슬링', '인스타 블로킹'],
  REVIVE: ['예토전생', '엄마 호출', '불사조의 깃털', '타임 루프', '카카오 서버 부활', '메신저 읽씹 후 등장'],
  TRANSCENDENT: ['초월의 힘']
};

// 강화 레벨업 시 랜덤 스킬 획득 (App2 방식: 마일스톤마다 랜덤 배정)
export const acquireRandomSkillsForLevelUp = (currentSkills, newLevel) => {
  const SKILL_MILESTONES = [3, 5, 8, 10, 13, 15, 18, 20, 24, 28];
  let newSkills = [...(currentSkills || [])];
  if (SKILL_MILESTONES.includes(newLevel)) {
    const allSkillKeys = Object.keys(SKILLS_DATA).filter(k => k !== '초월의 힘');
    const available = allSkillKeys.filter(s => !newSkills.includes(s));
    if (available.length > 0) {
      const randomSkill = available[Math.floor(Math.random() * available.length)];
      newSkills.push(randomSkill);
    }
  }
  return newSkills;
};

// AI 생성 및 초기 스킬 계산용 (고정 배정)
export const getUnlockedSkills = (level) => {
  const SKILL_MILESTONES = [3, 5, 8, 10, 13, 15, 18, 20, 24, 28];
  const allSkillKeys = Object.keys(SKILLS_DATA).filter(k => k !== '초월의 힘');
  let skills = [];
  for (let i = 1; i <= level; i++) {
    if (SKILL_MILESTONES.includes(i)) {
      const available = allSkillKeys.filter(s => !skills.includes(s));
      if (available.length > 0) skills.push(available[Math.floor(Math.random() * available.length)]);
    }
  }
  return skills;
};

export const ACHIEVEMENTS_DATA = {
  "🏆 첫 승리의 짜릿함": "처음으로 전투에서 승리했습니다. 시작이 반이죠.",
  "🏅 골목대장": "전투 10승 달성. 동네에서는 좀 치는군요.",
  "👑 전장의 지배자": "전투 50승 달성. 당신의 이름이 서버에 널리 알려집니다.",
  "💰 벼락부자": "5,000,000 GOLD 보유. 지갑이 두둑합니다.",
  "🏦 걸어다니는 은행": "20,000,000 GOLD 보유. 당신이 곧 자본주의입니다.",
  "✨ 두 자릿수 돌파": "LV.10 이상 카드 보유. 본격적인 시작입니다.",
  "🔥 인간을 초월한 자": "LV.15 이상 카드 보유. 확률의 벽을 뚫었군요.",
  "🚀 만렙의 경지": "LV.20 최고 레벨 달성. 더 이상 오를 곳이 없습니다.",
  "🤕 쿠쿠다스 멘탈": "10번의 패배. 꺾이지 않는 마음이 중요합니다.",
  "😭 동네 북": "30번의 패배. 이쯤 되면 맞는 걸 즐기는 걸지도 모릅니다.",
  "🌌 초월자": "LV.21 초월 카드를 획득했습니다. 전설의 시작입니다."
};

export const checkAchievements = (userData, userCards) => {
  let ach = [];
  if (!userData) return ach;
  const realWins = Math.max(0, (userData.wins || 0) - (userData.aiWins || 0));
  if (realWins >= 1) ach.push("🏆 첫 승리의 짜릿함");
  if (realWins >= 10) ach.push("🏅 골목대장");
  if (realWins >= 50) ach.push("👑 전장의 지배자");
  if (userData.money >= 5000000) ach.push("💰 벼락부자");
  if (userData.money >= 20000000) ach.push("🏦 걸어다니는 은행");
  if (userCards.some(c => c.level >= 10)) ach.push("✨ 두 자릿수 돌파");
  if (userCards.some(c => c.level >= 15)) ach.push("🔥 인간을 초월한 자");
  if (userCards.some(c => c.level >= 20)) ach.push("🚀 만렙의 경지");
  if (userCards.some(c => c.level >= 21)) ach.push("🌌 초월자");
  if (userData.losses >= 10) ach.push("🤕 쿠쿠다스 멘탈");
  if (userData.losses >= 30) ach.push("😭 동네 북");
  return ach;
};

export const FRAMES_DATA = [
  { id: 'frame_rust',     name: '녹슨 고철',       desc: '세월의 흔적이 묻은 앤틱 프레임',    price: 5000,    color: 'text-[#a1662f]' },
  { id: 'frame_hologram', name: '홀로그램 스캔라인', desc: '화려한 스캔라인 오버레이',          price: 30000,   color: 'text-cyan-300' },
  { id: 'frame_blood',    name: '블러드 펄스',       desc: '핏빛 쉐도우 효과',                price: 60000,   color: 'text-red-500' },
  { id: 'frame_obsidian', name: '옵시디언 엣지',     desc: '고급스러운 다크 엣지 음영',         price: 200000,  color: 'text-gray-400' },
  { id: 'frame_gold',     name: '골든 아우라',       desc: '황금빛 프레임 & 글로우',           price: 300000,  color: 'text-yellow-400' },
  { id: 'frame_neon',     name: '네온 사이버',       desc: '시안/핑크 사이버펑크 네온',         price: 600000,  color: 'text-pink-400' },
  { id: 'frame_diamond',  name: '다이아몬드 더스트', desc: '반짝이는 다이아몬드 결정',          price: 1200000, color: 'text-blue-200' },
  { id: 'frame_galaxy',   name: '코스믹 갤럭시',     desc: '우주의 심연을 담은 프레임',         price: 1800000, color: 'text-indigo-400' },
  { id: 'frame_toxic',    name: '맹독성 늪',         desc: '부식되는 맹독 프레임',             price: 2400000, color: 'text-green-500' },
  { id: 'frame_fire',     name: '지옥불 헬파이어',   desc: '타오르는 화염 이펙트',             price: 3000000, color: 'text-orange-500' },
  { id: 'frame_ice',      name: '절대 영도 빙결',    desc: '얼어붙은 서리 효과',              price: 3000000, color: 'text-cyan-200' },
  { id: 'frame_sakura',   name: '흩날리는 벚꽃',     desc: '아름다운 벚꽃잎 오버레이',         price: 5000000, color: 'text-pink-300' },
  { id: 'frame_matrix',   name: '매트릭스 코드',     desc: '디지털 비가 내리는 이펙트',        price: 6000000, color: 'text-emerald-500' },
];

export const QUESTS = [
  { id: 'q1', type: 'ai', title: '워밍업', desc: 'AI 대전 1회 참여', target: 1, reward: 50000 },
  { id: 'q2', type: 'ai', title: '가상 훈련', desc: 'AI 대전 5회 참여', target: 5, reward: 300000 },
  { id: 'q3', type: 'ai', title: '전투광', desc: 'AI 대전 10회 참여', target: 10, reward: 800000 },
  { id: 'q4', type: 'win_ai', title: '인공지능 정복 I', desc: 'AI 대전 3회 승리', target: 3, reward: 200000 },
  { id: 'q5', type: 'win_ai', title: '인공지능 정복 II', desc: 'AI 대전 7회 승리', target: 7, reward: 600000 },
  { id: 'q6', type: 'enhance', title: '한계 돌파 I', desc: '카드 강화 3회 시도', target: 3, reward: 100000 },
  { id: 'q7', type: 'enhance', title: '한계 돌파 II', desc: '카드 강화 7회 시도', target: 7, reward: 300000 },
  { id: 'q8', type: 'pvp', title: '첫 실전', desc: '유저 1:1 대결 1회 참여', target: 1, reward: 150000 },
  { id: 'q9', type: 'pvp', title: '아레나의 투사', desc: '유저 1:1 대결 5회 참여', target: 5, reward: 500000 },
  { id: 'q10', type: 'chat', title: '소통의 장', desc: '전체 채팅 5회 입력', target: 5, reward: 50000 },
  { id: 'q11', type: 'market', title: '거상', desc: '거래소에 자산 1회 등록', target: 1, reward: 100000 },
  { id: 'q12', type: 'buy_market', title: '쇼핑 매니아', desc: '거래소에서 아이템 1회 구매', target: 1, reward: 150000 },
  { id: 'q13', type: 'ai', title: '베테랑의 길', desc: 'AI 대전 20회 참여', target: 20, reward: 1500000 },
  { id: 'q14', type: 'win_ai', title: '인공지능 정복 III', desc: 'AI 대전 15회 승리', target: 15, reward: 1500000 },
  { id: 'q15', type: 'enhance', title: '한계 돌파 III', desc: '카드 강화 15회 시도', target: 15, reward: 1000000 },
  { id: 'q16', type: 'pvp', title: '아레나 마스터', desc: '유저 1:1 대결 10회 참여', target: 10, reward: 1200000 },
  { id: 'q17', type: 'chat', title: '핵인싸', desc: '전체 채팅 20회 입력', target: 20, reward: 200000 },
  { id: 'q18', type: 'market', title: '대거상', desc: '거래소에 자산 5회 등록', target: 5, reward: 500000 },
  { id: 'q19', type: 'buy_market', title: 'VIP 고객', desc: '거래소에서 아이템 5회 구매', target: 5, reward: 1000000 }
];
