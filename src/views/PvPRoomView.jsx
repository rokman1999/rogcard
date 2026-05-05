// PvPRoomView: PvP 대기방 화면
// 호스트는 상대방이 참가하면 "전투 시작" 버튼 활성화
// 실시간 채팅으로 대전 전 커뮤니케이션 가능
// handleLeaveRoom은 호스트면 방 삭제, 게스트면 그냥 나가기

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { formatMoney } from '../utils/formatUtils';

const PvPRoomView = () => {
  const {
    user, userData,
    pvpRoomId, pvpRoomData,
    chatInput, setChatInput,
    isProcessing,
    wrapClick,
    handleSendChat, handleStartPvPBattle, handleLeaveRoom
  } = useGame();

  if (!pvpRoomData) return null;

  const isHost = pvpRoomData.host.uid === user.uid;
  const opponent = isHost ? pvpRoomData.guest : pvpRoomData.host;
  const myMatchCard = isHost ? pvpRoomData.hostCard : pvpRoomData.guestCard;
  const oppMatchCard = isHost ? pvpRoomData.guestCard : pvpRoomData.hostCard;
  const isReady = pvpRoomData.status === 'ready';

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        {/* 대기실 메인 패널 */}
        <div className="flex-[2] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 relative flex flex-col items-center transition-all duration-500 hover:border-white/20">
          <HUDCorner />
          <h2 className="text-base font-mono text-white/50 mb-12 uppercase">
            {pvpRoomData.roomName} <span className="text-xs">({pvpRoomId})</span>
          </h2>

          {/* 양측 카드 vs 배팅액 표시 */}
          <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-center mb-16">
            <div className="flex flex-col items-center w-56">
              <span className="text-white/70 font-mono text-sm mb-4">{userData.nickname}</span>
              <CardItem card={myMatchCard} />
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="text-white/40 text-xs tracking-[0.2em] font-mono">TOTAL WAGER</div>
              <div className="text-amber-400 font-mono font-bold text-3xl bg-white/5 px-6 py-3 rounded-md border border-amber-500/30 whitespace-nowrap">{formatMoney(pvpRoomData.bet * 2)} GOLD</div>
            </div>
            <div className="flex flex-col items-center w-56">
              <span className="text-white/70 font-mono text-sm mb-4">{opponent ? opponent.nickname : '대기 중...'}</span>
              <CardItem card={oppMatchCard} className={!oppMatchCard ? 'opacity-30 grayscale' : ''} />
            </div>
          </div>

          {/* 호스트만 전투 시작 가능, 게스트는 대기 메시지 표시 */}
          {isHost ? (
            <button
              onClick={wrapClick(handleStartPvPBattle)} disabled={!isReady}
              className="w-full max-w-md py-4 bg-white text-black font-mono text-base hover:bg-white/80 disabled:opacity-30 font-bold uppercase tracking-[0.2em]"
            >
              {isReady ? '전투 시작' : '상대 대기 중...'}
            </button>
          ) : (
            <div className="w-full max-w-md py-4 border border-white/20 text-white/40 text-center font-mono text-sm uppercase tracking-[0.2em]">호스트의 시작 대기 중...</div>
          )}
          <button onClick={wrapClick(handleLeaveRoom)} className="mt-8 text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors">방 나가기</button>
        </div>

        {/* 실시간 채팅 패널 */}
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 relative flex flex-col overflow-hidden min-h-[400px]">
          <HUDCorner />
          <div className="p-5 border-b border-white/10 font-mono font-light text-sm text-white/50 tracking-widest uppercase flex justify-center gap-2">
            <MessageSquare size={16} /> 통신 채널
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 font-mono text-xs custom-scrollbar">
            {pvpRoomData.chat.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === userData.nickname ? 'items-end' : 'items-start'} animate-slide-up`}>
                <span className="text-[10px] text-white/30 mb-1">{msg.sender}</span>
                <div className={`px-4 py-2 ${msg.sender === userData.nickname ? 'bg-white/10 text-white' : 'border border-white/10 text-white/70'} max-w-[90%] break-words rounded-md`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 flex gap-3">
            <input
              type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
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
