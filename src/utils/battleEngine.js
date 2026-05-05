// 전투 시뮬레이션 엔진 - 완전한 순수 함수
// React 상태/효과/Firebase와 분리된 이유:
// 동일 입력 → 동일 출력이 보장되어야 PvP에서 호스트/게스트가 같은 결과를 재현할 수 있음.
// 또한 단위 테스트가 쉬워짐.

/**
 * 두 카드 데이터를 받아 전투 로그 배열을 반환하는 순수 함수.
 * @param {object} c1 - 플레이어1 카드 (stats, unlockedSkills, uniqueTrait, name 포함)
 * @param {object} c2 - 플레이어2 카드
 * @returns {Array} battleLog - 전투 이벤트 배열
 */
export const simulateBattleLog = (c1, c2) => {
  // 전투 중 변경되는 상태를 복사본으로 관리 (원본 카드 데이터 불변 유지)
  const p1 = {
    ...c1.stats,
    name: c1.name,
    skills: c1.unlockedSkills,
    trait: c1.uniqueTrait,
    attackCount: 0,
    revived: false,
    damageTaken: 0,
    key: 'p1',
    originalHp: c1.stats.hp
  };
  const p2 = {
    ...c2.stats,
    name: c2.name,
    skills: c2.unlockedSkills,
    trait: c2.uniqueTrait,
    attackCount: 0,
    revived: false,
    damageTaken: 0,
    key: 'p2',
    originalHp: c2.stats.hp
  };

  // 고유 특성 효과를 초기 스탯에 반영 (전투 시작 전 패시브)
  if (p1.trait?.name === '암살자') p1.crit += 15;
  if (p2.trait?.name === '암살자') p2.crit += 15;
  if (p1.trait?.name === '바람돌이') p1.dodgeRate = 10;
  if (p2.trait?.name === '바람돌이') p2.dodgeRate = 10;

  const log = [{
    type: 'start',
    text: `교전 개시: [${p1.name}] VS [${p2.name}]`,
    state: { p1Hp: p1.hp, p2Hp: p2.hp }
  }];

  let turn = 0;
  // 무한 루프 방지를 위해 100턴 제한
  while (p1.hp > 0 && p2.hp > 0 && turn < 100) {
    turn++;

    // 선공 결정: 스피드 비교, '선빵필승' 스킬이 있으면 강제 선공
    let p1First = p1.spd >= p2.spd;
    if (p1.skills.includes('선빵필승') && !p2.skills.includes('선빵필승')) p1First = true;
    if (!p1.skills.includes('선빵필승') && p2.skills.includes('선빵필승')) p1First = false;

    for (const attacker of p1First ? [p1, p2] : [p2, p1]) {
      if (attacker.hp <= 0) continue;
      const defender = attacker.key === 'p1' ? p2 : p1;
      if (defender.hp <= 0) continue;

      attacker.attackCount++;

      // 회피 판정 (닌자 무빙 스킬 + 바람돌이 특성)
      let dodgeChance = defender.skills.includes('닌자 무빙') ? 15 : 0;
      if (defender.trait?.name === '바람돌이') dodgeChance += 10;

      let oldP1Hp = p1.hp;
      let oldP2Hp = p2.hp;

      if (Math.random() * 100 < dodgeChance) {
        log.push({
          type: 'dodge',
          text: `슈슉! [${defender.name}]의 신들린 닌자 무빙!`,
          state: { p1Hp: oldP1Hp, p2Hp: oldP2Hp },
          actor: defender.key
        });
        continue;
      }

      // 데미지 계산 시작
      let damage = attacker.atk;
      let isCrit = false;
      let skillUsed = null;

      // 광전사 특성: 체력 50% 이하 시 데미지 1.3배
      if (attacker.trait?.name === '광전사' && (attacker.hp / attacker.originalHp) <= 0.5) damage *= 1.3;

      // 스킬 효과 적용
      if (attacker.skills.includes('뚝배기 브레이커') && attacker.attackCount % 4 === 0) {
        damage *= 1.5; skillUsed = '뚝배기 브레이커';
      }
      if (attacker.skills.includes('풀악셀') && (attacker.hp / attacker.originalHp) < 0.3) {
        damage *= 1.5; skillUsed = skillUsed || '풀악셀';
      }
      if (attacker.skills.includes('눈깔 뒤집힘')) {
        damage *= (1 + Math.min(1, attacker.damageTaken / attacker.originalHp));
        skillUsed = skillUsed || '눈깔 뒤집힘';
      }

      // 원펀맨은 항상 크리티컬, 아니면 확률 판정
      if (attacker.skills.includes('원펀맨')) {
        isCrit = true; skillUsed = skillUsed || '원펀맨';
      } else if (Math.random() * 100 < attacker.crit) {
        isCrit = true;
      }

      if (isCrit) damage *= 2;

      // 방어력 계산 (우주 방어력 스킬 + 강철 바디 특성)
      let finalDef = defender.def
        + (defender.skills.includes('우주 방어력') ? 10 : 0)
        + (defender.trait?.name === '강철 바디' ? 15 : 0);
      damage = Math.max(1, Math.floor(damage * (1 - Math.min(90, finalDef) / 100)));
      defender.hp -= damage;
      defender.damageTaken += damage;

      // 흡혈 효과 (뱀파이어 흡혈 스킬 + 흡혈귀 특성)
      let healAmount = (attacker.skills.includes('뱀파이어 흡혈') ? damage * 0.15 : 0)
        + (attacker.trait?.name === '흡혈귀' ? damage * 0.20 : 0);
      if (healAmount > 0) {
        attacker.hp = Math.min(attacker.originalHp, attacker.hp + Math.floor(healAmount));
        if (attacker.skills.includes('뱀파이어 흡혈')) skillUsed = skillUsed || '뱀파이어 흡혈';
      }

      // 스킬 발동 로그 먼저 기록 (애니메이션 순서를 위해)
      if (skillUsed) {
        log.push({
          type: 'skill',
          text: `✨ [${attacker.name}]의 특수 프로토콜 <${skillUsed}> 발동!`,
          state: { p1Hp: oldP1Hp, p2Hp: oldP2Hp },
          actor: attacker.key,
          skill: skillUsed
        });
      }

      log.push({
        type: isCrit ? 'critical' : 'attack',
        text: `[${attacker.name}] ${isCrit ? "뼈와 살이 분리되는 일격!!" : "퍼억! 데미지가 들어갑니다."} (-${Math.floor(damage)})`,
        state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) },
        damage: Math.floor(damage),
        attacker: attacker.key,
        defender: defender.key
      });

      // 예토전생: 첫 번째 사망 시 30% HP로 부활
      if (defender.hp <= 0 && defender.skills.includes('예토전생') && !defender.revived) {
        defender.hp = Math.floor(defender.originalHp * 0.3);
        defender.revived = true;
        log.push({
          type: 'revive',
          text: `🧟 [${defender.name}] : 기적처럼 예토전생합니다!`,
          state: { p1Hp: p1.hp, p2Hp: p2.hp },
          actor: defender.key
        });
      }
    }
  }

  const isP1Win = p1.hp > 0;
  log.push({
    type: 'end',
    text: `🏁 교전 종료! 승리: [${isP1Win ? p1.name : p2.name}]`,
    state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) },
    winner: isP1Win ? 'p1' : 'p2'
  });

  return log;
};
