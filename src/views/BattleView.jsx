// BattleView: 전투 애니메이션 화면 (AI 대전 / PvP 공용)
// battleType으로 AI vs PvP를 구분하여 카드와 보상 처리를 달리함
// 전투 로그를 순차 재생하며 각 이벤트 타입별 애니메이션 클래스 적용

import React from 'react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const BattleView = () => {
  const {
    selectedCard, aiOpponent,
    pvpRoomData, battleType,
    battleLog, battleStep, liveState, battleResult,
    battleReward, battleBet,
    setPvpRoomId, setCurrentView,
    wrapClick
  } = useGame();

  if (!liveState) return null;

  const p1HpPercent = Math.max(0, (liveState.p1Hp / liveState.p1Max) * 100);
  const p2HpPercent = Math.max(0, (liveState.p2Hp / liveState.p2Max) * 100);
  const action = liveState.currentAction;
  const isP1Acting = action?.actor === 'p1' || action?.attacker === 'p1';
  const isP2Acting = action?.actor === 'p2' || action?.attacker === 'p2';
  const isP1Hit = action?.defender === 'p1';
  const isP2Hit = action?.defender === 'p2';

  // 같은 애니메이션을 연속 재생하면 브라우저가 무시하므로 parity로 클래스 교체하여 재트리거
  const stepParity = battleStep % 2;
  let p1Anim = '';
  let p2Anim = '';

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

  // PvP에서 각 플레이어 카드 결정
  const p1Card = battleType === 'PvP' ? pvpRoomData?.hostCard : selectedCard;
  const p2Card = battleType === 'PvP' ? pvpRoomData?.guestCard : aiOpponent;

  return (
    <div className="min-h-[85vh] flex flex-col p-4 max-w-6xl mx-auto relative overflow-hidden animate-fade-in z-10 w-full">
      {/* 치명타 시 화면 전체 붉은 플래시 효과 */}
      {action?.type === 'critical' && (
        <div key={`flash-${battleStep}`} className="absolute inset-0 bg-red-600/40 animate-flash-red pointer-events-none z-0 mix-blend-color-burn"></div>
      )}

      {/* 체력바 영역 */}
      <div className="flex justify-between items-center gap-8 mb-16 mt-6 font-mono border-b border-white/10 pb-8 z-10">
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-sm tracking-widest mb-2 font-bold uppercase text-white/80">
            <span>{p1Card?.name}</span>
            <span className="text-white drop-shadow-[0_0_5px_#fff]">{Math.ceil(liveState.p1Hp)} <span className="text-xs text-white/50">/ {liveState.p1Max}</span></span>
          </div>
          <div className="h-6 bg-white/5 relative overflow-hidden border border-white/20 p-0.5" style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
            <div className={`h-full transition-all duration-300 ease-out ${p1HpPercent > 50 ? 'bg-emerald-400' : p1HpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} style={{ width: `${p1HpPercent}%` }}></div>
          </div>
        </div>
        <div className="text-2xl font-light text-white/20 tracking-[0.2em] font-mono">VS</div>
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-sm tracking-widest mb-2 font-bold uppercase text-white/80">
            <span className="text-white drop-shadow-[0_0_5px_#fff]">{Math.ceil(liveState.p2Hp)} <span className="text-xs text-white/50">/ {liveState.p2Max}</span></span>
            <span>{p2Card?.name}</span>
          </div>
          <div className="h-6 bg-white/5 relative overflow-hidden flex justify-end border border-white/20 p-0.5" style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
            <div className={`h-full transition-all duration-300 ease-out ${p2HpPercent > 50 ? 'bg-emerald-400' : p2HpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} style={{ width: `${p2HpPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* 카드 전투 애니메이션 영역 */}
      <div className="flex-1 flex items-center justify-center gap-16 md:gap-40 relative z-10 perspective-1000">
        <div className={`transition-all duration-100 ${p1Anim} ${liveState.p1Hp <= 0 ? 'opacity-20 grayscale blur-[2px]' : ''} relative`}>
          <div className="w-48 md:w-64 shadow-[0_0_30px_rgba(0,0,0,1)]">
            <CardItem card={p1Card} />
          </div>
          {/* 피격 데미지 수치 floating 표시 */}
          {isP1Hit && action?.damage > 0 && (
            <div key={`dmg-p1-${battleStep}`} className={`absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap ${action?.type === 'critical' ? 'animate-floating-crit-dmg text-7xl font-black text-red-500' : 'animate-floating-dmg text-5xl font-bold text-white'}`}>
              -{action.damage}
            </div>
          )}
          {action?.type === 'dodge' && action?.actor === 'p1' && (
            <div key={`dodge-p1-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black italic text-cyan-400 animate-float-up pointer-events-none z-50">EVADED!</div>
          )}
        </div>

        <div className={`transition-all duration-100 ${p2Anim} ${liveState.p2Hp <= 0 ? 'opacity-20 grayscale blur-[2px]' : ''} relative`}>
          <div className="w-48 md:w-64 shadow-[0_0_30px_rgba(0,0,0,1)]">
            <CardItem card={p2Card} />
          </div>
          {isP2Hit && action?.damage > 0 && (
            <div key={`dmg-p2-${battleStep}`} className={`absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap ${action?.type === 'critical' ? 'animate-floating-crit-dmg text-7xl font-black text-red-500' : 'animate-floating-dmg text-5xl font-bold text-white'}`}>
              -{action.damage}
            </div>
          )}
          {action?.type === 'dodge' && action?.actor === 'p2' && (
            <div key={`dodge-p2-${battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold italic text-cyan-400 animate-float-up pointer-events-none z-50">EVADED!</div>
          )}
        </div>
      </div>

      {/* 전투 결과 오버레이 */}
      {battleResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="bg-transparent border border-white/20 p-12 text-center max-w-lg w-full relative">
            <HUDCorner />
            <h2 className={`font-sans font-black text-5xl tracking-[0.2em] mb-8 uppercase ${battleResult === 'win' ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
              {battleResult === 'win' ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <div className="text-base mb-12 font-mono tracking-widest text-white/50 uppercase bg-white/5 p-4 rounded border border-white/10">
              <p className={battleResult === 'win' ? 'text-emerald-400 font-bold' : ''}>
                {battleResult === 'win'
                  ? `자금 획득: +${formatMoney(battleType === 'AI' ? battleReward : battleBet * 2)} GOLD`
                  : `자금 손실: -${formatMoney(battleType === 'AI' ? 0 : battleBet)} GOLD`}
              </p>
            </div>
            <button
              onClick={wrapClick(() => { setPvpRoomId(null); setCurrentView('lobby'); })}
              className="w-full py-4 bg-white/10 text-white hover:bg-white hover:text-black transition-all font-mono text-sm uppercase font-bold"
            >시스템 복귀</button>
          </div>
        </div>
      )}

      {/* 전투 로그 텍스트 스크롤 */}
      <div className="h-40 mt-10 overflow-y-auto flex flex-col justify-end font-mono text-[12px] tracking-widest text-white/40 border-t border-white/10 pt-4 custom-scrollbar z-10 bg-black/40 rounded-t-xl px-4 transition-all hover:bg-black/60">
        {battleLog.slice(0, battleStep + 1).map((log, i) => (
          <div key={i} className={`py-1 animate-slide-up uppercase transition-colors ${log.type === 'critical' ? 'text-red-400 font-bold text-lg' : ''} ${log.type === 'skill' ? 'text-cyan-300 font-bold text-sm' : ''} ${log.type === 'heal' ? 'text-emerald-400 font-bold text-sm' : ''}`}>
            {log.text}
          </div>
        ))}
        <div ref={el => el && el.scrollIntoView()} />
      </div>
    </div>
  );
};

export default BattleView;
