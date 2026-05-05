// ProfileView: 유저 프로필 화면
// 보유 카드 목록, 승패 통계, 프로필 설명 편집, 방명록, 업적 확인 및 칭호 장착

import { ArrowRight, Edit3, MessageSquare, Send, Hexagon } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { checkAchievements, ACHIEVEMENTS_DATA } from '../constants/gameData';
import { getIcon, formatMoney } from '../utils/formatUtils';

const ProfileView = () => {
  const {
    user, userData, allUsers, allCards,
    setCurrentView,
    selectedAchDesc, setSelectedAchDesc,
    isEditingProfileDesc, setIsEditingProfileDesc,
    editProfileDesc, setEditProfileDesc,
    isEditingGold, setIsEditingGold,
    editGoldValue, setEditGoldValue,
    guestbookInput, setGuestbookInput,
    viewingProfileUserId,
    setPreviewCard,
    wrapClick,
    playSfx,
    handleAdminSetGold,
    handleEquipTitle,
    handleAddGuestbook,
    handleSaveProfileDesc,
  } = useGame();

  const viewingUser = allUsers.find(u => u.userId === viewingProfileUserId);
  if (!viewingUser) return <div className="text-white p-10">프로필을 불러올 수 없습니다.</div>;

  const viewingUserCards = allCards.filter(c => c.ownerId === viewingProfileUserId).sort((a, b) => b.level - a.level);
  const highestCard = viewingUserCards[0];
  const isMe = viewingUser.userId === user?.uid;
  const isAdmin = userData?.nickname === '영록달록';
  const achievements = checkAchievements(viewingUser, viewingUserCards);
  const realWins = Math.max(0, (viewingUser.wins || 0) - (viewingUser.aiWins || 0));

  const handleSaveGold = () => {
    handleAdminSetGold(viewingUser.userId, Number(editGoldValue));
    setIsEditingGold(false);
  };

  return (
    <div className="p-4 md:p-10 max-w-[1200px] mx-auto animate-fade-in relative z-10 w-full min-h-[80vh] flex flex-col">
      <div className="w-full flex justify-start mb-6">
        <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* 대표 카드 */}
        <div className="flex flex-col items-center md:w-[350px]">
          <h3 className="text-white/50 font-mono text-sm tracking-widest mb-6 uppercase">대표 카드</h3>
          {highestCard
            ? <CardItem card={highestCard} className="w-full max-w-[320px] pointer-events-none" />
            : <div className="w-full aspect-[2/3.1] border border-dashed border-white/20 bg-black/40 flex items-center justify-center text-white/30 font-mono text-sm">카드가 없습니다.</div>
          }
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* 유저 정보 패널 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col gap-6">
            <HUDCorner />
            <div className="flex justify-between items-start border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/5 border border-white/10">{getIcon(viewingUser.icon)}</div>
                <div>
                  {viewingUser.equippedTitle && (
                    <div className="text-emerald-400 text-[10px] font-mono mb-1 tracking-widest bg-emerald-900/30 px-1.5 py-0.5 border border-emerald-500/30 inline-block">
                      {viewingUser.equippedTitle}
                    </div>
                  )}
                  <h2 className="text-3xl font-bold text-white font-mono tracking-widest">{viewingUser.nickname}</h2>
                  <p className="text-white/50 text-sm mt-1">가입일: {new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-3 mb-1">
                  {isAdmin && !isEditingGold && (
                    <button
                      onClick={wrapClick(() => { setIsEditingGold(true); setEditGoldValue(viewingUser.money); })}
                      className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white font-mono transition-colors"
                    >어드민 수정</button>
                  )}
                  {isAdmin && isEditingGold ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={editGoldValue} onChange={e => setEditGoldValue(e.target.value)} className="w-24 bg-black/50 border border-red-500/50 text-red-400 font-mono px-2 py-1 text-sm outline-none" />
                      <button onClick={wrapClick(handleSaveGold)} className="px-2 py-1 bg-red-500 text-white font-mono text-[10px]">저장</button>
                      <button onClick={wrapClick(() => setIsEditingGold(false))} className="px-2 py-1 bg-white/20 text-white font-mono text-[10px]">취소</button>
                    </div>
                  ) : (
                    <div className="text-amber-400 font-bold font-mono text-xl">{formatMoney(viewingUser.money)} G</div>
                  )}
                </div>
                <div className="text-white/50 font-mono text-sm">
                  {realWins} 승 / {viewingUser.losses || 0} 패 ({realWins + (viewingUser.losses || 0) > 0 ? Math.round((realWins / (realWins + (viewingUser.losses || 0))) * 100) : 0}%)
                </div>
              </div>
            </div>

            {/* 프로필 설명 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase">프로필 설명</h3>
                {isMe && !isEditingProfileDesc && (
                  <button onClick={() => { setIsEditingProfileDesc(true); setEditProfileDesc(viewingUser.profileDesc || ''); }} className="text-white/30 hover:text-white">
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
              {isEditingProfileDesc ? (
                <div className="flex gap-2">
                  <input type="text" value={editProfileDesc} onChange={e => setEditProfileDesc(e.target.value)} maxLength={50} className="flex-1 bg-black/40 border border-white/20 p-2 text-white font-sans text-sm focus:border-white" />
                  <button onClick={wrapClick(handleSaveProfileDesc)} className="px-4 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-mono">저장</button>
                </div>
              ) : (
                <p className="text-white/80 font-sans bg-black/20 p-4 border border-white/5">{viewingUser.profileDesc || "자기소개가 아직 없습니다."}</p>
              )}
            </div>

            {/* 업적 */}
            <div>
              <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase mb-3">달성한 업적 (클릭하여 확인)</h3>
              <div className="flex flex-wrap gap-2">
                {achievements.length > 0 ? achievements.map((ach, i) => (
                  <button
                    key={i}
                    onClick={() => { playSfx('click'); setSelectedAchDesc(ach); }}
                    className={`px-3 py-1.5 border font-mono text-xs shadow-sm transition-colors ${selectedAchDesc === ach ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/20 text-white/70 hover:text-white'}`}
                  >{ach}</button>
                )) : <span className="text-white/30 text-xs font-mono">아직 달성한 업적이 없습니다.</span>}
              </div>
              {selectedAchDesc && (
                <div className="mt-4 p-4 bg-black/40 border border-emerald-500/30 animate-fade-in flex justify-between items-center">
                  <div>
                    <span className="text-emerald-400 font-bold font-mono text-sm block mb-1">{selectedAchDesc}</span>
                    <span className="text-white/80 font-sans text-sm">{ACHIEVEMENTS_DATA[selectedAchDesc]}</span>
                  </div>
                  {isMe && viewingUser.equippedTitle !== selectedAchDesc && (
                    <button onClick={wrapClick(() => handleEquipTitle(selectedAchDesc))} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-xs font-mono hover:bg-emerald-500 hover:text-white transition-colors">
                      칭호 장착
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 방명록 */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex-1 flex flex-col min-h-[300px]">
            <HUDCorner />
            <h3 className="text-white/50 font-mono text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> 방명록
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
              {(viewingUser.guestbook || []).length > 0
                ? viewingUser.guestbook.slice().reverse().map((gb, i) => (
                  <div key={i} className="bg-black/30 p-3 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-300 font-bold text-xs">{gb.writerName}</span>
                      <span className="text-white/30 text-[10px]">{new Date(gb.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-white/80 text-sm">{gb.text}</p>
                  </div>
                ))
                : <div className="text-center text-white/30 text-xs mt-10">첫 번째 방명록을 남겨보세요!</div>
              }
            </div>
            {!isMe && (
              <form onSubmit={(e) => handleAddGuestbook(e, viewingProfileUserId)} className="flex gap-2">
                <input
                  type="text" value={guestbookInput} onChange={e => setGuestbookInput(e.target.value)}
                  maxLength={100} placeholder={`${viewingUser.nickname}님에게 방명록 남기기...`}
                  className="flex-1 bg-black/40 border border-white/20 p-3 text-white font-sans text-sm focus:outline-none focus:border-white transition-colors"
                />
                <button type="submit" className="px-4 bg-white/10 hover:bg-white hover:text-black text-white font-mono transition-colors">
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 보유 카드 목록 */}
      <div className="mt-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
        <HUDCorner />
        <h3 className="text-white/50 font-mono text-sm tracking-widest mb-6 uppercase flex items-center gap-2">
          <Hexagon size={16} /> 보유 자산 목록 ({viewingUserCards.length})
        </h3>
        {viewingUserCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {viewingUserCards.map(card => (
              <div key={card.id} className="cursor-pointer transition-transform hover:-translate-y-2" onClick={wrapClick(() => setPreviewCard(card))}>
                <CardItem card={card} hideSkills />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/30 font-mono text-sm py-10">보유한 카드가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
