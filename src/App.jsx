// App.jsx: 리팩토링 후 얇은 진입점(thin entry point)
// 역할: GameProvider로 전체 앱 감싸기 + 뷰 라우팅 + 전역 오버레이(Toast, Modal) 렌더링
// 상태/핸들러는 모두 GameContext에 있으므로 이 파일은 구조(structure)만 담당

import React from 'react';
import { ShoppingCart, Volume2, VolumeX } from 'lucide-react';
import { GameProvider, useGame } from './context/GameContext';

// 뷰 컴포넌트 임포트 - 각 화면은 독립 파일로 분리됨
import LoginView from './views/LoginView';
import LobbyView from './views/LobbyView';
import ShopView from './views/ShopView';
import DeckView from './views/DeckView';
import CardDetailsView from './views/CardDetailsView';
import EnhancementView from './views/EnhancementView';
import BattleSelectView from './views/BattleSelectView';
import BattleAISetupView from './views/BattleAISetupView';
import PvPSetupView from './views/PvPSetupView';
import PvPRoomView from './views/PvPRoomView';
import BattleView from './views/BattleView';

// 공용 컴포넌트
import Toast from './components/Toast';
import HUDCorner from './components/HUDCorner';
import CardItem from './components/CardItem';
import { getIcon, formatMoney } from './utils/formatUtils';

// ============================================================
// Header: 앱 상단 고정 네비게이션 바
// 로비로 돌아가기, 상점 이동, 사운드 토글, 유저 정보 표시
// ============================================================
function Header() {
  const {
    userData, soundEnabled, setSoundEnabled,
    setCurrentView, wrapClick, handleHover
  } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-white/[0.01] backdrop-blur-3xl border-b border-white/10 p-5 px-8 flex justify-between items-center transition-all hover:bg-white/[0.03]">
      <h2
        onClick={wrapClick(() => setCurrentView('lobby'))}
        onMouseEnter={handleHover}
        className="text-3xl font-black text-white cursor-pointer hover:opacity-70 transition-all font-logo tracking-[0.1em]"
      >ROG CARD</h2>
      <div className="flex items-center gap-8 font-mono text-sm tracking-widest font-light">
        <button onClick={wrapClick(() => setCurrentView('shop'))} onMouseEnter={handleHover} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
          <ShoppingCart size={16} /> 상점
        </button>
        <button onClick={wrapClick(() => setSoundEnabled(!soundEnabled))} className="text-white/50 hover:text-white transition-colors">
          {soundEnabled
            ? <span className="flex items-center gap-1"><Volume2 size={14} /> SOUND ON</span>
            : <span className="flex items-center gap-1"><VolumeX size={14} /> SOUND OFF</span>
          }
        </button>
        {userData && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/70">
              {getIcon(userData.icon)} <span>{userData.nickname}</span>
            </div>
            <div className="text-white opacity-90 font-bold text-sm">{formatMoney(userData.money)} GOLD</div>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================
// PreviewModal: 카드 미리보기 전체화면 모달
// 랭킹 화면 등에서 카드를 클릭하면 크게 볼 수 있는 기능
// ============================================================
function PreviewModal() {
  const { previewCard, setPreviewCard, wrapClick, handleHover } = useGame();
  if (!previewCard) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in"
      onClick={() => setPreviewCard(null)}
    >
      <div
        className="relative w-full max-w-sm flex flex-col items-center animate-slide-up transform scale-110 md:scale-125"
        onClick={e => e.stopPropagation()}
      >
        <CardItem card={previewCard} className="w-full pointer-events-none" />
        <button
          onClick={wrapClick(() => setPreviewCard(null))} onMouseEnter={handleHover}
          className="mt-8 px-8 py-3 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-mono text-sm tracking-widest uppercase transition-colors duration-300"
        >닫기</button>
      </div>
    </div>
  );
}

// ============================================================
// ConfirmModal: 파괴적 행동(카드 판매 등) 전 확인 모달
// setConfirmModal(null)로 닫기, onConfirm/onCancel 콜백으로 처리
// ============================================================
function ConfirmModal() {
  const { confirmModal, setConfirmModal, isProcessing, wrapClick, handleHover } = useGame();
  if (!confirmModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in">
      <div className="bg-white/[0.02] border border-white/10 p-10 w-full max-w-sm relative transition-all duration-300">
        <HUDCorner />
        <h3 className="font-mono font-light text-xl text-white mb-4 tracking-widest uppercase">{confirmModal.title}</h3>
        <p className="font-sans text-base text-white/60 mb-10 whitespace-pre-wrap leading-relaxed">{confirmModal.message}</p>
        <div className="flex gap-4 font-mono font-light text-sm tracking-widest uppercase">
          <button
            onClick={wrapClick(confirmModal.onCancel || (() => setConfirmModal(null)))}
            onMouseEnter={handleHover}
            className="flex-1 py-3 border border-white/20 text-white/50 hover:text-white transition-colors duration-300"
          >{confirmModal.cancelText || "취소"}</button>
          <button
            onClick={wrapClick(confirmModal.onConfirm)}
            onMouseEnter={handleHover}
            disabled={isProcessing}
            className="flex-1 py-3 bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-30"
          >{isProcessing ? '처리 중...' : (confirmModal.confirmText || "확인")}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AppContent: Provider 안에서 context를 소비하는 실제 앱 UI
// bgmRef는 context에서 가져와 <audio> 엘리먼트에 연결
// ============================================================
function AppContent() {
  const {
    currentView,
    toast, setToast,
    previewCard, confirmModal,
    bgmRef
  } = useGame();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      {/* BGM 오디오 엘리먼트: bgmRef는 context에서 관리하여 soundEnabled 변화에 반응 */}
      <audio
        ref={bgmRef}
        src="https://res.cloudinary.com/dkotceims/video/upload/v1777608697/%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC_BGM_-_%EB%A0%88%EC%A7%80%EC%8A%A4%ED%83%95%EC%8A%A4_%EB%B3%B8%EB%B6%80_w7ucsi.mp3"
        loop preload="auto"
      />

      {/* 로그인 화면은 헤더 없이 전체화면 */}
      {currentView === 'login' ? <LoginView /> : (
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center w-full">
            {currentView === 'lobby' && <LobbyView />}
            {currentView === 'shop' && <ShopView />}
            {currentView === 'deck' && <DeckView />}
            {currentView === 'card_details' && <CardDetailsView />}
            {currentView === 'enhance' && <EnhancementView />}
            {currentView === 'battle_select' && <BattleSelectView />}
            {currentView === 'battle_ai_setup' && <BattleAISetupView />}
            {currentView === 'pvp_setup' && <PvPSetupView />}
            {currentView === 'pvp_room' && <PvPRoomView />}
            {currentView === 'battle' && <BattleView />}
            {currentView === 'battle_pvp_play' && <BattleView />}
          </main>
        </div>
      )}

      {/* 전역 오버레이 컴포넌트들 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {previewCard && <PreviewModal />}
      {confirmModal && <ConfirmModal />}
    </div>
  );
}

// ============================================================
// App (default export): GameProvider로 감싸는 최상위 컴포넌트
// Provider를 최상위에 두어야 AppContent 내 모든 컴포넌트가 context에 접근 가능
// ============================================================
export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
