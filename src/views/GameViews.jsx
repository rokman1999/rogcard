import React from 'react';
import { Trophy, Swords, Cpu, User, ArrowRight, Shield, Plus, MessageSquare, Crosshair, ShoppingCart, ArrowUpCircle, Info, Hexagon, Volume2, VolumeX } from 'lucide-react';
import { HUDCorner, formatMoney, ICONS } from '../components/ui/UI';
import { CardItem, MiniCard, getTierTextColor } from '../components/card/Card';
import { CREATE_CARD_COST, ENHANCEMENT_RULES, COST_BY_LEVEL, SKILLS_DATA } from '../constants/gameData';

export const LoginView = ({ game }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 relative z-10 overflow-hidden">
    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-100">
      <source src="[https://res.cloudinary.com/dkotceims/video/upload/v1777616211/14904105-hd_1920_1080_30fps_i7kg6w.mp4](https://res.cloudinary.com/dkotceims/video/upload/v1777616211/14904105-hd_1920_1080_30fps_i7kg6w.mp4)" type="video/mp4" />
    </video>
    <div className="text-center mb-24 animate-fade-in flex flex-col items-center relative z-10">
      <h1 className="text-6xl md:text-8xl font-black text-white font-logo tracking-[0.1em] drop-shadow-[0_0_20px_rgba(0,0,0,1)] hover:scale-105 transition-transform duration-700">ROG CARD</h1>
      <p className="font-mono text-sm tracking-[0.4em] text-white/90 drop-shadow-[0_0_10px_rgba(0,0,0,1)] mt-10">직접 만든 카드를 강화하세요.</p>
    </div>
    <form onSubmit={game.handleLogin} className="w-full max-w-sm flex flex-col gap-6 z-10 animate-slide-up bg-black/60 backdrop-blur-2xl border border-white/20 p-8 relative transition-all duration-300 hover:border-white/40">
      <HUDCorner />
      <div>
        <label className="block font-mono text-xs text-white/50 mb-3 tracking-widest font-light">아바타 선택</label>
        <div className="flex justify-between border-b border-white/10 pb-4">
          {Object.keys(ICONS).map(iconName => (
            <div key={iconName} onClick={game.wrapClick(() => game.setSelectedIconName(iconName))} onMouseEnter={game.handleHover} className={`p-2 cursor-pointer transition-all duration-300 ${game.selectedIconName === iconName ? 'text-white border-b border-white scale-110' : 'text-white/30 hover:text-white/70 hover:scale-105'}`}>
              {ICONS[iconName]}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block font-mono text-xs text-white/50 mb-2 tracking-widest font-light">닉네임</label>
        <input type="text" value={game.loginNickname} onChange={(e) => game.setLoginNickname(e.target.value.toUpperCase())} placeholder="닉네임 입력" maxLength={10} className="w-full p-3 bg-transparent border-b border-white/20 text-white font-sans text-lg focus:outline-none focus:border-white transition-all uppercase placeholder-white/20" required />
      </div>
      <div>
        <label className="block font-mono text-xs text-white/50 mb-2 tracking-widest font-light">비밀번호</label>
        <input type="password" value={game.loginPassword} onChange={(e) => game.setLoginPassword(e.target.value)} placeholder="비밀번호 (6자리 이상)" minLength={6} className="w-full p-3 bg-transparent border-b border-white/20 text-white font-sans text-lg focus:outline-none focus:border-white transition-all placeholder-white/20" required />
      </div>
      <button type="submit" disabled={game.isProcessing} onMouseEnter={game.handleHover} className="w-full py-4 bg-white/10 text-white font-light font-mono text-sm hover:bg-white hover:text-black disabled:opacity-50 transition-all uppercase tracking-widest mt-4">
        {game.isProcessing ? '초기화 중...' : '시스템 접속'}
      </button>
    </form>
  </div>
);

export const HeaderView = ({ game }) => (
  <header className="sticky top-0 z-40 bg-white/[0.01] backdrop-blur-3xl border-b border-white/10 p-5 px-8 flex justify-between items-center transition-all hover:bg-white/[0.03]">
    <h2 onClick={game.wrapClick(() => game.setCurrentView('lobby'))} onMouseEnter={game.handleHover} className="text-3xl font-black text-white cursor-pointer hover:opacity-70 transition-all font-logo tracking-[0.1em]">ROG CARD</h2>
    <div className="flex items-center gap-8 font-mono text-xs tracking-widest font-light">
      <button onClick={game.wrapClick(() => game.setCurrentView('shop'))} onMouseEnter={game.handleHover} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"><ShoppingCart size={16}/> 상점</button>
      <button onClick={game.wrapClick(() => game.setSoundEnabled(!game.soundEnabled))} className="text-white/50 hover:text-white transition-colors">{game.soundEnabled ? <span className="flex items-center gap-1"><Volume2 size={14}/> SOUND ON</span> : <span className="flex items-center gap-1"><VolumeX size={14}/> SOUND OFF</span>}</button>
      {game.userData && (<div className="flex items-center gap-6"><div className="flex items-center gap-2 text-white/70">{ICONS[game.userData.icon]} <span>{game.userData.nickname}</span></div><div className="text-white opacity-90 font-bold text-sm">{formatMoney(game.userData.money)} GOLD</div></div>)}
    </div>
  </header>
);

export const LobbyView = ({ game }) => {
  const richUsers = [...game.allUsers].sort((a,b) => b.money - a.money).slice(0, 50);
  const topWins = [...game.allUsers].sort((a,b) => b.wins - a.wins).slice(0, 50);
  const isAttended = game.userData?.lastAttendance === new Date().toISOString().split('T')[0];
  const topUser = game.rankingTab === 'money' ? richUsers[0] : topWins[0];
  const topUserCard = topUser ? game.allCards.filter(c => c.ownerId === topUser.userId).sort((a,b) => b.level - a.level)[0] : null;

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in relative z-10 flex flex-col lg:flex-row gap-10 w-full h-full">
      <div className="w-full lg:w-[350px] flex flex-col gap-6 h-[80vh]">
         <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 flex flex-col h-[50%] relative transition-all hover:border-white/20">
            <HUDCorner /><h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-4 uppercase">랭킹</h3>
            {topUserCard && (
              <div className="mb-4 flex gap-5 items-center bg-white/5 p-4 rounded-xl border border-amber-500/30 shadow-lg">
                <MiniCard card={topUserCard} onClick={game.wrapClick(() => game.setPreviewCard(topUserCard))} />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[10px] text-amber-400 font-mono tracking-widest mb-2 flex items-center gap-1"><Trophy size={12}/> RANK 1 ASSET</span>
                  <span className="text-lg font-bold text-white truncate">{topUserCard.name}</span>
                  <span className="text-xs text-white/50 font-mono mt-1">by {topUser.nickname}</span>
                </div>
              </div>
            )}
            <div className="flex gap-4 mb-4 font-mono text-[10px] tracking-widest">
              <button onClick={game.wrapClick(()=>game.setRankingTab('money'))} className={`pb-1 ${game.rankingTab==='money' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>자산</button>
              <button onClick={game.wrapClick(()=>game.setRankingTab('win'))} className={`pb-1 ${game.rankingTab==='win' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}>승리</button>
            </div>
            <div className="font-mono text-xs tracking-wide overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar">
              {(game.rankingTab === 'money' ? richUsers : topWins).map((u, i) => (
                <div key={u.userId} className={`flex justify-between items-center pb-2 border-b border-white/5 ${u.userId === game.user?.uid ? 'text-white font-bold' : 'text-white/60'}`}>
                  <div className="flex items-center gap-3"><span className="w-6 opacity-30 text-[10px]">{String(i+1).padStart(2,'0')}</span> <span className="truncate w-24">{u.nickname}</span></div>
                  <span>{game.rankingTab === 'money' ? formatMoney(u.money) : `${u.wins} W`}</span>
                </div>
              ))}
            </div>
         </div>
         <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 flex flex-col h-[50%] relative overflow-hidden transition-all hover:border-white/20">
            <HUDCorner /><h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-3 uppercase flex items-center gap-2">전체 채팅</h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 font-mono text-[11px] mb-3 pr-2 custom-scrollbar">
              {game.globalChats.map((msg, i) => (
                <div key={i} className="flex flex-col animate-slide-up">
                  {msg.sender !== 'SYSTEM' && <span className="mb-0.5 text-[9px] text-white/30">{msg.sender}</span>}
                  <span className={`break-words ${msg.sender === 'SYSTEM' ? 'text-amber-300 font-bold' : msg.sender === game.userData?.nickname ? 'text-emerald-300' : 'text-white/80'}`}>{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={game.handleSendGlobalChat} className="flex gap-2 border-t border-white/10 pt-3">
              <input type="text" value={game.globalChatInput} onChange={e=>game.setGlobalChatInput(e.target.value)} className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-white placeholder-white/20" placeholder="메시지 입력..." />
              <button type="submit" className="text-white/50 hover:text-white font-mono text-[10px]">전송</button>
            </form>
         </div>
      </div>
      <div className="flex-1 flex flex-col gap-6 relative">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 flex justify-between items-center relative transition-all hover:border-white/20">
          <HUDCorner />
          <div><h3 className="font-mono font-light text-sm text-white/70 tracking-widest mb-2 uppercase">일일 출석체크</h3><p className="font-sans text-sm text-white/40 font-light">매일 출석해 골드를 수령하세요.</p></div>
          <button onClick={game.wrapClick(game.handleAttendance)} disabled={isAttended} className={`px-8 py-3 font-mono text-xs tracking-widest uppercase ${isAttended ? 'text-white/20 border border-white/10' : 'bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black'}`}>{isAttended ? '수령 완료' : '수령'}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative">
          <div onClick={game.wrapClick(() => game.setCurrentView('deck'))} className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2">
            <HUDCorner /><Hexagon size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10"><h3 className="font-mono font-light text-xl text-white tracking-widest mb-3 uppercase">카드 관리</h3><p className="font-sans text-sm text-white/40 font-light">디지털 카드를 생성하고 한계를 돌파하세요.</p></div>
          </div>
          <div onClick={game.wrapClick(() => game.setCurrentView('battle_select'))} className="group p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/40 flex flex-col justify-center gap-6 cursor-pointer relative min-h-[250px] transition-all hover:-translate-y-2">
            <HUDCorner /><Swords size={40} className="text-white/40 group-hover:text-white transition-colors group-hover:scale-110" />
            <div className="relative z-10"><h3 className="font-mono font-light text-xl text-white tracking-widest mb-3 uppercase">1:1 전투</h3><p className="font-sans text-sm text-white/40 font-light">AI 및 타 유저와 대결하고 배팅하세요.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShopView = ({ game }) => (
  <div className="p-4 md:p-10 max-w-6xl mx-auto animate-fade-in relative z-10 min-h-[80vh] flex flex-col">
    <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/20">
      <h2 className="text-3xl font-mono font-light text-white tracking-[0.2em] uppercase">시스템 상점</h2>
      <button onClick={game.wrapClick(() => game.setCurrentView('lobby'))} className="text-white/50 hover:text-white font-mono text-xs tracking-widest uppercase flex items-center gap-2"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="bg-white/[0.02] border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30">
        <HUDCorner /><ArrowUpCircle size={36} className="text-emerald-400 mb-6" strokeWidth={1} />
        <h3 className="font-mono font-light text-xl text-white mb-2">강화 확률 부스트</h3>
        <p className="text-sm font-sans text-white/50 mb-6 flex-1">다음 강화 시 성공 확률을 10% 증가시킵니다.</p>
        <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
          <span className="font-mono text-white/40 text-xs">보유: {game.userData?.items?.boost || 0}</span>
          <button onClick={game.wrapClick(()=>game.handleBuyItem('boost', 10000, '확률 부스트'))} disabled={game.isProcessing} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black">10,000 G</button>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30">
        <HUDCorner /><Shield size={36} className="text-blue-400 mb-6" strokeWidth={1} />
        <h3 className="font-mono font-light text-xl text-white mb-2">하락/파괴 보호권</h3>
        <p className="text-sm font-sans text-white/50 mb-6 flex-1">강화 실패 시 등급 하락 및 파괴를 1회 막아줍니다.</p>
        <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
          <span className="font-mono text-white/40 text-xs">보유: {game.userData?.items?.protect || 0}</span>
          <button onClick={game.wrapClick(()=>game.handleBuyItem('protect', 50000, '하락/파괴 보호권'))} disabled={game.isProcessing} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black">50,000 G</button>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30">
        <HUDCorner /><Plus size={36} className="text-amber-400 mb-6" strokeWidth={1} />
        <h3 className="font-mono font-light text-xl text-white mb-2">카드 슬롯 확장</h3>
        <p className="text-sm font-sans text-white/50 mb-6 flex-1">보유 가능한 카드의 최대 개수를 1칸 늘립니다.</p>
        <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
          <span className="font-mono text-white/40 text-xs">현재: {game.userData?.maxSlots || 3} / 10</span>
          <button onClick={game.wrapClick(()=>game.handleBuyItem('slot', 20000, '카드 슬롯 확장'))} disabled={game.isProcessing || (game.userData?.maxSlots >= 10)} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black disabled:opacity-30">20,000 G</button>
        </div>
      </div>
    </div>
  </div>
);

export const DeckView = ({ game }) => {
  const renderSlots = Array.from({ length: game.userData?.maxSlots || 3 });
  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto animate-fade-in min-h-[80vh] relative z-10 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-6 border-b border-white/20">
        <div className="flex items-center gap-4"><h2 className="text-2xl font-mono font-light text-white tracking-[0.2em] uppercase">카드 관리</h2><span className="font-mono text-xs text-white/40 tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">보유량: {game.myCards.length}/{game.userData?.maxSlots || 3}</span></div>
        <div className="relative"><button onClick={game.wrapClick(() => game.setShowCreateModal(true))} className="flex items-center gap-3 px-6 py-3 text-white font-mono font-light text-xs transition-all uppercase hover:scale-105 bg-white/10 border border-white/20 hover:bg-white hover:text-black"><Plus size={14} /> 신규 카드 생성 [-{formatMoney(CREATE_CARD_COST)} G]</button></div>
      </div>
      {game.myCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 font-sans font-light text-lg text-white/40 bg-white/[0.01] border border-white/5 backdrop-blur-md"><span className="mb-2">보유 중인 카드가 없습니다.</span><span>신규 카드를 생성하여 시작하세요.</span></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {renderSlots.map((_, i) => {
            const card = game.myCards[i];
            if (!card) return (<div key={`empty-${i}`} className="w-full aspect-[2/3.1] border-2 border-dashed border-white/10 bg-white/[0.01] rounded-[10px] flex flex-col items-center justify-center text-white/20 font-mono text-xs"><Plus size={24} className="mb-2 opacity-50"/><span>EMPTY SLOT</span></div>);
            return (
              <div key={card.id} className="relative group">
                <CardItem card={card} />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-md z-20 p-5 rounded-[12px]">
                  <button onClick={game.wrapClick(() => { game.setSelectedCard(card); game.setCurrentView('card_details'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105">상세 정보</button>
                  <button onClick={game.wrapClick(() => { game.setSelectedCard(card); game.setCurrentView('enhance'); })} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105">카드 강화</button>
                  <button onClick={game.wrapClick(() => game.startAIBattleSetup(card))} className="w-full py-2 bg-white/10 text-white border border-white/20 font-mono text-[10px] uppercase hover:bg-white hover:text-black hover:scale-105">전투 참가</button>
                  <button onClick={game.wrapClick(() => game.handleSellCard(card))} className="w-full py-2 mt-2 text-white/50 font-mono text-[10px] underline hover:text-white hover:scale-105">카드 판매</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {game.showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <form onSubmit={game.handleCreateCard} className="bg-white/[0.02] border border-white/10 p-6 sm:p-10 w-full max-w-md relative animate-slide-up">
            <HUDCorner />
            <h3 className="font-mono font-light text-xl text-white mb-8 tracking-widest uppercase">신규 카드 생성</h3>
            {!game.cropImage ? (
              <div className="mb-8 w-full"><input type="file" accept="image/*" onChange={game.handleFileChange} className="w-full font-mono text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:bg-transparent file:text-white cursor-pointer p-2 border-b border-white/20" required /></div>
            ) : (
              <div className="mb-8 w-full flex flex-col items-center gap-4">
                <div className="relative w-[200px] h-[310px] bg-black border border-white/20 overflow-hidden cursor-move touch-none shrink-0" onMouseDown={game.handleCropPointerDown} onMouseMove={game.handleCropPointerMove} onMouseUp={game.handleCropPointerUp} onMouseLeave={game.handleCropPointerUp} onTouchStart={game.handleCropPointerDown} onTouchMove={game.handleCropPointerMove} onTouchEnd={game.handleCropPointerUp}>
                  <img ref={game.imgRef} src={game.cropImage} alt="crop" className="absolute max-w-none pointer-events-none" onLoad={() => { game.setImgLoaded(true); game.setCropPan({x:0, y:0}); }} style={{ width: game.imgLoaded && game.imgRef.current ? `${game.imgRef.current.naturalWidth * Math.max(200 / game.imgRef.current.naturalWidth, 310 / game.imgRef.current.naturalHeight) * game.cropZoom}px` : 'auto', height: game.imgLoaded && game.imgRef.current ? `${game.imgRef.current.naturalHeight * Math.max(200 / game.imgRef.current.naturalWidth, 310 / game.imgRef.current.naturalHeight) * game.cropZoom}px` : 'auto', left: game.imgLoaded && game.imgRef.current ? `${100 - (game.imgRef.current.naturalWidth * Math.max(200 / game.imgRef.current.naturalWidth, 310 / game.imgRef.current.naturalHeight) * game.cropZoom)/2 + game.cropPan.x}px` : '0px', top: game.imgLoaded && game.imgRef.current ? `${155 - (game.imgRef.current.naturalHeight * Math.max(200 / game.imgRef.current.naturalWidth, 310 / game.imgRef.current.naturalHeight) * game.cropZoom)/2 + game.cropPan.y}px` : '0px' }} />
                </div>
                <input type="range" min="1" max="3" step="0.1" value={game.cropZoom} onChange={game.handleZoomChange} className="w-[200px] accent-emerald-400 h-1 bg-white/20 appearance-none cursor-pointer mt-2" />
                <button type="button" onClick={() => game.setCropImage(null)} className="text-white/50 text-xs font-mono underline hover:text-white mt-1">다른 이미지 선택</button>
              </div>
            )}
            <div className="mb-6"><label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">이름 (최대 10자)</label><input type="text" name="cardName" maxLength="10" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-sans text-lg focus:border-white uppercase" required /></div>
            <div className="mb-10"><label className="block font-mono text-[10px] text-white/50 mb-3 tracking-widest uppercase">설명 (최대 60자)</label><textarea name="cardDescription" maxLength="60" rows="3" className="w-full bg-transparent border-b border-white/30 p-2 text-white font-sans text-sm focus:border-white resize-none" placeholder="카드의 기원 기록"></textarea></div>
            <div className="flex gap-4"><button type="button" onClick={game.wrapClick(() => game.setShowCreateModal(false))} className="flex-1 py-4 border border-white/20 text-white/50 font-mono text-xs hover:text-white">취소</button><button type="submit" disabled={game.isProcessing} className="flex-1 py-4 bg-white/10 text-white border border-white/20 font-mono text-xs hover:bg-white hover:text-black disabled:opacity-30">{game.isProcessing ? '처리 중...' : '확인 및 생성'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

export const CardDetailView = ({ game }) => {
  if (!game.selectedCard) return null;
  const framesList = [
    { id: 'frame_rust', name: '녹슨 고철', desc: '세월의 흔적이 묻은 앤틱 프레임' }, { id: 'frame_hologram', name: '홀로그램 스캔라인', desc: '화려한 스캔라인 오버레이' }, { id: 'frame_blood', name: '블러드 펄스', desc: '핏빛 쉐도우 효과' },
    { id: 'frame_obsidian', name: '옵시디언 엣지', desc: '고급스러운 다크 엣지 음영' }, { id: 'frame_gold', name: '골든 아우라', desc: '황금빛 프레임 효과' }, { id: 'frame_neon', name: '네온 사이버', desc: '사이버펑크 네온 효과' }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <div className="w-full flex justify-start mb-8"><button onClick={game.wrapClick(() => game.setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-xs uppercase"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button></div>
      <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full">
        <div className="w-64 md:w-80 lg:w-[360px]"><CardItem card={game.selectedCard} className="pointer-events-none" /></div>
        <div className="flex-1 w-full flex flex-col gap-8">
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
            <HUDCorner /><h4 className="font-mono text-sm text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">카드 상세 정보</h4>
            <div className="flex flex-col gap-6">
              <div><span className="font-mono text-[10px] text-white/40 block mb-1">DESIGNATION</span><div className="flex items-center gap-4"><span className="font-sans font-bold text-3xl text-white">{game.selectedCard.name}</span>{game.selectedCard.uniqueTrait && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded text-xs font-mono font-bold">{game.selectedCard.uniqueTrait.name}</span>}</div></div>
              <div><span className="font-mono text-[10px] text-white/40 block mb-1">DESCRIPTION</span><span className="font-sans text-sm text-white/80 block bg-black/20 p-3 rounded">"{game.selectedCard.description}"</span></div>
              {game.selectedCard.uniqueTrait && <div><span className="font-mono text-[10px] text-white/40 block mb-1">UNIQUE TRAIT</span><span className="font-sans text-sm text-emerald-300 block bg-emerald-900/20 p-3 rounded">{game.selectedCard.uniqueTrait.desc}</span></div>}
              <div>
                <span className="font-mono text-[10px] text-white/40 block mb-3">ACQUIRED SKILLS (클릭하여 설명 확인)</span>
                <div className="flex flex-wrap gap-2">{game.selectedCard.unlockedSkills.length > 0 ? game.selectedCard.unlockedSkills.map(s => (<button key={s} onClick={game.wrapClick(() => game.setSelectedSkillDesc(s))} className={`px-3 py-1.5 font-mono text-xs rounded border border-white/10 ${game.selectedSkillDesc === s ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>{s}</button>)) : <span className="text-white/30 font-mono text-xs">보유 스킬 없음</span>}</div>
                {game.selectedSkillDesc && (<div className="mt-4 p-4 bg-black/40 border border-emerald-500/30 rounded animate-fade-in"><span className="text-emerald-400 font-bold font-mono text-sm block mb-1">{game.selectedSkillDesc}</span><span className="text-white/80 font-sans text-sm">{SKILLS_DATA[game.selectedSkillDesc]}</span></div>)}
              </div>
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative">
            <HUDCorner /><h4 className="font-mono text-sm text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">프레임 장착</h4>
            <div className="flex flex-col gap-3 font-mono text-xs h-64 overflow-y-auto custom-scrollbar pr-2">
              {framesList.map(frame => {
                const isOwned = game.userData?.frames?.includes(frame.id);
                const isEquipped = game.selectedCard.equippedFrame === frame.id;
                return (
                  <div key={frame.id} className={`flex items-center justify-between p-4 border border-white/10 ${isEquipped ? 'border-emerald-500/50 bg-emerald-500/10' : 'bg-black/40'}`}>
                    <div className="flex flex-col gap-1"><span className={`font-bold text-sm ${isEquipped ? 'text-emerald-400' : 'text-white'}`}>{frame.name}</span><span className="text-white/40 text-[10px]">{frame.desc}</span></div>
                    <div>{!isOwned ? <span className="text-white/30 text-[10px] bg-white/5 px-3 py-1.5 rounded">미보유</span> : isEquipped ? <button onClick={game.wrapClick(() => game.handleEquipCardFrame(null))} disabled={game.isProcessing} className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white">해제</button> : <button onClick={game.wrapClick(() => game.handleEquipCardFrame(frame.id))} disabled={game.isProcessing} className="px-5 py-2.5 bg-white/10 text-white rounded hover:bg-white hover:text-black">장착</button>}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnhanceView = ({ game }) => {
  if (!game.selectedCard) return null;
  const isMax = game.selectedCard.level >= 20;
  const nextRule = !isMax ? ENHANCEMENT_RULES[game.selectedCard.level + 1] : null;
  const cost = !isMax ? COST_BY_LEVEL[game.selectedCard.level + 1] : 0;
  
  let effectClass = "";
  if (game.enhanceVisualState === 'charging_fast') effectClass = "animate-shake pointer-events-none brightness-125 scale-[1.02] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]";
  else if (game.enhanceVisualState === 'charging_tension') effectClass = "animate-tension-shake pointer-events-none brightness-150 saturate-150 scale-[1.05] drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]";
  else if (game.enhanceVisualState.startsWith('success')) { const lvl = parseInt(game.enhanceVisualState.split('_')[1]); effectClass = lvl >= 15 ? "animate-flash-bang drop-shadow-[0_0_50px_rgba(0,255,255,1)] scale-110" : lvl >= 10 ? "animate-flash-bang drop-shadow-[0_0_30px_rgba(255,255,0,0.8)] scale-[1.05]" : "animate-flash-bang drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"; }
  else if (game.enhanceVisualState === 'fail') effectClass = "animate-shake grayscale brightness-50";
  else if (game.enhanceVisualState === 'destroyed') effectClass = "animate-shatter opacity-0";

  return (
    <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
      {game.enhanceVisualState.startsWith('success') && parseInt(game.enhanceVisualState.split('_')[1]) >= 8 && <div className="absolute inset-0 bg-white/20 animate-flash-white pointer-events-none z-0"></div>}
      <div className="w-full flex justify-start mb-8"><button onClick={game.wrapClick(() => game.setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-xs uppercase"><ArrowRight className="rotate-180" size={14}/> 뒤로 가기</button></div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full">
        <div className="w-full lg:w-1/3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative order-2 lg:order-1">
          <HUDCorner /><h4 className="font-mono font-light text-sm text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">카드 능력치</h4>
          <div className="space-y-4 font-mono text-sm tracking-widest font-light">
            <div className="flex justify-between"><span>HP</span> <span className="text-white font-bold">{game.selectedCard.stats.hp}</span></div>
            <div className="flex justify-between"><span>ATK</span> <span className="text-white font-bold">{game.selectedCard.stats.atk}</span></div>
            <div className="flex justify-between"><span>DEF</span> <span className="text-white font-bold">{game.selectedCard.stats.def}%</span></div>
            <div className="flex justify-between border-t border-white/10 pt-4"><span className="text-white/60">행운 보너스</span> <span className="text-emerald-400 font-bold">+{(game.selectedCard.stats.luck * 0.3).toFixed(1)}%</span></div>
          </div>
        </div>
        <div className="w-64 md:w-80 lg:w-[360px] order-1 lg:order-2 flex flex-col items-center relative">
          <div className={`transition-all duration-300 w-full ${effectClass}`}>{game.enhanceVisualState !== 'destroyed' && <CardItem card={game.selectedCard} className="pointer-events-none" />}{game.enhanceVisualState.startsWith('success') && <div className="absolute inset-0 bg-white/50 mix-blend-overlay animate-flash-bang pointer-events-none rounded-lg"></div>}</div>
        </div>
        <div className="w-full lg:w-1/3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative order-3 flex flex-col justify-center min-h-[300px]">
          <HUDCorner />
          {isMax ? (<div className="text-center text-white font-mono text-2xl tracking-[0.2em] uppercase">최대 성능 도달</div>) : (
            <>
              <div className="text-center mb-6 flex items-center justify-center gap-6 font-mono tracking-widest"><span className="text-white/30 text-xl font-light">LV.{game.selectedCard.level}</span><ArrowRight className="text-white/20" size={20}/><span className="text-3xl font-bold text-white drop-shadow-md">LV.{game.selectedCard.level + 1}</span></div>
              <div className="w-full mb-6 font-mono text-[10px] tracking-widest">
                <div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={game.useBoost} onChange={()=>game.setUseBoost(!game.useBoost)} disabled={!(game.userData?.items?.boost > 0)} className="accent-white cursor-pointer"/><span className={game.userData?.items?.boost > 0 ? "text-white" : "text-white/30"}>부스트 사용 (보유: {game.userData?.items?.boost || 0})</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={game.useProtect} onChange={()=>game.setUseProtect(!game.useProtect)} disabled={!(game.userData?.items?.protect > 0) || nextRule.onFail === 'keep'} className="accent-white cursor-pointer"/><span className={game.userData?.items?.protect > 0 && nextRule.onFail !== 'keep' ? "text-white" : "text-white/30"}>보호권 사용 (보유: {game.userData?.items?.protect || 0})</span></div>
              </div>
              <div className="w-full mb-8 font-mono text-xs tracking-widest font-light">
                <div className="flex justify-between mb-4 text-white/50"><span>기본 확률</span><span>{nextRule.successRate}%</span></div>
                <div className="flex justify-between text-white border-t border-white/10 pt-4"><span>현재 확률</span><span className={game.useBoost ? "text-emerald-400 font-bold" : ""}>{Math.min(99, (nextRule.successRate + game.selectedCard.stats.luck * 0.3 + (game.useBoost?10:0))).toFixed(1)}%</span></div>
              </div>
              <div className="w-full mb-10 font-mono text-[10px] tracking-widest p-4 border border-white/5 bg-black/20">
                <span className="text-white/40 block mb-3 uppercase">실패 시:</span>
                {(nextRule.onFail === 'keep' || game.useProtect) && <span className="text-white/80">안전 (등급 유지) {game.useProtect && <span className="text-emerald-400 font-bold">[보호됨]</span>}</span>}
                {(nextRule.onFail === 'down' && !game.useProtect) && <span className="text-white/80">등급 하락 -{nextRule.levelDownOnFail}</span>}
                {(nextRule.onFail === 'mixed' && !game.useProtect) && (<div className="space-y-2"><span className="text-white/80 block">등급 하락 -{nextRule.levelDownOnFail} ({100-nextRule.destroyChance}%)</span><span className="text-red-500 font-bold block animate-pulse">카드 영구 파괴 ({nextRule.destroyChance}%)</span></div>)}
              </div>
              <button onClick={game.wrapClick(() => game.handleEnhance(game.selectedCard))} disabled={game.isProcessing || game.enhanceVisualState !== 'idle'} className="w-full py-4 bg-white/10 border border-white/20 text-white font-mono text-xs uppercase hover:bg-white hover:text-black disabled:opacity-30">카드 강화 [ -{formatMoney(cost)} GOLD ]</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const BattleSelectView = ({ game }) => (
  <div className="p-4 md:p-10 max-w-5xl mx-auto animate-fade-in relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
    <h2 className="text-2xl font-mono font-light text-white mb-16 tracking-[0.2em] uppercase drop-shadow-md">전투 모드 선택</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <div onClick={game.wrapClick(() => { if(game.myCards.length === 0) { game.showToast("보유한 카드가 없습니다", "error"); return; } game.startAIBattleSetup(game.myCards[0]); })} className="group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 cursor-pointer text-center flex flex-col items-center hover:bg-white/[0.05] hover:-translate-y-2 transition-all">
        <HUDCorner /><Cpu size={48} strokeWidth={1} className="text-white/30 group-hover:text-white mb-8 transition-colors group-hover:scale-110" />
        <h3 className="text-lg font-mono font-light text-white mb-3 tracking-widest uppercase">AI와 대전하기</h3>
        <p className="text-white/40 text-sm font-sans font-light">가상 적들과 대결하여 골드를 벌어보세요.</p>
      </div>
      <div onClick={game.wrapClick(() => { if(game.myCards.length === 0) { game.showToast("보유한 카드가 없습니다", "error"); return; } if(!game.selectedCard) game.setSelectedCard(game.myCards[0]); game.setCurrentView('pvp_setup'); })} className="group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-12 cursor-pointer text-center flex flex-col items-center hover:bg-white/[0.05] hover:-translate-y-2 transition-all">
        <HUDCorner /><User size={48} strokeWidth={1} className="text-white/30 group-hover:text-white mb-8 transition-colors group-hover:scale-110" />
        <h3 className="text-lg font-mono font-light text-white mb-3 tracking-widest uppercase">유저와 대결하기</h3>
        <p className="text-white/40 text-sm font-sans font-light">방을 개설하고 실시간으로 대결하세요.</p>
      </div>
    </div>
    <button onClick={game.wrapClick(() => game.setCurrentView('lobby'))} className="mt-16 text-white/30 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">뒤로 가기</button>
  </div>
);

export const PvPRoomView = ({ game }) => {
  if (!game.pvpRoomData) return null;
  const isHost = game.pvpRoomData.host.uid === game.user.uid;
  const opponent = isHost ? game.pvpRoomData.guest : game.pvpRoomData.host;
  const myMatchCard = isHost ? game.pvpRoomData.hostCard : game.pvpRoomData.guestCard;
  const oppMatchCard = isHost ? game.pvpRoomData.guestCard : game.pvpRoomData.hostCard;
  const isReady = game.pvpRoomData.status === 'ready';

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
        <div className="flex-[2] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 relative flex flex-col items-center">
          <HUDCorner /><h2 className="text-sm font-mono text-white/50 mb-12 uppercase">{game.pvpRoomData.roomName} <span className="text-[10px]">({game.pvpRoomId})</span></h2>
          <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-center mb-16">
            <div className="flex flex-col items-center w-56"><span className="text-white/70 font-mono text-xs mb-4">{game.userData.nickname}</span><CardItem card={myMatchCard} /></div>
            <div className="flex flex-col items-center gap-4"><div className="text-white/40 text-[10px] tracking-[0.2em] font-mono">TOTAL WAGER</div><div className="text-amber-400 font-mono font-bold text-2xl bg-white/5 px-6 py-3 rounded-md border border-amber-500/30 whitespace-nowrap">{formatMoney(game.pvpRoomData.bet * 2)} GOLD</div></div>
            <div className="flex flex-col items-center w-56"><span className="text-white/70 font-mono text-xs mb-4">{opponent ? opponent.nickname : '대기 중...'}</span><CardItem card={oppMatchCard} className={!oppMatchCard ? 'opacity-30 grayscale' : ''} /></div>
          </div>
          {isHost ? (<button onClick={game.wrapClick(game.handleStartPvPBattle)} disabled={!isReady} className="w-full max-w-md py-4 bg-white text-black font-mono text-sm hover:bg-white/80 disabled:opacity-30 font-bold uppercase tracking-[0.2em]">{isReady ? '전투 시작' : '상대 대기 중...'}</button>) : (<div className="w-full max-w-md py-4 border border-white/20 text-white/40 text-center font-mono text-xs uppercase tracking-[0.2em]">호스트의 시작 대기 중...</div>)}
          <button onClick={game.wrapClick(() => { game.setPvpRoomId(null); game.setCurrentView('battle_select'); })} className="mt-8 text-white/30 hover:text-white text-[10px] font-mono tracking-widest uppercase transition-colors">방 나가기</button>
        </div>
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 relative flex flex-col overflow-hidden min-h-[400px]">
          <HUDCorner />
          <div className="p-5 border-b border-white/10 font-mono font-light text-xs text-white/50 tracking-widest uppercase flex justify-center gap-2"><MessageSquare size={14} /> 통신 채널</div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 font-mono text-[11px] custom-scrollbar">
            {game.pvpRoomData.chat.map((msg, i) => (<div key={i} className={`flex flex-col ${msg.sender === game.userData.nickname ? 'items-end' : 'items-start'} animate-slide-up`}><span className="text-[9px] text-white/30 mb-1">{msg.sender}</span><div className={`px-4 py-2 ${msg.sender === game.userData.nickname ? 'bg-white/10 text-white' : 'border border-white/10 text-white/70'} max-w-[90%] break-words rounded-md`}>{msg.text}</div></div>))}
          </div>
          <form onSubmit={game.handleSendChat} className="p-4 border-t border-white/10 flex gap-3"><input type="text" value={game.chatInput} onChange={e=>game.setChatInput(e.target.value)} className="flex-1 bg-transparent border-b border-white/20 px-2 py-2 text-white font-mono text-xs focus:outline-none focus:border-white" placeholder="메시지 입력" /><button type="submit" className="text-white/50 hover:text-white font-mono text-[10px] tracking-widest uppercase">전송</button></form>
        </div>
      </div>
    </div>
  );
};

export const BattleView = ({ game }) => {
  if (!game.liveState) return null;
  const p1HpPercent = Math.max(0, (game.liveState.p1Hp / game.liveState.p1Max) * 100);
  const p2HpPercent = Math.max(0, (game.liveState.p2Hp / game.liveState.p2Max) * 100);
  const action = game.liveState.currentAction;
  const isP1Acting = action?.actor === 'p1' || action?.attacker === 'p1';
  const isP2Acting = action?.actor === 'p2' || action?.attacker === 'p2';
  const isP1Hit = action?.defender === 'p1';
  const isP2Hit = action?.defender === 'p2';
  const stepParity = game.battleStep % 2;
  let p1Anim = ''; let p2Anim = '';

  if (isP1Acting) { if (action?.type === 'dodge') p1Anim = `animate-dodge-left-${stepParity}`; else if (action?.type === 'skill') p1Anim = `animate-skill-charge-${stepParity}`; else p1Anim = `animate-attack-right-${stepParity}`; } 
  else if (isP1Hit) { if (action?.type === 'critical') p1Anim = `animate-hit-heavy-${stepParity}`; else p1Anim = `animate-hit-light-${stepParity}`; }
  if (isP2Acting) { if (action?.type === 'dodge') p2Anim = `animate-dodge-right-${stepParity}`; else if (action?.type === 'skill') p2Anim = `animate-skill-charge-${stepParity}`; else p2Anim = `animate-attack-left-${stepParity}`; } 
  else if (isP2Hit) { if (action?.type === 'critical') p2Anim = `animate-hit-heavy-${stepParity}`; else p2Anim = `animate-hit-light-${stepParity}`; }

  return (
    <div className="min-h-[85vh] flex flex-col p-4 max-w-6xl mx-auto relative overflow-hidden animate-fade-in z-10 w-full">
      {action?.type === 'critical' && <div key={`flash-${game.battleStep}`} className="absolute inset-0 bg-red-600/40 animate-flash-red pointer-events-none z-0 mix-blend-color-burn"></div>}
      
      <div className="flex justify-between items-center gap-8 mb-16 mt-6 font-mono border-b border-white/10 pb-8 z-10">
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs tracking-widest mb-2 font-bold uppercase text-white/80"><span>{game.battleType === 'PvP' ? game.pvpRoomData?.hostCard.name : game.selectedCard.name}</span><span className="text-white drop-shadow-[0_0_5px_#fff]">{Math.ceil(game.liveState.p1Hp)} <span className="text-[10px] text-white/50">/ {game.liveState.p1Max}</span></span></div>
          <div className="h-5 bg-white/5 relative overflow-hidden border border-white/20 p-0.5" style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}><div className={`h-full transition-all duration-300 ease-out ${p1HpPercent > 50 ? 'bg-emerald-400' : p1HpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} style={{width: `${p1HpPercent}%`}}></div></div>
        </div>
        <div className="text-xl font-light text-white/20 tracking-[0.2em] font-mono">VS</div>
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs tracking-widest mb-2 font-bold uppercase text-white/80"><span className="text-white drop-shadow-[0_0_5px_#fff]">{Math.ceil(game.liveState.p2Hp)} <span className="text-[10px] text-white/50">/ {game.liveState.p2Max}</span></span><span>{game.battleType === 'PvP' ? game.pvpRoomData?.guestCard.name : game.aiOpponent.name}</span></div>
          <div className="h-5 bg-white/5 relative overflow-hidden flex justify-end border border-white/20 p-0.5" style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}><div className={`h-full transition-all duration-300 ease-out ${p2HpPercent > 50 ? 'bg-emerald-400' : p2HpPercent > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} style={{width: `${p2HpPercent}%`}}></div></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-16 md:gap-40 relative z-10 perspective-1000">
        <div className={`transition-all duration-100 ${p1Anim} ${game.liveState.p1Hp <= 0 ? 'opacity-20 grayscale blur-[2px]' : ''} relative`}>
           <div className="w-48 md:w-64 shadow-[0_0_30px_rgba(0,0,0,1)]"><CardItem card={game.battleType === 'PvP' ? game.pvpRoomData?.hostCard : game.selectedCard} /></div>
           {isP1Hit && action?.damage > 0 && (<div key={`dmg-p1-${game.battleStep}`} className={`absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap ${action?.type === 'critical' ? 'animate-floating-crit-dmg text-7xl font-black text-red-500' : 'animate-floating-dmg text-5xl font-bold text-white'}`}>-{action.damage}</div>)}
           {action?.type === 'dodge' && action?.actor === 'p1' && <div key={`dodge-p1-${game.battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black italic text-cyan-400 animate-float-up pointer-events-none z-50">EVADED!</div>}
        </div>
        <div className={`transition-all duration-100 ${p2Anim} ${game.liveState.p2Hp <= 0 ? 'opacity-20 grayscale blur-[2px]' : ''} relative`}>
           <div className="w-48 md:w-64 shadow-[0_0_30px_rgba(0,0,0,1)]"><CardItem card={game.battleType === 'PvP' ? game.pvpRoomData?.guestCard : game.aiOpponent} /></div>
           {isP2Hit && action?.damage > 0 && (<div key={`dmg-p2-${game.battleStep}`} className={`absolute top-1/2 left-1/2 pointer-events-none z-50 whitespace-nowrap ${action?.type === 'critical' ? 'animate-floating-crit-dmg text-7xl font-black text-red-500' : 'animate-floating-dmg text-5xl font-bold text-white'}`}>-{action.damage}</div>)}
           {action?.type === 'dodge' && action?.actor === 'p2' && <div key={`dodge-p2-${game.battleStep}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold italic text-cyan-400 animate-float-up pointer-events-none z-50">EVADED!</div>}
        </div>
      </div>

      {game.battleResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="bg-transparent border border-white/20 p-12 text-center max-w-lg w-full relative">
            <HUDCorner />
            <h2 className={`font-sans font-black text-5xl tracking-[0.2em] mb-8 uppercase ${game.battleResult==='win'?'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]':'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>{game.battleResult === 'win' ? 'VICTORY' : 'DEFEAT'}</h2>
            <button onClick={game.wrapClick(() => { game.setPvpRoomId(null); game.setCurrentView('lobby'); })} className="w-full py-4 bg-white/10 text-white hover:bg-white hover:text-black transition-all font-mono text-xs uppercase font-bold">시스템 복귀</button>
          </div>
        </div>
      )}

      <div className="h-40 mt-10 overflow-y-auto flex flex-col justify-end font-mono text-[11px] tracking-widest text-white/40 border-t border-white/10 pt-4 custom-scrollbar z-10 bg-black/40 rounded-t-xl px-4 transition-all hover:bg-black/60">
        {game.battleLog.slice(0, game.battleStep + 1).map((log, i) => (
          <div key={i} className={`py-1 animate-slide-up uppercase transition-colors ${log.type === 'critical' ? 'text-red-400 font-bold text-base' : ''} ${log.type === 'skill' ? 'text-white font-bold' : ''}`}>{log.text}</div>
        ))}
        <div ref={el => el && el.scrollIntoView()} />
      </div>
    </div>
  );
};
