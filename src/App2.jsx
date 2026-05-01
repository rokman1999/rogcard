import React from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Toast, HUDCorner } from './components/ui/UI';
import { CardItem } from './components/card/Card';

// 뷰 임포트
import { LoginView, HeaderView, LobbyView, ShopView, DeckView, CardDetailView, EnhanceView, BattleSelectView, PvPRoomView, BattleView } from './views/GameViews';

export default function App() {
  const game = useGameLogic(); // 🚀 모든 로직을 이 Hook에서 가져옵니다!

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      <audio ref={game.bgmRef} src="[https://res.cloudinary.com/dkotceims/video/upload/v1777608697/%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC_BGM_-_%EB%A0%88%EC%A7%80%EC%8A%A4%ED%83%95%EC%8A%A4_%EB%B3%B8%EB%B6%80_w7ucsi.mp3](https://res.cloudinary.com/dkotceims/video/upload/v1777608697/%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC_BGM_-_%EB%A0%88%EC%A7%80%EC%8A%A4%ED%83%95%EC%8A%A4_%EB%B3%B8%EB%B6%80_w7ucsi.mp3)" loop preload="auto" />
      
      <div className="bg-obsidian"></div>

      {game.currentView === 'login' ? <LoginView game={game} /> : (
        <div className="relative z-10 flex flex-col min-h-screen">
          <HeaderView game={game} />
          <main className="flex-1 flex flex-col items-center justify-center w-full">
            {game.currentView === 'lobby' && <LobbyView game={game} />}
            {game.currentView === 'shop' && <ShopView game={game} />}
            {game.currentView === 'deck' && <DeckView game={game} />}
            {game.currentView === 'card_details' && <CardDetailView game={game} />}
            {game.currentView === 'enhance' && <EnhanceView game={game} />}
            {game.currentView === 'battle_select' && <BattleSelectView game={game} />}
            {game.currentView === 'pvp_room' && <PvPRoomView game={game} />}
            {(game.currentView === 'battle' || game.currentView === 'battle_pvp_play') && <BattleView game={game} />}
          </main>
        </div>
      )}
      
      {/* 글로벌 알림 모달 */}
      {game.toast && <Toast message={game.toast.message} type={game.toast.type} onClose={() => game.setToast(null)} />}
      
      {/* 공통 카드 프리뷰 팝업 */}
      {game.previewCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in" onClick={() => game.setPreviewCard(null)}>
          <div className="relative w-full max-w-sm flex flex-col items-center animate-slide-up transform scale-110 md:scale-125" onClick={e => e.stopPropagation()}>
            <CardItem card={game.previewCard} className="w-full pointer-events-none" />
            <button onClick={game.wrapClick(() => game.setPreviewCard(null))} className="mt-8 px-8 py-3 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-mono text-xs tracking-widest uppercase transition-colors duration-300">닫기</button>
          </div>
        </div>
      )}

      {/* 액션 확인 컨펌 창 */}
      {game.confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in">
          <div className="bg-white/[0.02] border border-white/10 p-10 w-full max-w-sm relative transition-all duration-300">
            <HUDCorner />
            <h3 className="font-mono font-light text-lg text-white mb-4 tracking-widest uppercase">{game.confirmModal.title}</h3>
            <p className="font-sans text-sm text-white/60 mb-10 whitespace-pre-wrap leading-relaxed">{game.confirmModal.message}</p>
            <div className="flex gap-4 font-mono font-light text-xs tracking-widest uppercase">
              <button onClick={game.wrapClick(game.confirmModal.onCancel || (() => game.setConfirmModal(null)))} className="flex-1 py-3 border border-white/20 text-white/50 hover:text-white transition-colors duration-300">{game.confirmModal.cancelText || "취소"}</button>
              <button onClick={game.wrapClick(game.confirmModal.onConfirm)} disabled={game.isProcessing} className="flex-1 py-3 bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-30">{game.isProcessing ? '처리 중...' : (game.confirmModal.confirmText || "확인")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
