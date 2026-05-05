// LobbyView: 메인 허브 화면
// 랭킹(강화/승리/자산), 전체 채팅, 일일 출석체크, 일일 퀘스트, 주요 메뉴 진입점
// 랭킹 닉네임 클릭 시 프로필 화면으로 이동

import React from 'react';
import { Trophy, Hexagon, Swords, Cpu, Landmark } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import MiniCard from '../components/MiniCard';
import { formatMoney } from '../utils/formatUtils';

const LobbyView = () => {
  const {
    user, userData, allUsers, allCards,
    setCurrentView,
    rankingTab, setRankingTab,
    globalChats, globalChatInput, setGlobalChatInput,
    isProcessing,
    myCards,
    selectedCard, setSelectedCard,
    activeRooms,
    setViewingProfileUserId,
    wrapClick, handleHover,
    handleAttendance, handleSendGlobalChat,
    startAIBattleSetup, handleJoinPvPRoom,
    showToast,
  } = useGame();

  // 레벨 랭킹용 최고 레벨 집계
  const userMaxLevels = {};
  allCards.forEach(c => {
    if (!userMaxLevels[c.ownerId] || c.level > userMaxLevels[c.ownerId]) {
      userMaxLevels[c.ownerId] = c.level;
    }
  });

  const topLevelUsers = [...allUsers].sort((a, b) => (userMaxLevels[b.userId] || 0) - (userMaxLevels[a.userId] || 0)).slice(0, 50);
  const topWins = [...allUsers].sort((a, b) => (b.wins || 0) - (a.wins || 0)).slice(0, 50);
  const richUsers = [...allUsers].sort((a, b) => (b.money || 0) - (a.money || 0)).slice(0, 50);

  const isAttended = userData?.lastAttendance === new Date().toISOString().split('T')[0];
  const currentList = rankingTab === 'level' ? topLevelUsers : rankingTab === 'money' ? richUsers : topWins;
  const topUser = currentList[0];
  const topUserCard = topUser ? allCards.filter(c => c.ownerId === topUser.userId).sort((a, b) => b.level - a.level)[0] : null;

  const availableToPlay = myCards.filter(c => !c.isSelling);

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in relative z-10 flex flex-col lg:flex-row gap-10 w-full h-full">
      {/* 좌측: 랭킹 + 전체 채팅 */}
      <div className="w-full lg:w-[350px] flex flex-col gap-6 h-[80vh]">
        <div className="flex-1 min-h-0 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 flex flex-col relative transition-all hover:border-white/20 hover:bg-white/[0.04]">
          <HUDCorner />
          <h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-4 uppercase">랭킹</h3>
          {topUserCard && (
            <div
              className="mb-4 flex gap-5 items-center bg-white/5 p-4 border border-amber-500/30 shadow-lg cursor-pointer"
              onClick={wrapClick(() => { setViewingProfileUserId(topUser.userId); setCurrentView('profile'); })}
            >
              <MiniCard card={topUserCard} />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs text-amber-400 font-mono tracking-widest mb-2 flex items-center gap-1"><Trophy size={12} /> RANK 1 ASSET</span>
                <span className="text-lg font-bold text-white truncate">{topUserCard.name}</span>
                <span className="text-sm text-white/50 font-mono mt-1 hover:underline">by {topUser.nickname}</span>
              </div>
            </div>
          )}
          <div className="flex gap-4 mb-4 font-mono text-xs tracking-widest">
            <button onClick={wrapClick(() => setRankingTab('level'))} className={`pb-1 ${rankingTab === 'level' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>강화</button>
            <button onClick={wrapClick(() => setRankingTab('win'))} className={`pb-1 ${rankingTab === 'win' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>승리</button>
            <button onClick={wrapClick(() => setRankingTab('money'))} className={`pb-1 ${rankingTab === 'money' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>자산</button>
          </div>
          <div className="font-mono text-sm tracking-wide overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar">
            {currentList.map((u, i) => {
              const realWins = u.wins || 0;
              return (
                <div key={u.userId} className={`flex justify-between items-center pb-2 border-b border-white/5 ${u.userId === user?.uid ? 'text-white font-bold' : 'text-white/60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 opacity-30 text-xs">{String(i + 1).padStart(2, '0')}</span>
                    <span
                      className="truncate w-24 cursor-pointer hover:text-emerald-300 transition-colors"
                      onClick={wrapClick(() => { setViewingProfileUserId(u.userId); setCurrentView('profile'); })}
                    >{u.nickname}</span>
                  </div>
                  <span>{rankingTab === 'level' ? `LV.${userMaxLevels[u.userId] || 0}` : rankingTab === 'money' ? formatMoney(u.money) : `${realWins} W`}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 전체 채팅 */}
        <div className="flex-1 min-h-0 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 flex flex-col relative overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.04]">
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

      {/* 우측: 출석체크 + 퀘스트 + 메인 메뉴 그리드 */}
      <div className="flex-1 flex flex-col gap-6 relative">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 출석체크 */}
          <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 flex justify-between items-center relative transition-all hover:border-white/20 hover:bg-white/[0.04]">
            <HUDCorner />
            <div>
              <h3 className="font-mono font-light text-base text-white/70 tracking-widest mb-2 uppercase">일일 출석체크</h3>
              <p className="font-sans text-base text-white/40 font-light">매일 출석해 골드를 수령하세요.</p>
            </div>
            <button
              onClick={wrapClick(handleAttendance)} disabled={isAttended}
              className={`px-8 py-3 font-mono text-sm tracking-widest uppercase ${isAttended ? 'text-white/20 border border-white/10' : 'bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black'}`}
            >{isAttended ? '수령 완료' : '수령'}</button>
          </div>

          {/* 일일 퀘스트 */}
          <div
            className="flex-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 flex justify-between items-center relative transition-all hover:border-white/20 hover:bg-white/[0.04] cursor-pointer group"
            onClick={wrapClick(() => setCurrentView('quests'))}
          >
            <HUDCorner />
            <div>
              <h3 className="font-mono font-light text-base text-white/70 tracking-widest mb-2 uppercase">일일 퀘스트</h3>
              <p className="font-sans text-base text-white/40 font-light">임무를 달성하고 대량의 보상을 획득하세요.</p>
            </div>
            <div className="px-8 py-3 font-mono text-sm tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 group-hover:bg-emerald-500 group-hover:text-white transition-all text-center">확인</div>
          </div>
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative">
          <div
            onClick={wrapClick(() => setCurrentView('deck'))}
            className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04]"
          >
            <HUDCorner />
            <Hexagon size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10">
              <h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">카드 관리</h3>
              <p className="font-sans text-base text-white/40 font-light">디지털 카드를 생성하고 한계를 돌파하세요.</p>
            </div>
          </div>

          <div
            onClick={wrapClick(() => setCurrentView('market'))}
            className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04]"
          >
            <HUDCorner />
            <Landmark size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10">
              <h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">거래소</h3>
              <p className="font-sans text-base text-white/40 font-light">다른 유저들과 카드를 거래하세요.</p>
            </div>
          </div>

          <div
            onClick={wrapClick(() => {
              if (availableToPlay.length === 0) { showToast("전투 가능한 카드가 없습니다 (거래소 등록 중)", "error"); return; }
              startAIBattleSetup(availableToPlay[0]);
            })}
            className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2 hover:bg-white/[0.04]"
          >
            <HUDCorner />
            <Cpu size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10">
              <h3 className="font-mono font-light text-2xl text-white tracking-widest mb-3 uppercase">AI 전투</h3>
              <p className="font-sans text-base text-white/40 font-light">가상 적들과 대결하여 골드를 벌어보세요.</p>
            </div>
          </div>

          {/* 1:1 유저 전투 + 방 목록 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col flex-1 min-h-[250px] transition-all hover:border-white/20 hover:bg-white/[0.04]">
            <HUDCorner />
            <div className="flex justify-between items-start mb-6 z-10 border-b border-white/10 pb-6">
              <div>
                <h3 className="font-mono font-light text-xl text-white tracking-widest mb-2 uppercase flex items-center gap-2">
                  <Swords size={20} /> 1:1 유저 전투
                </h3>
                <p className="font-sans text-sm text-white/40 font-light">실시간으로 대결하세요.</p>
              </div>
              <button
                onClick={wrapClick(() => {
                  if (availableToPlay.length === 0) { showToast("전투 가능한 카드가 없습니다 (거래소 등록 중)", "error"); return; }
                  if (!selectedCard || selectedCard.isSelling) setSelectedCard(availableToPlay[0]);
                  setCurrentView('pvp_setup');
                })}
                className="px-6 py-3 bg-white/10 text-white font-mono text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all border border-white/20 whitespace-nowrap"
              >방 개설 / 참가 준비</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 z-10">
              {activeRooms.length === 0 ? (
                <div className="text-center text-white/30 font-mono text-sm mt-8">활성화된 대기방이 없습니다.</div>
              ) : (
                activeRooms.map(room => (
                  <div key={room.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                      <span className="font-mono text-white text-base truncate">{room.roomName}</span>
                      <span className="font-mono text-xs text-white/50 truncate">Host: {room.host.nickname}</span>
                    </div>
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      <span className="font-mono text-amber-400 text-sm">{formatMoney(room.bet)} G</span>
                      <button
                        onClick={wrapClick(() => {
                          if (availableToPlay.length === 0) { showToast("전투 가능한 카드가 없습니다 (거래소 등록 중)", "error"); return; }
                          const targetCard = (!selectedCard || selectedCard.isSelling) ? availableToPlay[0] : selectedCard;
                          setSelectedCard(targetCard);
                          handleJoinPvPRoom(room.id, targetCard);
                        })}
                        className="px-6 py-2 bg-white/10 text-white font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors"
                      >참가</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyView;
