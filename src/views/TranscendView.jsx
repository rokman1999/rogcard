// TranscendView: 초월 합성 화면
// LV.20 카드 2장을 희생하여 LV.21 초월 카드를 생성하는 기능
// 합성 중 베이스 카드 글로우 + 제물 카드 소멸 애니메이션 적용

import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';
import CardItem from '../components/CardItem';

const TranscendView = () => {
  const {
    myCards,
    tCard1, setTCard1,
    tCard2, setTCard2,
    transcendState,
    isProcessing,
    setCurrentView,
    wrapClick,
    handleTranscend,
  } = useGame();

  const availableCards = myCards.filter(c => c.level === 20 && !c.isSelling);

  return (
    <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
      <div className="w-full flex justify-start mb-8">
        <button onClick={wrapClick(() => setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>
      <h2 className="text-4xl font-mono font-light text-cyan-300 mb-4 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">초월 합성</h2>
      <p className="text-white/60 font-sans mb-12 text-center">
        LV.20 최고 레벨 카드 두 장을 희생하여 <span className="text-cyan-300 font-bold">LV.21 초월자</span>를 탄생시킵니다.<br />
        합성 시 우측 제물 카드는 소멸하며 5,000,000 GOLD가 소모됩니다.
      </p>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 w-full max-w-5xl mb-12">
        {/* 베이스 카드 */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-1/3">
          <h3 className="font-mono text-cyan-300 tracking-widest text-sm uppercase">베이스 카드 (초월 대상)</h3>
          <div className={`w-56 md:w-64 transition-all duration-700 ${transcendState === 'merging' ? 'scale-110 drop-shadow-[0_0_50px_#0ff]' : ''} ${transcendState === 'success' ? 'animate-flash-bang' : ''}`}>
            {tCard1
              ? <CardItem card={tCard1} className="pointer-events-none" />
              : <div className="w-full aspect-[2/3.1] border-2 border-dashed border-cyan-500/30 flex items-center justify-center text-cyan-500/30 font-mono text-sm">SELECT LV.20</div>
            }
          </div>
          <select
            className="bg-black border border-cyan-500/50 text-cyan-300 font-mono p-3 outline-none focus:border-cyan-300 w-full"
            value={tCard1?.id || ''}
            onChange={(e) => setTCard1(availableCards.find(c => c.id === e.target.value))}
          >
            <option value="">베이스 카드 선택</option>
            {availableCards.map(c => <option key={c.id} value={c.id}>[LV.20] {c.name}</option>)}
          </select>
        </div>

        <div className="text-4xl text-cyan-500/50 animate-pulse hidden lg:block">
          <Plus size={48} />
        </div>

        {/* 제물 카드 */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-1/3">
          <h3 className="font-mono text-red-400 tracking-widest text-sm uppercase">제물 카드 (소멸)</h3>
          <div className={`w-56 md:w-64 transition-all duration-700 ${transcendState === 'merging' ? 'scale-90 opacity-0 blur-xl translate-x-[-100px]' : ''}`}>
            {tCard2
              ? <CardItem card={tCard2} className="pointer-events-none grayscale opacity-80" />
              : <div className="w-full aspect-[2/3.1] border-2 border-dashed border-red-500/30 flex items-center justify-center text-red-500/30 font-mono text-sm">SELECT LV.20</div>
            }
          </div>
          <select
            className="bg-black border border-red-500/50 text-red-400 font-mono p-3 outline-none focus:border-red-400 w-full"
            value={tCard2?.id || ''}
            onChange={(e) => setTCard2(availableCards.find(c => c.id === e.target.value))}
          >
            <option value="">제물 카드 선택</option>
            {availableCards.map(c => <option key={c.id} value={c.id}>[LV.20] {c.name}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={wrapClick(handleTranscend)}
        disabled={isProcessing || !tCard1 || !tCard2 || tCard1.id === tCard2.id || transcendState !== 'idle'}
        className="w-full max-w-md py-5 bg-cyan-900/20 border border-cyan-500 text-cyan-300 font-mono text-lg uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:shadow-none"
      >
        {tCard1 && tCard2 && tCard1.id === tCard2.id
          ? '같은 카드를 선택할 수 없습니다'
          : '초월 합성 [ -5,000,000 G ]'
        }
      </button>
    </div>
  );
};

export default TranscendView;
