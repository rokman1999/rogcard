// App.jsx: 리팩토링 후 얇은 진입점(thin entry point)
// 역할: GameProvider로 전체 앱 감싸기 + 뷰 라우팅 + 전역 오버레이(Toast, Modal) 렌더링
// 상태/핸들러는 모두 GameContext에 있으므로 이 파일은 구조(structure)만 담당

import { lazy, Suspense, useState } from 'react';
import { ShoppingCart, Users, Banknote, Volume2, VolumeX, Swords } from 'lucide-react';
import { GameProvider, useGame } from './context/GameContext';

// 뷰 컴포넌트: lazy import로 코드 스플리팅 → 초기 번들 크기 감소
// 각 뷰는 해당 route에 진입할 때만 로드됨
const LoginView       = lazy(() => import('./views/LoginView'));
const LobbyView       = lazy(() => import('./views/LobbyView'));
const ShopView        = lazy(() => import('./views/ShopView'));
const DeckView        = lazy(() => import('./views/DeckView'));
const CardDetailsView = lazy(() => import('./views/CardDetailsView'));
const EnhancementView = lazy(() => import('./views/EnhancementView'));
const BattleSelectView  = lazy(() => import('./views/BattleSelectView'));
const BattleAISetupView = lazy(() => import('./views/BattleAISetupView'));
const PvPSetupView    = lazy(() => import('./views/PvPSetupView'));
const PvPRoomView     = lazy(() => import('./views/PvPRoomView'));
const BattleView      = lazy(() => import('./views/BattleView'));
const ProfileView     = lazy(() => import('./views/ProfileView'));
const TranscendView   = lazy(() => import('./views/TranscendView'));
const QuestsView      = lazy(() => import('./views/QuestsView'));
const MarketView      = lazy(() => import('./views/MarketView'));

// 공용 컴포넌트
import Toast from './components/Toast';
import HUDCorner from './components/HUDCorner';
import CardItem from './components/CardItem';
import { getIcon, formatMoney } from './utils/formatUtils';

