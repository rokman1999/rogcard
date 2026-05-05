// 전투 시뮬레이션 엔진 - 완전한 순수 함수
// 단일 카드 또는 카드 배열(최대 3장)을 받아 순차 전투 로그를 생성.
// 동일 입력 → 동일 출력이 보장되어야 PvP에서 호스트/게스트가 같은 결과를 재현할 수 있음.

import { SKILL_GROUPS } from '../constants/gameData';

/**
 * 카드(또는 카드 배열)를 받아 전투 로그 배열을 반환하는 순수 함수.
 * 배열 전달 시 순서대로 출전 → 쓰러지면 다음 카드 출격 (팀전 모드).
 * @param {object|Array} p1CardsInput - 플레이어1 카드 또는 카드 배열
 * @param {object|Array} p2CardsInput - 플레이어2 카드 또는 카드 배열
 * @returns {Array} battleLog
 */
export const simulateBattleLog = (p1CardsInput, p2CardsInput) => {
  const p1Cards = Array.isArray(p1CardsInput) ? p1CardsInput : [p1CardsInput];
  const p2Cards = Array.isArray(p2CardsInput) ? p2CardsInput : [p2CardsInput];

  let p1CardIdx = 0;
  let p2CardIdx = 0;

  const makeP = (c, key) => ({
    ...c.stats,
    name: c.name,
    skills: c.unlockedSkills || [],
    trait: c.uniqueTrait,
    attackCount: 0,
    revived: false,
    damageTaken: 0,
    key,
    originalHp: c.stats.hp
  });

  const p1 = makeP(p1Cards[0], 'p1');
  const p2 = makeP(p2Cards[0], 'p2');

  // 구/신 특성명 모두 호환하는 헬퍼
  const hasTrait = (p, newName, oldName) => p.trait?.name === newName || p.trait?.name === oldName;
  const hasSkillInGroup = (p, groupName) => p.skills.some(s => SKILL_GROUPS[groupName]?.includes(s));
  const getActiveSkillInGroup = (p, groupName) => p.skills.find(s => SKILL_GROUPS[groupName]?.includes(s));

  // 카드 전환 시 특성 재적용
  const applyTraits = (p) => {
    if (hasTrait(p, '키보드 워리어', '암살자')) p.crit += 25;
  };

  applyTraits(p1);
  applyTraits(p2);

  // 모든 로그 항목에 포함할 상태 스냅샷 헬퍼
  const mkState = () => ({
    p1Hp: Math.max(0, p1.hp),
    p2Hp: Math.max(0, p2.hp),
    p1CardIdx,
    p2CardIdx,
    p1MaxHp: p1.originalHp,
    p2MaxHp: p2.originalHp
  });

  const log = [{ type: 'start', text: `교전 개시: [${p1.name}] VS [${p2.name}]`, state: mkState() }];

  // 선공 판정 + 선공 스킬 알림
  let p1First = p1.spd >= p2.spd;
  const p1Preemptive = getActiveSkillInGroup(p1, 'PREEMPTIVE');
  const p2Preemptive = getActiveSkillInGroup(p2, 'PREEMPTIVE');
  if (p1Preemptive && !p2Preemptive) p1First = true;
  if (!p1Preemptive && p2Preemptive) p1First = false;

  if (p1First && p1Preemptive) {
    log.push({ type: 'skill', text: `✨ [${p1.name}]의 <${p1Preemptive}> 발동! 무조건 선공!`, state: mkState(), actor: p1.key, skill: p1Preemptive });
  } else if (!p1First && p2Preemptive) {
    log.push({ type: 'skill', text: `✨ [${p2.name}]의 <${p2Preemptive}> 발동! 무조건 선공!`, state: mkState(), actor: p2.key, skill: p2Preemptive });
  }

  let turn = 0;
  let battleOver = false;

  while (!battleOver && p1.hp > 0 && p2.hp > 0 && turn < 200) {
    turn++;
    let switchOccurred = false;

    for (const attacker of p1First ? [p1, p2] : [p2, p1]) {
      if (switchOccurred || battleOver) break;
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

      if (Math.random() * 100 < dodgeChance) {
        log.push({ type: 'dodge', text: `슈슉! [${defender.name}]의 신들린 무빙!`, state: mkState(), actor: defender.key });
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

      // 스킬 로그
      for (const s of activatedSkills) {
        log.push({ type: 'skill', text: `✨ [${attacker.name}]의 특수 프로토콜 <${s}> 발동!`, state: mkState(), actor: attacker.key, skill: s });
      }

      // 방어력 계산
      let finalDef = defender.def
        + (hasSkillInGroup(defender, 'DEFENSE') ? 10 : 0)
        + (hasTrait(defender, '무쇠뚝배기', '강철 바디') ? 15 : 0)
        + (hasTrait(defender, '월급 루팡', null) ? 10 : 0);
      if (transcendSkill) finalDef = 0;

      damage = Math.max(1, Math.floor(damage * (1 - Math.min(90, finalDef) / 100)));
      defender.hp -= damage;
      defender.damageTaken += damage;

      log.push({
        type: isCrit ? 'critical' : 'attack',
        text: `[${attacker.name}] ${isCrit ? "뼈와 살이 분리되는 일격!!" : "퍼억! 데미지가 들어갑니다."} (-${Math.floor(damage)})`,
        state: mkState(),
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
            state: mkState(),
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
          state: mkState(),
          actor: defender.key
        });
      }

      // ── 카드 교체 처리 ──────────────────────────────────────────
      if (defender.hp <= 0) {
        if (defender.key === 'p1' && p1CardIdx + 1 < p1Cards.length) {
          p1CardIdx++;
          const newCard = makeP(p1Cards[p1CardIdx], 'p1');
          applyTraits(newCard);
          Object.assign(p1, newCard);
          log.push({ type: 'switch', text: `⚡ [${p1.name}] 출격!`, state: mkState(), actor: 'p1', cardIdx: p1CardIdx });
          switchOccurred = true;
        } else if (defender.key === 'p2' && p2CardIdx + 1 < p2Cards.length) {
          p2CardIdx++;
          const newCard = makeP(p2Cards[p2CardIdx], 'p2');
          applyTraits(newCard);
          Object.assign(p2, newCard);
          log.push({ type: 'switch', text: `⚡ [${p2.name}] 출격!`, state: mkState(), actor: 'p2', cardIdx: p2CardIdx });
          switchOccurred = true;
        } else {
          battleOver = true;
        }
      }
    }
  }

  const isP1Win = p1.hp > 0;
  log.push({
    type: 'end',
    text: `🏁 교전 종료! 승리: [${isP1Win ? p1.name : p2.name}]`,
    state: mkState(),
    winner: isP1Win ? 'p1' : 'p2'
  });

  return log;
};
