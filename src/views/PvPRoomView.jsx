// PvPRoomView: PvP 대기방 화면
// 호스트/게스트 모두 선택한 카드 배열 표시 (최대 3장)
// 호스트는 상대방이 참가하면 "전투 시작" 버튼 활성화

import { MessageSquare } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const CardStack = ({ cards, label, isOpponent }) => (
  <div className="flex flex-col items-center">
    <span className="text-white/70 font-mono text-sm mb-4">{label}</span>
    {cards && cards.length > 0 ? (
      <div className="relative" style={{ width: '200px', height: '280px' }}>
        {[...cards].reverse().map((card, ri) => {
          const i = cards.length - 1 - ri;
          const offset = i * 18;
          const rotate = (i - Math.floor(cards.length / 2)) * 7;
          return (
            <div
              key={card.id || i}
              className="absolute transition-all"
              style={{ left: `${offset}px`, top: `${offset * 0.4}px`, zIndex: i + 1, transform: `rotate(${rotate}deg)`, transformOrigin: 'bottom center' }}
            >
              <div className="w-36">
                <CardItem card={card} compact />
              </div>
              {i === 0 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] text-amber-400 whitespace-nowrap">선봉</span>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <div className={`w-36 h-52 border border-white/10 flex items-center justify-center ${isOpponent ? 'animate-pulse' : ''}`}>
        <span className="text-white/20 font-mono text-xs">{isOpponent ? '대기 중...' : '없음'}</span>
      </div>
    )}
  </div>
);

const PvPRoomView = () => {
  const {
    user, userData,
    pvpRoomId, pvpRoomData,
    globalChats, globalChatInput, setGlobalChatInput,
    isProcessing,
    wrapClick,
    handleSendGlobalChat, handleStartPvPBattle, handleLeaveRoom
  } = useGame();

  if (!pvpRoomData) return null;

  const isHost = pvpRoomData.host.uid === user.uid;
  const opponent = isHost ? pvpRoomData.guest : pvpRoomData.host;
  const myCards = isHost
    ? (pvpRoomData.hostCards || [pvpRoomData.hostCard].filter(Boolean))
    : (pvpRoomData.guestCards || [pvpRoomData.guestCard].filter(Boolean));
  const oppCards = isHost
    ? (pvpRoomData.guestCards || [pvpRoomData.guestCard].filter(Boolean))
    : (pvpRoomData.hostCards || [pvpRoomData.hostCard].filter(Boolean));
  const isReady = pvpRoomData.status === 'ready';

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* 대기실 메인 패널 */}
        <div className="flex-[2] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 relative flex flex-col items-center transition-all duration-500 hover:border-white/20">
          <HUDCorner />
          <h2 className="text-base font-mono text-white/50 mb-4 uppercase">
            {pvpRoomData.roomName} <span className="text-xs">({pvpRoomId})</span>
          </h2>

          {/* 배팅액 */}
          <div className="text-amber-400 font-mono font-bold text-2xl bg-white/5 px-6 py-2 border border-amber-500/30 mb-10 whitespace-nowrap">
            WAGER: {formatMoney(pvpRoomData.bet * 2)} GOLD
          </div>

          {/* 양측 카드 배열 표시 */}
          <div className="flex flex-col md:flex-row items-start gap-10 w-full justify-center mb-12">
            <CardStack cards={myCards} label={userData.nickname} isOpponent={false} />
            <div className="flex items-center self-center">
              <span className="text-white/20 text-4xl font-mono font-light px-4">VS</span>
            </div>
            <CardStack
              cards={oppCards && oppCards.length > 0 ? oppCards : null}
              label={opponent ? opponent.nickname : '???'}
              isOpponent={!opponent}
            />
          </div>

          {/* 호스트만 전투 시작 가능 */}
          {isHost ? (
            <button
              onClick={wrapClick(handleStartPvPBattle)} disabled={!isReady || isProcessing}
              className="w-full max-w-md py-4 bg-white text-black font-mono text-base hover:bg-white/80 disabled:opacity-30 font-bold uppercase tracking-[0.2em]"
            >
              {isReady ? '전투 시작' : '상대 대기 중...'}
            </button>
          ) : (
            <div className="w-full max-w-md py-4 border border-white/20 text-white/40 text-center font-mono text-sm uppercase tracking-[0.2em]">호스트의 시작 대기 중...</div>
          )}
          <button onClick={wrapClick(handleLeaveRoom)} className="mt-8 text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors">방 나가기</button>
        </div>

        {/* 전체 채팅 패널 */}
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 relative flex flex-col overflow-hidden max-h-[600px] lg:max-h-[664px] lg:self-stretch">
          <HUDCorner />
          <div className="p-5 border-b border-white/10 font-mono font-light text-sm text-white/50 tracking-widest uppercase flex justify-center gap-2">
            <MessageSquare size={16} /> 전체 채팅
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 font-mono text-xs custom-scrollbar">
            {globalChats.map((msg, i) => (
              <div key={i} className="flex flex-col animate-slide-up">
                {msg.sender !== 'SYSTEM' && <span className="mb-0.5 text-[10px] text-white/30">{msg.sender}</span>}
                <span className={`break-words ${msg.sender === 'SYSTEM' ? 'text-amber-300 font-bold' : msg.sender === userData?.nickname ? 'text-emerald-300' : 'text-white/80'}`}>{msg.text}</span>
              </div>
            ))}
            <div ref={el => el && el.scrollIntoView()} />
          </div>
          <form onSubmit={handleSendGlobalChat} className="p-4 border-t border-white/10 flex gap-3">
            <input
              type="text" value={globalChatInput} onChange={e => setGlobalChatInput(e.target.value)}
              className="flex-1 bg-transparent border-b border-white/20 px-2 py-2 text-white font-mono text-sm focus:outline-none focus:border-white transition-colors placeholder-white/20"
              placeholder="메시지 입력"
            />
            <button type="submit" className="text-white/50 hover:text-white font-mono text-xs tracking-widest uppercase">전송</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PvPRoomView;
