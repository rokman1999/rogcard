// QuestsView: 일일 퀘스트 화면
// 날짜 기반으로 진행도를 초기화하고, 목표 달성 시 보상 수령 버튼 활성화
// 수령 완료된 퀘스트는 disabled 처리하여 중복 수령 방지

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import { QUESTS } from '../constants/gameData';
import { formatMoney } from '../utils/formatUtils';

const QuestsView = () => {
  const {
    userData, isProcessing,
    setCurrentView,
    wrapClick,
    handleClaimQuest,
  } = useGame();

  const today = new Date().toISOString().split('T')[0];
  const qData = userData?.quests?.date === today
    ? userData.quests
    : { ai: 0, win_ai: 0, enhance: 0, pvp: 0, win_pvp: 0, chat: 0, market: 0, buy_market: 0, create_card: 0, sell: 0, login: 0, guestbook: 0, challenge_sent: 0, claimed: [] };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto animate-fade-in relative z-10 min-h-[80vh] flex flex-col w-full">
      <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/20">
        <h2 className="text-3xl font-mono font-light text-white tracking-[0.2em] uppercase">일일 퀘스트</h2>
        <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/50 hover:text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {QUESTS.map(q => {
          const currentCount = qData[q.type] || 0;
          const isCompleted = currentCount >= q.target;
          const isClaimed = qData.claimed?.includes(q.id);

          return (
            <div key={q.id} className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col justify-between gap-6">
              <HUDCorner />
              <div>
                <h3 className="font-mono font-light text-xl text-white mb-2 tracking-widest">{q.title}</h3>
                <p className="text-sm font-sans text-white/50 mb-4 h-10">{q.desc}</p>
                <div className="font-mono text-sm font-bold text-amber-400 border-t border-white/10 pt-4">
                  보상: {formatMoney(q.reward)} G
                </div>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="font-mono text-white/70 text-sm bg-black/40 px-3 py-1 border border-white/10">
                  진행도: {Math.min(currentCount, q.target)} / {q.target}
                </span>
                {isClaimed ? (
                  <button disabled className="px-6 py-2 bg-white/5 text-white/30 font-mono text-xs border border-white/5">수령 완료</button>
                ) : (
                  <button
                    onClick={wrapClick(() => handleClaimQuest(q.id, q.reward))}
                    disabled={!isCompleted || isProcessing}
                    className={`px-6 py-2 font-mono text-xs transition-colors ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white font-bold animate-pulse' : 'bg-white/10 text-white/50 border border-white/20 disabled:opacity-50'}`}
                  >
                    보상 수령
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestsView;
