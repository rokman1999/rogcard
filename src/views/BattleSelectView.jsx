// BattleSelectView: AI 대전 vs PvP 선택 화면
// 카드가 없으면 선택 불가 - 최소 1장의 카드가 있어야 진입 가능

import React from 'react';
import { Cpu, User } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';

const BattleSelectView = () => {
  const {
    myCards, selectedCard, setSelectedCard,
    setCurrentView,
    wrapClick,
    startAIBattleSetup, showToast
  } = useGame();

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto animate-fade-in relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
      <h2 className="text-3xl font-mono font-light text-white mb-16 tracking-[0.2em] uppercase drop-shadow-md">전투 모드 선택</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* AI 대전: 가장 첫 번째 카드로 자동 선택하여 바로 진입 */}
        <div
          onClick={wrapClick(() => {
            if (myCards.length === 0) { showToast("보유한 카드가 없습니다", "error"); return; }
            startAIBattleSetup(myCards[0]);
          })}
          className="group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 cursor-pointer text-center flex flex-col items-center hover:bg-white/[0.05] hover:-translate-y-2 transition-all"
        >
          <HUDCorner />
          <Cpu size={48} strokeWidth={1} className="text-white/30 group-hover:text-white mb-8 transition-colors group-hover:scale-110" />
          <h3 className="text-xl font-mono font-light text-white mb-3 tracking-widest uppercase">AI와 대전하기</h3>
          <p className="text-white/40 text-base font-sans font-light">가상 적들과 대결하여 골드를 벌어보세요.</p>
        </div>

        {/* PvP: 카드 선택 후 방 목록으로 이동 */}
        <div
          onClick={wrapClick(() => {
            if (myCards.length === 0) { showToast("보유한 카드가 없습니다", "error"); return; }
            if (!selectedCard) setSelectedCard(myCards[0]);
            setCurrentView('pvp_setup');
          })}
          className="group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 cursor-pointer text-center flex flex-col items-center hover:bg-white/[0.05] hover:-translate-y-2 transition-all"
        >
          <HUDCorner />
          <User size={48} strokeWidth={1} className="text-white/30 group-hover:text-white mb-8 transition-colors group-hover:scale-110" />
          <h3 className="text-xl font-mono font-light text-white mb-3 tracking-widest uppercase">유저와 대결하기</h3>
          <p className="text-white/40 text-base font-sans font-light">방을 개설하고 실시간으로 대결하세요.</p>
        </div>
      </div>
      <button onClick={wrapClick(() => setCurrentView('lobby'))} className="mt-16 text-white/30 hover:text-white font-mono text-sm tracking-widest uppercase transition-colors">뒤로 가기</button>
    </div>
  );
};

export default BattleSelectView;
