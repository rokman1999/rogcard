// BattleAISetupView: AI 전투 준비 화면
// 출전 카드 변경 가능, AI 상대 카드 미리보기, 예상 보상 표시

import React from 'react';
import { Crosshair } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const BattleAISetupView = () => {
  const {
    myCards, selectedCard,
    aiOpponent, battleReward,
    setCurrentView,
    wrapClick, handleHover,
    startAIBattleSetup, executeAIBattle
  } = useGame();

  // aiOpponent가 없으면 첫 카드로 자동 셋업 후 로딩 반환
  if (!selectedCard || !aiOpponent) {
    if (myCards.length > 0) startAIBattleSetup(myCards[0]);
    return null;
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <h2 className="text-3xl font-mono font-light tracking-[0.2em] text-white mb-12 uppercase">AI 교전 준비</h2>

      {/* 출전 카드 선택 가로 스크롤 */}
      <div className="w-full max-w-5xl mb-8">
        <h3 className="text-white/50 font-mono text-xs tracking-widest mb-4 text-center uppercase">출전 카드 변경</h3>
        {/* pt-8을 추가하여 카드 확대 시 위쪽이 잘리지 않도록 수정 */}
        <div className="flex overflow-x-auto gap-4 pb-4 pt-8 px-2 custom-scrollbar">
          {myCards.map(card => (
            <div key={card.id} className="min-w-[140px] max-w-[140px] md:min-w-[160px] md:max-w-[160px] flex-shrink-0 cursor-pointer" onClick={wrapClick(() => startAIBattleSetup(card))}>
              <CardItem card={card} className={`transition-all duration-300 ${selectedCard?.id === card.id ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-100'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* 대전 정보 패널 */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-5xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 relative transition-all">
        <HUDCorner />
        <div className="flex flex-col items-center flex-1">
          <h3 className="text-white/50 font-mono text-xs tracking-widest mb-6 uppercase">아군 자산</h3>
          <div className="w-56"><CardItem card={selectedCard} /></div>
        </div>
        <div className="flex flex-col items-center flex-1 w-full min-w-[300px]">
          <div className="text-white/40 text-xs tracking-[0.2em] font-mono mb-2">EXPECTED REWARD</div>
          <div className="text-amber-400 font-mono font-bold text-3xl bg-white/5 px-6 py-3 rounded-md border border-amber-500/30 mb-8 whitespace-nowrap">{formatMoney(battleReward)} GOLD</div>
          <div className="w-full text-center">
            <button onClick={wrapClick(executeAIBattle)} onMouseEnter={handleHover} className="w-full py-4 bg-white/10 border border-white/20 text-white font-mono text-sm hover:bg-white hover:text-black transition-all uppercase font-bold">교전 시작</button>
          </div>
          <button onClick={wrapClick(() => setCurrentView('battle_select'))} className="mt-10 text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors">뒤로 가기</button>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h3 className="text-white/50 font-mono text-xs tracking-widest mb-6 uppercase flex items-center gap-2">
            <Crosshair size={14} strokeWidth={1} /> 적대 자산 (AI)
          </h3>
          <div className="w-56"><CardItem card={aiOpponent} /></div>
        </div>
      </div>
    </div>
  );
};

export default BattleAISetupView;
