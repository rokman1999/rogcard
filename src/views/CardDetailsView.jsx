// CardDetailsView: 카드 상세 정보 + 거래소 등록 + 프레임 스킨 장착 화면
// FRAMES_DATA를 gameData에서 가져와 하드코딩 없이 렌더링
// TRAIT_COLORS로 각 특성별 색상 표시

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { SKILLS_DATA, FRAMES_DATA, TRAIT_COLORS } from '../constants/gameData';
import { formatMoney } from '../utils/formatUtils';

const CardDetailsView = () => {
  const {
    userData, selectedCard, isProcessing,
    selectedSkillDesc, setSelectedSkillDesc,
    sellPriceInput, setSellPriceInput,
    setCurrentView,
    wrapClick, playSfx,
    handleEquipCardFrame,
    handleListMarket, handleCancelMarket,
  } = useGame();

  if (!selectedCard) return null;

  const traitColorClass = selectedCard.uniqueTrait ? (TRAIT_COLORS[selectedCard.uniqueTrait.name] || 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300') : '';

  return (
    <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
      <div className="w-full flex justify-start mb-8">
        <button onClick={wrapClick(() => setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>
      <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full">
        <div className="w-64 md:w-80 lg:w-[360px]">
          <CardItem card={selectedCard} className="pointer-events-none" />
        </div>
        <div className="flex-1 w-full flex flex-col gap-8">
          {/* 카드 상세 정보 패널 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
            <HUDCorner />
            <h4 className="font-mono text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">카드 상세 정보</h4>
            <div className="flex flex-col gap-6">
              <div>
                <span className="font-mono text-xs text-white/40 block mb-1">DESIGNATION</span>
                <div className="flex items-center gap-4">
                  <span className="font-sans font-bold text-3xl text-white">{selectedCard.name}</span>
                  {selectedCard.uniqueTrait && (
                    <span className={`px-2 py-1 border text-sm font-mono font-bold whitespace-nowrap ${traitColorClass}`}>
                      {selectedCard.uniqueTrait.name}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-mono text-xs text-white/40 block mb-1">DESCRIPTION</span>
                <span className="font-sans text-base text-white/80 block bg-black/20 p-3 border border-white/5">"{selectedCard.description}"</span>
              </div>
              {selectedCard.uniqueTrait && (
                <div>
                  <span className="font-mono text-xs text-white/40 block mb-1">UNIQUE TRAIT</span>
                  <span className={`font-sans text-base block p-3 border ${traitColorClass}`}>{selectedCard.uniqueTrait.desc}</span>
                </div>
              )}
              <div>
                <span className="font-mono text-xs text-white/40 block mb-3">ACQUIRED SKILLS (클릭하여 설명 확인)</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.unlockedSkills.length > 0
                    ? selectedCard.unlockedSkills.map(s => (
                      <button
                        key={s}
                        onClick={() => { playSfx('click'); setSelectedSkillDesc(s); }}
                        className={`px-3 py-1.5 font-mono text-sm border transition-colors ${selectedSkillDesc === s ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                      >{s}</button>
                    ))
                    : <span className="text-white/30 font-mono text-sm">보유 스킬 없음</span>
                  }
                </div>
                {selectedSkillDesc && (
                  <div className="mt-4 p-4 bg-black/40 border border-emerald-500/30 animate-fade-in">
                    <span className="text-emerald-400 font-bold font-mono text-base block mb-1">{selectedSkillDesc}</span>
                    <span className="text-white/80 font-sans text-base">{SKILLS_DATA[selectedSkillDesc]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 거래소 등록 패널 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
            <HUDCorner />
            <h4 className="font-mono text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">거래소 등록</h4>
            {!selectedCard.isSelling ? (
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-white/40 text-xs font-mono mb-2">판매 등록가 (GOLD)</label>
                  <input
                    type="number"
                    value={sellPriceInput}
                    onChange={e => setSellPriceInput(e.target.value)}
                    placeholder="금액 입력"
                    className="w-full bg-black/40 border-b border-white/20 p-2 text-white font-mono focus:border-white outline-none"
                  />
                </div>
                <button
                  onClick={wrapClick(() => handleListMarket(selectedCard, sellPriceInput))}
                  disabled={isProcessing || !sellPriceInput}
                  className="px-6 py-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white font-mono text-sm disabled:opacity-50"
                >등록</button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-black/40 p-4 border border-amber-500/30">
                <span className="text-amber-400 font-mono text-sm">현재 판매 중: {formatMoney(selectedCard.price)} G</span>
                <button
                  onClick={wrapClick(() => handleCancelMarket(selectedCard))}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-white/10 text-white hover:bg-white hover:text-black font-mono text-xs disabled:opacity-50"
                >판매 취소</button>
              </div>
            )}
          </div>

          {/* 프레임 장착 패널 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
            <HUDCorner />
            <h4 className="font-mono text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">프레임 장착</h4>
            <div className="flex flex-col gap-3 font-mono text-sm h-64 overflow-y-auto custom-scrollbar pr-2">
              {FRAMES_DATA.map(frame => {
                const isOwned = userData?.frames?.includes(frame.id);
                const isEquipped = selectedCard.equippedFrame === frame.id;
                return (
                  <div key={frame.id} className={`flex items-center justify-between p-4 border border-white/10 ${isEquipped ? 'border-emerald-500/50 bg-emerald-500/10' : 'bg-black/40'}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold text-base ${isEquipped ? 'text-emerald-400' : frame.color}`}>{frame.name}</span>
                      <span className="text-white/40 text-xs">{frame.desc}</span>
                    </div>
                    <div>
                      {!isOwned
                        ? <span className="text-white/30 text-xs bg-white/5 px-3 py-1.5 border border-white/10">미보유</span>
                        : isEquipped
                          ? <button onClick={wrapClick(() => handleEquipCardFrame(null))} disabled={isProcessing} className="px-5 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white">해제</button>
                          : <button onClick={wrapClick(() => handleEquipCardFrame(frame.id))} disabled={isProcessing} className="px-5 py-2.5 bg-white/10 text-white hover:bg-white hover:text-black">장착</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsView;