// ============================================================
// Header: 앱 상단 고정 네비게이션 바
// 로비로 돌아가기, 상점 이동, 사운드 토글, 유저 정보 표시
// 닉네임 클릭 시 내 프로필로 이동
// ============================================================
function Header() {
  const {
    user, userData, onlineCount,
    soundEnabled, setSoundEnabled,
    setCurrentView, setViewingProfileUserId,
    setShowChargeModal, setChargeStep,
    setShowOnlineModal,
    wrapClick, handleHover
  } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-white/[0.01] backdrop-blur-3xl border-b border-white/10 p-5 px-8 flex justify-between items-center transition-all hover:bg-white/[0.03]">
      <div className="flex items-center gap-6">
        <h2
          onClick={wrapClick(() => setCurrentView('lobby'))}
          onMouseEnter={handleHover}
          className="text-3xl font-black text-white cursor-pointer hover:opacity-70 transition-all font-logo tracking-[0.1em]"
        >ROG CARD</h2>
        <button
          onClick={wrapClick(() => setShowOnlineModal(true))}
          onMouseEnter={handleHover}
          className="hidden md:flex text-white/30 hover:text-white/70 text-xs font-mono items-center gap-1 transition-colors"
        >
          <Users size={12} /> 접속 중: {onlineCount}명
        </button>
      </div>
      <div className="flex items-center gap-8 font-mono text-sm tracking-widest font-light">
        <button onClick={wrapClick(() => setCurrentView('shop'))} onMouseEnter={handleHover} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
          <ShoppingCart size={16} /> 상점
        </button>
        {userData && (
          <div className="flex items-center gap-6">
            <button
              onClick={wrapClick(() => { setChargeStep(1); setShowChargeModal(true); })}
              className="text-amber-400 border border-amber-500/30 bg-amber-900/20 px-3 py-1.5 text-xs hover:bg-amber-500 hover:text-white transition-colors tracking-widest font-bold hidden sm:block shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >충전하기</button>
            <div
              className="flex items-center gap-6 cursor-pointer hover:opacity-80"
              onClick={wrapClick(() => { setViewingProfileUserId(user?.uid); setCurrentView('profile'); })}
            >
              <div className="flex items-center gap-2 text-white/70">
                {getIcon(userData.icon)} <span>{userData.nickname}</span>
              </div>
              <div className="text-white opacity-90 font-bold text-sm hidden sm:block">{formatMoney(userData.money)} GOLD</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================
// PreviewModal: 카드 미리보기 전체화면 모달
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
// ChargeModal: 골드 충전 모달 (계좌 이체 안내)
// ============================================================
function ChargeModal() {
  const {
    showChargeModal, setShowChargeModal,
    chargeStep, setChargeStep,
    selectedChargePack, setSelectedChargePack,
    wrapClick
  } = useGame();

  if (!showChargeModal) return null;

  const PACKS = [
    { gold: 1000000, price: '1,000원' },
    { gold: 3000000, price: '3,000원' },
    { gold: 5000000, price: '5,000원' },
    { gold: 10000000, price: '8,000원' },
    { gold: 20000000, price: '5,000원', isHotDeal: true }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in">
      <div className="bg-white/[0.02] border border-white/10 p-10 w-full max-w-lg relative transition-all duration-300 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
        <HUDCorner />
        <h3 className="font-mono font-light text-2xl text-white mb-8 tracking-widest uppercase text-center border-b border-white/10 pb-4">자산 충전소</h3>

        {chargeStep === 1 ? (
          <div className="flex flex-col gap-4 mb-8">
            {PACKS.map((p, i) => (
              <button
                key={i}
                onClick={wrapClick(() => { setSelectedChargePack(p); setChargeStep(2); })}
                className={`flex justify-between items-center p-5 border ${p.isHotDeal ? 'border-red-500/80 bg-red-900/30' : 'border-white/10 bg-black/40 hover:bg-white/10 hover:border-amber-500/50'} transition-all group relative overflow-hidden`}
              >
                {p.isHotDeal && <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 tracking-widest">HOT DEAL</div>}
                <span className={`font-mono font-bold text-lg group-hover:scale-105 transition-transform ${p.isHotDeal ? 'text-red-400 mt-3' : 'text-amber-400'}`}>{formatMoney(p.gold)} GOLD</span>
                <span className={`font-sans text-sm border ${p.isHotDeal ? 'text-white bg-red-600/80 px-5 py-2 border-red-400' : 'text-white/70 bg-white/5 px-4 py-2 border-white/10 group-hover:text-white group-hover:bg-white/20'}`}>{p.price}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center mb-8 bg-black/40 border border-white/10 p-8 text-center gap-6">
            <div className="w-16 h-16 bg-amber-500/20 flex items-center justify-center rounded-full mb-2">
              <Banknote size={32} className="text-amber-400" />
            </div>
            <h4 className="text-xl font-bold text-white tracking-widest">입금 안내</h4>
            <div className="text-amber-400 font-mono text-xl md:text-2xl font-black bg-amber-900/30 px-6 py-3 border border-amber-500/50 whitespace-nowrap">
              토스뱅크 1000-0052-1555
            </div>
            <div className="text-white/60 font-sans text-sm leading-relaxed">
              선택하신 상품: <span className="text-white font-bold">{formatMoney(selectedChargePack?.gold)} GOLD ({selectedChargePack?.price})</span><br /><br />
              위 계좌로 입금해 주시기 바랍니다.<br />
              <span className="text-emerald-400 font-bold mt-2 block">"입금 확인이 완료되면 자동으로 충전됩니다"</span>
            </div>
          </div>
        )}

        <button
          onClick={wrapClick(() => setShowChargeModal(false))}
          className="w-full py-4 bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 font-mono text-sm tracking-widest uppercase"
        >닫기</button>
      </div>
    </div>
  );
}

// ============================================================
// OnlineUsersModal: 접속중인 유저 목록 + 도전장 전송
// ============================================================
function OnlineUsersModal() {
  const {
    user, userData, allUsers, onlineCount,
    showOnlineModal, setShowOnlineModal,
    challengeBetInput, setChallengeBetInput,
    isProcessing,
    handleSendChallenge, wrapClick, handleHover
  } = useGame();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [now] = useState(() => Date.now());

  if (!showOnlineModal) return null;

  const onlineUsers = allUsers.filter(u => now - (u.lastActive || 0) < 300000 && u.userId !== user?.uid);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in" onClick={() => { setShowOnlineModal(false); setSelectedTarget(null); setChallengeBetInput(''); }}>
      <div className="bg-white/[0.02] border border-white/10 p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <HUDCorner />
        <h3 className="font-mono font-light text-xl text-white mb-2 tracking-widest uppercase text-center">접속 중인 플레이어</h3>
        <p className="text-white/30 font-mono text-xs text-center mb-6 tracking-widest">{onlineCount}명 접속 중</p>

        {onlineUsers.length === 0 ? (
          <div className="text-white/30 font-mono text-sm text-center py-8">현재 다른 접속자가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar mb-4">
            {onlineUsers.map((u, i) => (
              <button
                key={i}
                onClick={() => { setSelectedTarget(u); setChallengeBetInput(''); }}
                onMouseEnter={handleHover}
                className={`flex items-center justify-between p-3 border transition-all ${selectedTarget?.userId === u.userId ? 'border-cyan-400/70 bg-cyan-900/20' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-mono text-sm text-white">{u.nickname}</span>
                </div>
                <span className="font-mono text-xs text-white/40">{u.wins || 0}승 {u.losses || 0}패</span>
              </button>
            ))}
          </div>
        )}

        {selectedTarget && (
          <div className="border border-cyan-400/30 bg-cyan-900/10 p-4 mb-4 animate-fade-in">
            <p className="font-mono text-sm text-cyan-300 mb-3 tracking-wider">
              <Swords size={14} className="inline mr-2" />
              [{selectedTarget.nickname}]님에게 도전
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                value={challengeBetInput}
                onChange={e => setChallengeBetInput(e.target.value)}
                placeholder="배팅 GOLD"
                className="flex-1 bg-transparent border-b border-white/30 px-2 py-1 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 placeholder-white/20"
              />
              <button
                onClick={wrapClick(() => handleSendChallenge(selectedTarget, challengeBetInput))}
                disabled={isProcessing}
                className="px-4 py-1 bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 font-mono text-xs hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-30 tracking-widest"
              >도전!</button>
            </div>
            {userData && <p className="text-white/30 font-mono text-[10px] mt-2">보유: {formatMoney(userData.money)} GOLD</p>}
          </div>
        )}

        <button
          onClick={wrapClick(() => { setShowOnlineModal(false); setSelectedTarget(null); setChallengeBetInput(''); })}
          className="w-full py-3 border border-white/20 text-white/50 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
        >닫기</button>
      </div>
    </div>
  );
}

// ============================================================
// IncomingChallengeModal: 상대방 도전장 수신 모달
// ============================================================
function IncomingChallengeModal() {
  const {
    incomingChallenge, isProcessing,
    handleAcceptChallenge, handleRejectChallenge,
    wrapClick
  } = useGame();

  if (!incomingChallenge) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 animate-fade-in">
      <div className="bg-white/[0.02] border border-amber-500/40 p-8 w-full max-w-sm relative shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-slide-up">
        <HUDCorner />
        <div className="text-center mb-6">
          <div className="text-amber-400 text-4xl mb-3">⚔️</div>
          <h3 className="font-mono font-bold text-xl text-white tracking-widest">도전장!</h3>
          <p className="text-white/50 font-mono text-sm mt-2">
            <span className="text-amber-300 font-bold">[{incomingChallenge.fromNickname}]</span>님이 결투를 신청했습니다
          </p>
          <div className="mt-4 text-amber-400 font-mono font-bold text-2xl bg-amber-900/20 border border-amber-500/30 py-2">
            {formatMoney(incomingChallenge.bet)} GOLD
          </div>
          <p className="text-white/30 font-mono text-xs mt-2">배팅금</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={wrapClick(() => handleRejectChallenge(incomingChallenge.id))}
            className="flex-1 py-3 border border-white/20 text-white/50 hover:text-white font-mono text-sm tracking-widest uppercase transition-colors"
          >거절</button>
          <button
            onClick={wrapClick(() => handleAcceptChallenge(incomingChallenge))}
            disabled={isProcessing}
            className="flex-1 py-3 bg-amber-500/20 border border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-black font-mono text-sm tracking-widest uppercase transition-all disabled:opacity-30 font-bold"
          >{isProcessing ? '처리 중...' : '수락!'}</button>
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
    previewCard, confirmModal, showChargeModal,
    showOnlineModal, incomingChallenge,
    bgmRef
  } = useGame();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      {/* BGM 오디오 엘리먼트: bgmRef는 context에서 관리하여 soundEnabled 변화에 반응 */}
      <audio
        ref={bgmRef}
        src="https://res.cloudinary.com/dkotceims/video/upload/v1777981401/Mausio_-_Der_Pate_pcu3dg.mp3"
        loop preload="auto"
      />

      {/* 로그인 화면은 헤더 없이 전체화면 */}
      {/* Suspense fallback: lazy 뷰 로딩 중 빈 화면 방지 */}
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        {currentView === 'login' ? <LoginView /> : (
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center w-full">
              {currentView === 'lobby' && <LobbyView />}
              {currentView === 'shop' && <ShopView />}
              {currentView === 'deck' && <DeckView />}
              {currentView === 'card_details' && <CardDetailsView />}
              {currentView === 'enhance' && <EnhancementView />}
              {currentView === 'transcend' && <TranscendView />}
              {currentView === 'battle_select' && <BattleSelectView />}
              {currentView === 'battle_ai_setup' && <BattleAISetupView />}
              {currentView === 'pvp_setup' && <PvPSetupView />}
              {currentView === 'pvp_room' && <PvPRoomView />}
              {currentView === 'battle' && <BattleView />}
              {currentView === 'battle_pvp_play' && <BattleView />}
              {currentView === 'profile' && <ProfileView />}
              {currentView === 'quests' && <QuestsView />}
              {currentView === 'market' && <MarketView />}
            </main>
          </div>
        )}
      </Suspense>

      {/* 전역 오버레이 컴포넌트들 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {previewCard && <PreviewModal />}
      {confirmModal && <ConfirmModal />}
      {showChargeModal && <ChargeModal />}
      {showOnlineModal && <OnlineUsersModal />}
      {incomingChallenge && <IncomingChallengeModal />}
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
