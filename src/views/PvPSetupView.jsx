// PvPSetupView: PvP 방 목록 조회 + 새 방 개설 화면
// 최대 3장의 카드를 선택 순서대로 출전 (선택 번호 배지 표시)

import React from 'react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const PvPSetupView = () => {
  const {
    userData, myCards, selectedCards, setSelectedCards,
    activeRooms, pvpRoomName, setPvpRoomName,
    battleBet, setBattleBet,
    isProcessing,
    setCurrentView,
    wrapClick,
    handleJoinPvPRoom, handleCreatePvPRoom
  } = useGame();

  const availableCards = myCards.filter(c => !c.isSelling);

  const toggleCard = (card) => {
    setSelectedCards(prev => {
      const idx = prev.findIndex(c => c.id === card.id);
      if (idx !== -1) return prev.filter(c => c.id !== card.id);
      if (prev.length >= 3) return prev; // 최대 3장
      return [...prev, card];
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <h2 className="text-3xl font-mono font-light tracking-[0.2em] text-white mb-4 uppercase">유저와 대결하기</h2>

      {/* 출전 카드 선택 - 최대 3장 */}
      <div className="w-full max-w-6xl mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase">
            출전 카드 선택 (최대 3장 · 선택 순서대로 출전)
          </h3>
          <span className="font-mono text-xs text-amber-400">
            {selectedCards.length} / 3 선택됨
          </span>
        </div>

        {/* 선택된 카드 순서 미리보기 */}
        {selectedCards.length > 0 && (
          <div className="flex gap-3 mb-4 px-2 overflow-x-auto pb-2 custom-scrollbar">
            {selectedCards.map((card, i) => (
              <div key={card.id} className="flex flex-col items-center gap-1 min-w-[80px]">
                <span className="text-white/40 font-mono text-[10px] tracking-widest">
                  {i === 0 ? '선봉' : i === 1 ? '중간' : '마지막'}
                </span>
                <div className="w-20 relative">
                  <div className="absolute -top-2 -left-2 z-10 w-5 h-5 bg-amber-400 text-black font-mono font-black text-xs flex items-center justify-center rounded-full">
                    {i + 1}
                  </div>
                  <CardItem card={card} compact className="pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex overflow-x-auto gap-4 pb-6 pt-8 px-2 custom-scrollbar">
          {availableCards.map(card => {
            const idx = selectedCards.findIndex(c => c.id === card.id);
            const isSelected = idx !== -1;
            return (
              <div
                key={card.id}
                className="min-w-[140px] max-w-[140px] md:min-w-[160px] md:max-w-[160px] flex-shrink-0 cursor-pointer relative"
                onClick={wrapClick(() => toggleCard(card))}
              >
                {isSelected && (
                  <div className="absolute top-1 left-1 z-10 w-6 h-6 bg-amber-400 text-black font-mono font-black text-xs flex items-center justify-center rounded-full shadow">
                    {idx + 1}
                  </div>
                )}
                {!isSelected && selectedCards.length >= 3 && (
                  <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                    <span className="font-mono text-xs text-white/50">MAX</span>
                  </div>
                )}
                <CardItem card={card} compact className={`transition-all duration-300 ${isSelected ? 'ring-2 ring-amber-400 scale-105' : 'opacity-50 hover:opacity-100'}`} />
              </div>
            );
          })}
          {availableCards.length === 0 && (
            <p className="text-white/30 font-mono text-sm m-auto">보유 카드가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* 활성화된 대기방 목록 */}
        <div className="flex-[2] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col min-h-[300px]">
          <HUDCorner />
          <h3 className="text-base font-mono font-light text-white mb-6 tracking-widest uppercase">활성화된 대기방</h3>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {activeRooms.length === 0 ? (
              <div className="text-center text-white/30 font-mono text-sm mt-10">생성된 방이 없습니다.</div>
            ) : (
              activeRooms.map(room => (
                <div key={room.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                  <div className="flex flex-col flex-1 min-w-0 pr-4">
                    <span className="font-mono text-white text-base truncate">{room.roomName}</span>
                    <span className="font-mono text-xs text-white/50 truncate">
                      Host: {room.host.nickname}
                      {room.hostCards && <span className="ml-2 text-amber-400/70">{room.hostCards.length}장</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <span className="font-mono text-amber-400 text-sm">{formatMoney(room.bet)} G</span>
                    <button
                      onClick={wrapClick(() => handleJoinPvPRoom(room.id))}
                      disabled={selectedCards.length === 0}
                      className="px-4 py-2 bg-white/10 text-white font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-30"
                    >참가</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 새 방 개설 폼 */}
        <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col">
          <HUDCorner />
          <h3 className="text-base font-mono font-light text-white mb-8 tracking-widest uppercase">새로운 방 개설</h3>
          <label className="text-white/40 text-xs font-mono mb-2 tracking-widest uppercase">방 이름</label>
          <input
            type="text" value={pvpRoomName} onChange={(e) => setPvpRoomName(e.target.value)}
            placeholder={`${userData.nickname}의 방`} maxLength={15}
            className="w-full bg-transparent border-b border-white/30 p-2 text-white font-mono text-base focus:border-white focus:outline-none mb-8 placeholder-white/20 transition-colors"
          />
          <label className="text-white/40 text-xs font-mono mb-2 tracking-widest uppercase">배팅 금액 (GOLD)</label>
          <input
            type="number" value={battleBet} onChange={(e) => setBattleBet(Number(e.target.value))}
            min="1000" max={userData.money} step="1000"
            className="w-full bg-transparent border-b border-white/30 p-2 text-white font-mono text-xl focus:border-white focus:outline-none mb-10 transition-colors"
          />
          <button
            onClick={wrapClick(handleCreatePvPRoom)}
            disabled={isProcessing || selectedCards.length === 0}
            className="mt-auto py-4 bg-white/10 text-white font-mono text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all disabled:opacity-30"
          >개설 및 대기</button>
        </div>
      </div>
      <button onClick={wrapClick(() => setCurrentView('battle_select'))} className="mt-16 text-white/30 hover:text-white font-mono text-sm tracking-widest uppercase transition-colors">뒤로 가기</button>
    </div>
  );
};

export default PvPSetupView;
