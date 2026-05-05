// CardDetailsView: 카드 상세 정보 + 프레임 스킨 장착 화면
// 스킬 클릭 시 설명 표시, 보유한 프레임만 장착 가능

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { SKILLS_DATA } from '../constants/gameData';

const CardDetailsView = () => {
  const {
    userData, selectedCard, isProcessing,
    selectedSkillDesc, setSelectedSkillDesc,
    setCurrentView,
    wrapClick,
    handleEquipCardFrame
  } = useGame();

  if (!selectedCard) return null;

  // 장착 가능한 프레임 목록 (상점과 동일한 목록 - 단, 보유 여부는 userData.frames로 판별)
  const framesList = [
    { id: 'frame_rust', name: '녹슨 고철', desc: '세월의 흔적이 묻은 앤틱 프레임' },
    { id: 'frame_hologram', name: '홀로그램 스캔라인', desc: '화려한 스캔라인 오버레이' },
    { id: 'frame_blood', name: '블러드 펄스', desc: '핏빛 쉐도우 효과' },
    { id: 'frame_obsidian', name: '옵시디언 엣지', desc: '고급스러운 다크 엣지 음영' },
    { id: 'frame_gold', name: '골든 아우라', desc: '황금빛 프레임 효과' },
    { id: 'frame_neon', name: '네온 사이버', desc: '사이버펑크 네온 효과' }
  ];

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
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded text-sm font-mono font-bold">{selectedCard.uniqueTrait.name}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-mono text-xs text-white/40 block mb-1">DESCRIPTION</span>
                <span className="font-sans text-base text-white/80 block bg-black/20 p-3 rounded">"{selectedCard.description}"</span>
              </div>
              {selectedCard.uniqueTrait && (
                <div>
                  <span className="font-mono text-xs text-white/40 block mb-1">UNIQUE TRAIT</span>
                  <span className="font-sans text-base text-emerald-300 block bg-emerald-900/20 p-3 rounded">{selectedCard.uniqueTrait.desc}</span>
                </div>
              )}
              <div>
                <span className="font-mono text-xs text-white/40 block mb-3">ACQUIRED SKILLS (클릭하여 설명 확인)</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.unlockedSkills.length > 0
                    ? selectedCard.unlockedSkills.map(s => (
                      <button
                        key={s}
                        onClick={wrapClick(() => setSelectedSkillDesc(s))}
                        className={`px-3 py-1.5 font-mono text-sm rounded border border-white/10 ${selectedSkillDesc === s ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >{s}</button>
                    ))
                    : <span className="text-white/30 font-mono text-sm">보유 스킬 없음</span>
                  }
                </div>
                {/* 선택된 스킬의 상세 설명 표시 */}
                {selectedSkillDesc && (
                  <div className="mt-4 p-4 bg-black/40 border border-emerald-500/30 rounded animate-fade-in">
                    <span className="text-emerald-400 font-bold font-mono text-base block mb-1">{selectedSkillDesc}</span>
                    <span className="text-white/80 font-sans text-base">{SKILLS_DATA[selectedSkillDesc]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 프레임 장착 패널 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
            <HUDCorner />
            <h4 className="font-mono text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">프레임 장착</h4>
            <div className="flex flex-col gap-3 font-mono text-sm h-64 overflow-y-auto custom-scrollbar pr-2">
              {framesList.map(frame => {
                const isOwned = userData?.frames?.includes(frame.id);
                const isEquipped = selectedCard.equippedFrame === frame.id;
                return (
                  <div key={frame.id} className={`flex items-center justify-between p-4 border border-white/10 ${isEquipped ? 'border-emerald-500/50 bg-emerald-500/10' : 'bg-black/40'}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold text-base ${isEquipped ? 'text-emerald-400' : 'text-white'}`}>{frame.name}</span>
                      <span className="text-white/40 text-xs">{frame.desc}</span>
                    </div>
                    <div>
                      {!isOwned
                        ? <span className="text-white/30 text-xs bg-white/5 px-3 py-1.5 rounded">미보유</span>
                        : isEquipped
                          ? <button onClick={wrapClick(() => handleEquipCardFrame(null))} disabled={isProcessing} className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white">해제</button>
                          : <button onClick={wrapClick(() => handleEquipCardFrame(frame.id))} disabled={isProcessing} className="px-5 py-2.5 bg-white/10 text-white rounded hover:bg-white hover:text-black">장착</button>
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
