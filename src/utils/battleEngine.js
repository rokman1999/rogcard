// 전투 시뮬레이션 엔진 - 완전한 순수 함수
// React 상태/효과/Firebase와 분리된 이유:
// 동일 입력 → 동일 출력이 보장되어야 PvP에서 호스트/게스트가 같은 결과를 재현할 수 있음.

import { SKILL_GROUPS } from '../constants/gameData';

/**
 * 두 카드 데이터를 받아 전투 로그 배열을 반환하는 순수 함수.
 * @param {object} c1 - 플레이어1 카드 (stats, unlockedSkills, uniqueTrait, name 포함)
 * @param {object} c2 - 플레이어2 카드
 * @returns {Array} battleLog - 전투 이벤트 배열
 */
export const simulateBattleLog = (c1, c2) => {
  const p1 = {
    ...c1.stats,
    name: c1.name,
    skills: c1.unlockedSkills || [],
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
    skills: c2.unlockedSkills || [],
    trait: c2.uniqueTrait,
    attackCount: 0,
    revived: false,
    damageTaken: 0,
    key: 'p2',
    originalHp: c2.stats.hp
  };

  // 구/신 특성명 모두 호환하는 헬퍼
  const hasTrait = (p, newName, oldName) => p.trait?.name === newName || p.trait?.name === oldName;
  const hasSkillInGroup = (p, groupName) => p.skills.some(s => SKILL_GROUPS[groupName]?.includes(s));
  const getActiveSkillInGroup = (p, groupName) => p.skills.find(s => SKILL_GROUPS[groupName]?.includes(s));

  // 고유 특성 초기 반영
  if (hasTrait(p1, '키보드 워리어', '암살자')) p1.crit += 25;
  if (hasTrait(p2, '키보드 워리어', '암살자')) p2.crit += 25;
  if (hasTrait(p1, '탈주 닌자', '바람돌이')) p1.dodgeRate = 15;
  if (hasTrait(p2, '탈주 닌자', '바람돌이')) p2.dodgeRate = 15;

  const log = [{ type: 'start', text: `교전 개시: [${p1.name}] VS [${p2.name}]`, state: { p1Hp: p1.hp, p2Hp: p2.hp } }];

  // 선공 판정 + 선공 스킬 알림
  let p1First = p1.spd >= p2.spd;
  const p1Preemptive = getActiveSkillInGroup(p1, 'PREEMPTIVE');
  const p2Preemptive = getActiveSkillInGroup(p2, 'PREEMPTIVE');
  if (p1Preemptive && !p2Preemptive) p1First = true;
  if (!p1Preemptive && p2Preemptive) p1First = false;

  if (p1First && p1Preemptive) {
    log.push({ type: 'skill', text: `✨ [${p1.name}]의 <${p1Preemptive}> 발동! 무조건 선공!`, state: { p1Hp: p1.hp, p2Hp: p2.hp }, actor: p1.key, skill: p1Preemptive });
  } else if (!p1First && p2Preemptive) {
    log.push({ type: 'skill', text: `✨ [${p2.name}]의 <${p2Preemptive}> 발동! 무조건 선공!`, state: { p1Hp: p1.hp, p2Hp: p2.hp }, actor: p2.key, skill: p2Preemptive });
  }

  let turn = 0;
  while (p1.hp > 0 && p2.hp > 0 && turn < 100) {
    turn++;

    for (const attacker of p1First ? [p1, p2] : [p2, p1]) {
      if (attacker.hp <= 0) continue;
      const defender = attacker.key === 'p1' ? p2 : p1;
      if (defender.hp <= 0) continue;

      attacker.attackCount++;

      const transcendSkill = getActiveSkillInGroup(attacker, 'TRANSCENDENT');

      // 회피 판정 (DODGE 그룹 + 탈주 닌자/바람돌이 특성)
      let dodgeChance = 0;
      if (getActiveSkillInGroup(defender, 'DODGE')) dodgeChance += 20;
      if (hasTrait(defender, '탈주 닌자', '바람돌이')) dodgeChance += 15;
      if (transcendSkill) dodgeChance = 0; // 초월은 회피 무시

      let oldP1Hp = p1.hp;
      let oldP2Hp = p2.hp;

      if (Math.random() * 100 < dodgeChance) {
        log.push({ type: 'dodge', text: `슈슉! [${defender.name}]의 신들린 무빙!`, state: { p1Hp: oldP1Hp, p2Hp: oldP2Hp }, actor: defender.key });
        continue;
      }

      let damage = attacker.atk;
      let isCrit = false;
      let activatedSkills = [];

      // 주식 물린 자 / 광전사 특성
      if (hasTrait(attacker, '주식 물린 자', '광전사') && (attacker.hp / attacker.originalHp) <= 0.5) {
        damage *= 1.4;
        if (Math.random() < 0.6) activatedSkills.push(attacker.trait.name);
      }

      // CRIT_MULTI_HIT: 3타마다 1.6배
      const multiHitSkill = getActiveSkillInGroup(attacker, 'CRIT_MULTI_HIT');
      if (multiHitSkill && attacker.attackCount % 3 === 0) {
        damage *= 1.6;
        activatedSkills.push(multiHitSkill);
      }

      // LOW_HP_ATK: 체력 50% 이하 시 1.5배
      const lowHpSkill = getActiveSkillInGroup(attacker, 'LOW_HP_ATK');
      if (lowHpSkill && (attacker.hp / attacker.originalHp) < 0.5) {
        damage *= 1.5;
        if (Math.random() < 0.6) activatedSkills.push(lowHpSkill);
      }

      // LOST_HP_ATK: 잃은 체력 비례 최대 2.5배
      const lostHpSkill = getActiveSkillInGroup(attacker, 'LOST_HP_ATK');
      if (lostHpSkill) {
        const mult = 1 + Math.min(1.5, (attacker.damageTaken / attacker.originalHp) * 1.5);
        damage *= mult;
        if (mult > 1.2 && Math.random() < 0.5) activatedSkills.push(lostHpSkill);
      }

      // 치명타 판정
      const critSkill = getActiveSkillInGroup(attacker, 'CRIT_GUARANTEE');
      if (transcendSkill) {
        isCrit = true;
        activatedSkills.push(transcendSkill);
      } else if (critSkill) {
        isCrit = true;
        if (Math.random() < 0.5) activatedSkills.push(critSkill);
      } else if (Math.random() * 100 < attacker.crit) {
        isCrit = true;
      }

      if (isCrit) damage *= 2;

      // 스킬 로그 (복수 스킬 각각 기록)
      for (const s of activatedSkills) {
        log.push({ type: 'skill', text: `✨ [${attacker.name}]의 특수 프로토콜 <${s}> 발동!`, state: { p1Hp: oldP1Hp, p2Hp: oldP2Hp }, actor: attacker.key, skill: s });
      }

      // 방어력 계산
      let finalDef = defender.def
        + (hasSkillInGroup(defender, 'DEFENSE') ? 10 : 0)
        + (hasTrait(defender, '무쇠뚝배기', '강철 바디') ? 15 : 0)
        + (hasTrait(defender, '월급 루팡', null) ? 10 : 0);
      if (transcendSkill) finalDef = 0; // 초월은 방어 무시

      damage = Math.max(1, Math.floor(damage * (1 - Math.min(90, finalDef) / 100)));
      defender.hp -= damage;
      defender.damageTaken += damage;

      log.push({
        type: isCrit ? 'critical' : 'attack',
        text: `[${attacker.name}] ${isCrit ? "뼈와 살이 분리되는 일격!!" : "퍼억! 데미지가 들어갑니다."} (-${Math.floor(damage)})`,
        state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) },
        damage: Math.floor(damage),
        attacker: attacker.key,
        defender: defender.key
      });

      // 흡혈 처리
      const vampSkill = getActiveSkillInGroup(attacker, 'VAMPIRE');
      let healAmount = (vampSkill ? damage * 0.25 : 0)
        + (hasTrait(attacker, '사내 모기', '흡혈귀') ? damage * 0.20 : 0);
      if (transcendSkill) healAmount += damage * 0.5;

      if (healAmount > 0) {
        attacker.hp = Math.min(attacker.originalHp, attacker.hp + Math.floor(healAmount));
        let lsSkill = null;
        if (transcendSkill) lsSkill = transcendSkill;
        else if (vampSkill && Math.random() < 0.7) lsSkill = vampSkill;
        else if (hasTrait(attacker, '사내 모기', '흡혈귀') && Math.random() < 0.5) lsSkill = attacker.trait.name;

        if (lsSkill) {
          log.push({
            type: 'heal',
            text: `🩸 [${attacker.name}]의 <${lsSkill}>! 체력을 ${Math.floor(healAmount)} 회복합니다.`,
            state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) },
            actor: attacker.key,
            heal: Math.floor(healAmount),
            skill: lsSkill
          });
        }
      }

      // 부활 처리 (REVIVE 그룹)
      const reviveSkill = getActiveSkillInGroup(defender, 'REVIVE');
      if (defender.hp <= 0 && reviveSkill && !defender.revived) {
        defender.hp = Math.floor(defender.originalHp * 0.4);
        defender.revived = true;
        log.push({
          type: 'revive',
          text: `🧟 [${defender.name}] : 기적처럼 <${reviveSkill}>로 부활합니다!`,
          state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) },
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
