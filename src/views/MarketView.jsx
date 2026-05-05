// MarketView: 거래소 화면
// 전체 판매 카드 목록, 내 등록 카드 관리, 신규 카드 등록 패널, 전체 채팅 사이드바

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const MarketView = () => {
  const {
    user, userData, myCards, allCards, allUsers,
    marketTab, setMarketTab,
    marketSelectedCardId, setMarketSelectedCardId,
    sellPriceInput, setSellPriceInput,
    isProcessing,
    globalChats, globalChatInput, setGlobalChatInput,
    setPreviewCard,
    setCurrentView,
    wrapClick,
    handleListMarket, handleCancelMarket, handleBuyMarket,
    handleSendGlobalChat,
  } = useGame();

  const marketCards = allCards.filter(c => c.isSelling);
  const displayCards = marketTab === 'all' ? marketCards : marketCards.filter(c => c.ownerId === user?.uid);
  const availableToSell = myCards.filter(c => !c.isSelling);

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in relative z-10 min-h-[80vh] flex flex-col w-full">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/20">
        <h2 className="text-3xl font-mono font-light text-white tracking-[0.2em] uppercase">거래소</h2>
        <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/50 hover:text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* 카드 목록 */}
        <div className="flex-[2] flex flex-col">
          <div className="flex gap-4 mb-8 font-mono text-sm tracking-widest">
            <button onClick={wrapClick(() => setMarketTab('all'))} className={`pb-2 px-2 ${marketTab === 'all' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-white/30 hover:text-white/60'}`}>판매 중인 자산</button>
            <button onClick={wrapClick(() => setMarketTab('mine'))} className={`pb-2 px-2 ${marketTab === 'mine' ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' : 'text-white/30 hover:text-white/60'}`}>나의 등록 자산</button>
          </div>

          {displayCards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 font-sans font-light text-xl text-white/40 bg-white/[0.01] border border-white/5 backdrop-blur-md">
              등록된 카드가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayCards.map((card) => {
                const seller = allUsers.find(u => u.userId === card.ownerId);
                return (
                  <div key={card.id} className="relative group bg-white/[0.02] border border-white/10 p-4 hover:border-white/30 transition-all flex flex-col">
                    <HUDCorner />
                    <div className="mb-4" onClick={wrapClick(() => setPreviewCard(card))}>
                      <CardItem card={card} hideDetails={true} className="cursor-pointer" />
                    </div>
                    <div className="text-center font-mono text-[10px] text-white/50 mb-2 truncate">
                      Seller: {seller?.nickname || 'Unknown'}
                    </div>
                    <div className="text-center font-mono text-amber-400 font-bold text-lg mb-4 bg-black/40 border border-amber-500/20 py-1">
                      {formatMoney(card.price)} G
                    </div>
                    {marketTab === 'all' ? (
                      card.ownerId === user?.uid ? (
                        <button disabled className="w-full py-2 bg-white/5 text-white/30 border border-white/10 font-mono text-sm">내 자산</button>
                      ) : (
                        <button onClick={wrapClick(() => handleBuyMarket(card))} disabled={isProcessing} className="w-full py-2 bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500 hover:text-white font-mono text-sm transition-colors disabled:opacity-50">구매하기</button>
                      )
                    ) : (
                      <button onClick={wrapClick(() => handleCancelMarket(card))} disabled={isProcessing} className="w-full py-2 bg-white/10 text-white hover:bg-white hover:text-black font-mono text-sm transition-colors disabled:opacity-50">판매 취소</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="flex-1 flex flex-col gap-8 min-w-[300px]">
          {/* 등록 패널 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 flex flex-col relative">
            <HUDCorner />
            <h3 className="font-mono font-light text-lg text-white mb-6 tracking-widest uppercase">내 자산 등록</h3>
            {availableToSell.length === 0 ? (
              <p className="text-white/40 text-sm font-mono py-4 text-center border border-white/5 bg-black/20">등록 가능한 카드가 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <select
                  className="bg-black border border-white/20 text-white font-mono p-3 outline-none focus:border-white"
                  value={marketSelectedCardId}
                  onChange={e => setMarketSelectedCardId(e.target.value)}
                >
                  <option value="">카드를 선택하세요</option>
                  {availableToSell.map(c => <option key={c.id} value={c.id}>[LV.{c.level}] {c.name}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="판매가 입력 (GOLD)"
                  value={sellPriceInput}
                  onChange={e => setSellPriceInput(e.target.value)}
                  className="bg-black border border-white/20 p-3 text-white font-mono outline-none focus:border-white"
                />
                <button
                  disabled={!marketSelectedCardId || !sellPriceInput || isProcessing}
                  onClick={wrapClick(() => handleListMarket(availableToSell.find(c => c.id === marketSelectedCardId), sellPriceInput))}
                  className="p-4 bg-white/10 text-white font-mono text-sm uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-30 border border-white/20 mt-2 font-bold tracking-widest"
                >거래소 등록</button>
              </div>
            )}
          </div>

          {/* 전체 채팅 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 flex flex-col h-[400px] relative overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.04]">
            <HUDCorner />
            <h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-3 uppercase">전체 채팅</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 font-mono text-xs mb-3 pr-2 custom-scrollbar">
              {globalChats.map((msg, i) => (
                <div key={i} className="flex flex-col animate-slide-up">
                  {msg.sender !== 'SYSTEM' && <span className="mb-0.5 text-[10px] text-white/30">{msg.sender}</span>}
                  <span className={`break-words ${msg.sender === 'SYSTEM' ? 'text-amber-300 font-bold' : msg.sender === userData?.nickname ? 'text-emerald-300' : 'text-white/80'}`}>{msg.text}</span>
                </div>
              ))}
              <div ref={el => el && el.scrollIntoView()} />
            </div>
            <form onSubmit={handleSendGlobalChat} className="flex gap-2 border-t border-white/10 pt-3">
              <input type="text" value={globalChatInput} onChange={e => setGlobalChatInput(e.target.value)} className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white font-mono text-sm focus:outline-none focus:border-white placeholder-white/20" placeholder="메시지 입력..." />
              <button type="submit" className="text-white/50 hover:text-white font-mono text-xs">전송</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketView;
