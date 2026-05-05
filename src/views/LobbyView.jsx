// LobbyView: 메인 허브 화면
// 랭킹, 전체 채팅, 일일 출석체크, 주요 메뉴 진입점을 한 화면에 배치
// 유저가 가장 오래 머무는 화면이므로 정보 밀도를 높임

import React from 'react';
import { Trophy, Hexagon, Swords } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import MiniCard from '../components/MiniCard';
import { formatMoney } from '../utils/formatUtils';

const LobbyView = () => {
  const {
    user, userData, allUsers, allCards,
    currentView, setCurrentView,
    rankingTab, setRankingTab,
    globalChats, globalChatInput, setGlobalChatInput,
    isProcessing,
    previewCard, setPreviewCard,
    wrapClick, handleHover,
    handleAttendance, handleSendGlobalChat
  } = useGame();

  // 랭킹 집계: 상위 50명만 표시하여 렌더링 부하 제한
  const richUsers = [...allUsers].sort((a, b) => b.money - a.money).slice(0, 50);
  const topWins = [...allUsers].sort((a, b) => b.wins - a.wins).slice(0, 50);
  const isAttended = userData?.lastAttendance === new Date().toISOString().split('T')[0];
  const topUser = rankingTab === 'money' ? richUsers[0] : topWins[0];
  const topUserCard = topUser ? allCards.filter(c => c.ownerId === topUser.userId).sort((a, b) => b.level - a.level)[0] : null;

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in relative z-10 flex flex-col lg:flex-row gap-10 w-full h-full">
      {/* 좌측: 랭킹 + 전체 채팅 */}
      <div className="w-full lg:w-[350px] flex flex-col gap-6 h-[80vh]">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 flex flex-col h-[50%] relative transition-all hover:border-white/20 hover:bg-white/[0.04]">
          <HUDCorner />
          <h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-4 uppercase">랭킹</h3>
          {topUserCard && (
            <div className="mb-4 flex gap-5 items-center bg-white/5 p-4 rounded-xl border border-amber-500/30 shadow-lg cursor-pointer" onClick={wrapClick(() => setPreviewCard(topUserCard))}>
              <MiniCard card={topUserCard} />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs text-amber-400 font-mono tracking-widest mb-2 flex items-center gap-1"><Trophy size={12} /> RANK 1 ASSET</span>
                <span className="text-lg font-bold text-white truncate">{topUserCard.name}</span>
                <span className="text-sm text-white/50 font-mono mt-1">by {topUser.nickname}</span>
              </div>
            </div>
          )}
          <div className="flex gap-4 mb-4 font-mono text-xs tracking-widest">
            <button onClick={wrapClick(() => setRankingTab('win'))} className={`pb-1 ${rankingTab === 'win' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>승리</button>
            <button onClick={wrapClick(() => setRankingTab('money'))} className={`pb-1 ${rankingTab === 'money' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>자산</button>
          </div>
          <div className="font-mono text-sm tracking-wide overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar">
            {(rankingTab === 'money' ? richUsers : topWins).map((u, i) => (
              <div key={u.userId} className={`flex justify-between items-center pb-2 border-b border-white/5 ${u.userId === user?.uid ? 'text-white font-bold' : 'text-white/60'}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 opacity-30 text-xs">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate w-24">{u.nickname}</span>
                </div>
                <span>{rankingTab === 'money' ? formatMoney(u.money) : `${u.wins} W`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 채팅 */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 flex flex-col h-[50%] relative overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.04]">
          <HUDCorner />
          <h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-3 uppercase flex items-center gap-2">전체 채팅</h3>
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
            <input
              type="text" value={globalChatInput}
              onChange={e => setGlobalChatInput(e.target.value)}
              className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white font-mono text-sm focus:outline-none focus:border-white placeholder-white/20"
              placeholder="메시지 입력..."
            />
            <button type="submit" className="text-white/50 hover:text-white font-mono text-xs">전송</button>
          </form>
        </div>
      </div>

      {/* 우측: 출석체크 + 메인 메뉴 */}
      <div className="flex-1 flex flex-col gap-6 relative">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 flex justify-between items-center relative transition-all hover:border-white/20 hover:bg-white/[0.04]">
          <HUDCorner />
          <div>
            <h3 className="font-mono font-light text-base text-white/70 tracking-widest mb-2 uppercase">일일 출석체크</h3>
            <p className="font-sans text-base text-white/40 font-light">매일 출석해 골드를 수령하세요.</p>
          </div>
          <button
            onClick={wrapClick(handleAttendance)} disabled={isAttended}
            className={`px-8 py-3 font-mono text-sm tracking-widest uppercase ${isAttended ? 'text-white/20 border border-white/10' : 'bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black'}`}
          >
            {isAttended ? '수령 완료' : '수령'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative">
          <div onClick={wrapClick(() => setCurrentView('deck'))} className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04]">
            <HUDCorner />
            <Hexagon size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10">
              <h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">카드 관리</h3>
              <p className="font-sans text-base text-white/40 font-light">디지털 카드를 생성하고 한계를 돌파하세요.</p>
            </div>
          </div>
          <div onClick={wrapClick(() => setCurrentView('battle_select'))} className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04]">
            <HUDCorner />
            <Swords size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10">
              <h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">1:1 전투</h3>
              <p className="font-sans text-base text-white/40 font-light">AI 및 타 유저와 대결하고 배팅하세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyView;
