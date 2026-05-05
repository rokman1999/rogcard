// DeckView: 카드 관리 화면 + 신규 카드 생성 모달
// 보유 카드(거래소 등록 중 제외)를 그리드로 표시하고 호버 시 액션 버튼 노출
// 초월 합성 버튼: LV.20 카드 2장 이상 보유 시 활성화 유도

import { useState } from 'react';
import { Plus, Info, ArrowRight, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { CREATE_CARD_COST } from '../constants/gameData';
import { formatMoney } from '../utils/formatUtils';

const DeckView = () => {
  const {
    userData, myCards, isProcessing,
    setCurrentView, setSelectedCard,
    showCreateModal, setShowCreateModal,
    cropImage, setCropImage, imgLoaded, setImgLoaded,
    cropZoom, cropPan, setCropPan, imgRef,
    wrapClick,
    handleCreateCard, handleSellCard, startAIBattleSetup,
    handleFileChange, handleCropPointerDown, handleCropPointerMove,
    handleCropPointerUp, handleZoomChange
  } = useGame();

  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  const maxSlots = userData?.maxSlots || 3;
  const availableCards = myCards.filter(c => !c.isSelling);
  const sellingCards = myCards.filter(c => c.isSelling);
  // 활성 카드 먼저, 거래소 등록 중인 카드 뒤에 표시
  const displayCards = [...availableCards, ...sellingCards];
  const renderSlots = Array.from({ length: maxSlots });

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in min-h-[80vh] relative z-10 flex flex-col">
      <div className="w-full flex justify-start mb-6">
        <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-6 border-b border-white/20">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-mono font-light text-white tracking-[0.2em] uppercase">카드 관리</h2>
          <span className="font-mono text-sm text-white/40 tracking-widest bg-white/5 px-3 py-1 border border-white/10">보유량: {availableCards.length}/{maxSlots}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={wrapClick(() => setCurrentView('transcend'))}
            className="flex items-center gap-3 px-6 py-3 text-cyan-300 font-mono font-light text-sm transition-all uppercase hover:scale-105 bg-cyan-900/20 border border-cyan-500/50 hover:bg-cyan-500 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Sparkles size={14} /> 초월 합성
          </button>
          <button
            onClick={wrapClick(() => setShowCreateModal(true))}
            className="flex items-center gap-3 px-6 py-3 text-white font-mono font-light text-sm transition-all uppercase hover:scale-105 bg-white/10 border border-white/20 hover:bg-white hover:text-black"
          >
            <Plus size={14} /> 신규 카드 생성 [-{formatMoney(CREATE_CARD_COST)} G]
          </button>
        </div>
      </div>

      {myCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 font-sans font-light text-xl text-white/40 bg-white/[0.01] border border-white/5 backdrop-blur-md">
          <span className="mb-2">사용 가능한 카드가 없습니다.</span>
          <span className="text-sm">신규 카드를 생성하세요.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {renderSlots.map((_, i) => {
            const card = displayCards[i];
            if (!card) return (
              <div key={`empty-${i}`} className="w-full aspect-[2/3.1] border-2 border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-white/20 font-mono text-sm">
                <Plus size={24} className="mb-2 opacity-50" />
                <span>EMPTY SLOT</span>
              </div>
            );

            // 거래소 등록 중인 카드: 비활성화 + 띠배너 표시
            if (card.isSelling) return (
              <div key={card.id} className="relative opacity-50 grayscale pointer-events-none select-none">
                <CardItem card={card} hideSkills />
                {/* 거래소 등록 중 띠배너 */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-none">
                  <div className="w-full bg-amber-500 text-black font-mono font-bold text-[10px] text-center py-2 px-2 tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.8)] border-y border-amber-300">
                    거래소에 올라가있는 카드입니다
                  </div>
                </div>
              </div>
            );

            return (
              <div key={card.id} className="relative group">
                <CardItem card={card} hideSkills />
                {/* 호버 시 카드 위에 액션 버튼 오버레이 표시 */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-md z-20 p-5">
                  <button onClick={wrapClick(() => { setSelectedCard(card); setCurrentView('card_details'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105">
                    <Info size={14} className="inline mr-1" /> 상세 정보
                  </button>
                  {card.level < 30 && (
                    <button onClick={wrapClick(() => { setSelectedCard(card); setCurrentView('enhance'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105">카드 강화</button>
                  )}
                  <button onClick={wrapClick(() => startAIBattleSetup(card))} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105">전투 참가</button>
                  <button onClick={wrapClick(() => handleSellCard(card))} className="w-full py-2 mt-2 text-white/50 bg-transparent font-mono text-[10px] underline hover:text-white hover:scale-105">카드 시스템 판매</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 카드 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <form onSubmit={handleCreateCard} className="bg-white/[0.02] border border-white/10 p-6 sm:p-10 w-full max-w-md relative animate-slide-up bg-black/40">
            <HUDCorner />
            <h3 className="font-mono font-light text-xl text-white mb-8 tracking-widest uppercase">신규 카드 생성</h3>
            {!cropImage ? (
              <div className="mb-8 w-full">
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full font-mono text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:bg-transparent file:text-white cursor-pointer p-2 border-b border-white/20" required />
              </div>
            ) : (
              <div className="mb-8 w-full flex flex-col items-center gap-4">
                {/* 이미지 크롭 영역: 드래그로 팬, 슬라이더로 줌 조작 */}
                <div
                  className="relative w-[200px] h-[310px] bg-black border border-white/20 overflow-hidden cursor-move touch-none shrink-0"
                  onMouseDown={handleCropPointerDown} onMouseMove={handleCropPointerMove}
                  onMouseUp={handleCropPointerUp} onMouseLeave={handleCropPointerUp}
                  onTouchStart={handleCropPointerDown} onTouchMove={handleCropPointerMove} onTouchEnd={handleCropPointerUp}
                >
                  <img
                    ref={imgRef} src={cropImage} alt="crop"
                    className="absolute max-w-none pointer-events-none"
                    onLoad={(e) => { setImgLoaded(true); setCropPan({ x: 0, y: 0 }); setImgNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight }); }}
                    style={(() => {
                      if (!imgLoaded || !imgNatural.w) return { width: 'auto', height: 'auto', left: '0px', top: '0px' };
                      const scale = Math.max(200 / imgNatural.w, 310 / imgNatural.h) * cropZoom;
                      return {
                        width: `${imgNatural.w * scale}px`,
                        height: `${imgNatural.h * scale}px`,
                        left: `${100 - (imgNatural.w * scale) / 2 + cropPan.x}px`,
                        top: `${155 - (imgNatural.h * scale) / 2 + cropPan.y}px`,
                      };
                    })()}
                  />
                </div>
                <input type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={handleZoomChange} className="w-[200px] accent-emerald-400 h-1 bg-white/20 appearance-none cursor-pointer mt-2" />
                <button type="button" onClick={() => setCropImage(null)} className="text-white/50 text-xs font-mono underline hover:text-white mt-1">다른 이미지 선택</button>
              </div>
            )}
            <div className="mb-6">
              <label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">이름 (최대 10자)</label>
              <input type="text" name="cardName" maxLength="10" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-sans text-lg focus:border-white uppercase" required />
            </div>
            <div className="mb-10">
              <label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">설명 (최대 60자)</label>
              <textarea name="cardDescription" maxLength="60" rows="3" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-sans text-base focus:border-white resize-none" placeholder="카드의 기원 기록"></textarea>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={wrapClick(() => setShowCreateModal(false))} className="flex-1 py-4 border border-white/20 text-white/50 font-mono text-sm uppercase hover:text-white">취소</button>
              <button type="submit" disabled={isProcessing} className="flex-1 py-4 bg-white/10 text-white border border-white/20 font-mono text-sm uppercase hover:bg-white hover:text-black disabled:opacity-30">{isProcessing ? '처리 중...' : '확인 및 생성'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DeckView;
