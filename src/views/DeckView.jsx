// DeckView: 카드 관리 화면 + 신규 카드 생성 모달
// 보유 카드를 그리드로 표시하고 호버 시 액션 버튼 노출
// 이미지 크롭 기능을 내장하여 카드 사진을 카드 비율(2:3.1)에 맞게 편집

import React from 'react';
import { Plus, Info, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const DeckView = () => {
  const {
    userData, myCards, isProcessing,
    setCurrentView, setSelectedCard,
    showCreateModal, setShowCreateModal,
    cropImage, setCropImage, imgLoaded, setImgLoaded,
    cropZoom, cropPan, imgRef,
    wrapClick, handleHover,
    handleCreateCard, handleSellCard, startAIBattleSetup,
    handleFileChange, handleCropPointerDown, handleCropPointerMove,
    handleCropPointerUp, handleZoomChange
  } = useGame();

  const maxSlots = userData?.maxSlots || 3;
  const renderSlots = Array.from({ length: maxSlots });

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in min-h-[80vh] relative z-10 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-6 border-b border-white/20">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-mono font-light text-white tracking-[0.2em] uppercase">카드 관리</h2>
          <span className="font-mono text-sm text-white/40 tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">보유량: {myCards.length}/{maxSlots}</span>
        </div>
        <div className="relative">
          <button onClick={wrapClick(() => setShowCreateModal(true))} className="flex items-center gap-3 px-6 py-3 text-white font-mono font-light text-sm transition-all uppercase hover:scale-105 bg-white/10 border border-white/20 hover:bg-white hover:text-black">
            <Plus size={14} /> 신규 카드 생성 [-{formatMoney(5000)} G]
          </button>
        </div>
      </div>

      {myCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 font-sans font-light text-xl text-white/40 bg-white/[0.01] border border-white/5 backdrop-blur-md">
          <span className="mb-2">보유 중인 카드가 없습니다.</span>
          <span>신규 카드를 생성하여 시작하세요.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {renderSlots.map((_, i) => {
            const card = myCards[i];
            if (!card) return (
              <div key={`empty-${i}`} className="w-full aspect-[2/3.1] border-2 border-dashed border-white/10 bg-white/[0.01] rounded-[10px] flex flex-col items-center justify-center text-white/20 font-mono text-sm">
                <Plus size={24} className="mb-2 opacity-50" />
                <span>EMPTY SLOT</span>
              </div>
            );
            return (
              <div key={card.id} className="relative group">
                <CardItem card={card} />
                {/* 호버 시 카드 위에 액션 버튼 오버레이 표시 */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-md z-20 p-5 rounded-[12px]">
                  <button onClick={wrapClick(() => { setSelectedCard(card); setCurrentView('card_details'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-xs uppercase hover:bg-white hover:text-black hover:scale-105">
                    <Info size={14} className="inline mr-1" /> 상세 정보
                  </button>
                  <button onClick={wrapClick(() => { setSelectedCard(card); setCurrentView('enhance'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-xs uppercase hover:bg-white hover:text-black hover:scale-105">카드 강화</button>
                  <button onClick={wrapClick(() => startAIBattleSetup(card))} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-xs uppercase hover:bg-white hover:text-black hover:scale-105">전투 참가</button>
                  <button onClick={wrapClick(() => handleSellCard(card))} className="w-full py-2 mt-2 text-white/50 bg-transparent font-mono text-xs underline hover:text-white hover:scale-105">카드 판매</button>
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
                    onLoad={() => { setImgLoaded(true); }}
                    style={{
                      width: imgLoaded && imgRef.current ? `${imgRef.current.naturalWidth * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom}px` : 'auto',
                      height: imgLoaded && imgRef.current ? `${imgRef.current.naturalHeight * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom}px` : 'auto',
                      left: imgLoaded && imgRef.current ? `${100 - (imgRef.current.naturalWidth * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom) / 2 + cropPan.x}px` : '0px',
                      top: imgLoaded && imgRef.current ? `${155 - (imgRef.current.naturalHeight * Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight) * cropZoom) / 2 + cropPan.y}px` : '0px'
                    }}
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
