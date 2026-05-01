import React from 'react';

// 등급에 따른 배경 포일 색상 지정
export const getFoilClass = (level) => {
  if (level >= 20) return 'bg-[length:200%_200%] bg-gradient-to-tr from-cyan-400 via-purple-500 to-yellow-400 animate-foil-shift p-[2px] shadow-[0_0_20px_rgba(0,255,255,0.4)]';
  if (level >= 18) return 'bg-[length:200%_200%] bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-purple-800 animate-foil-shift p-[2px] shadow-[0_0_15px_rgba(255,0,255,0.3)]';
  if (level >= 15) return 'bg-[length:200%_200%] bg-gradient-to-tr from-red-600 via-red-900 to-black animate-foil-shift p-[2px] shadow-[0_0_15px_rgba(255,51,0,0.3)]';
  if (level >= 11) return 'bg-[length:200%_200%] bg-gradient-to-tr from-yellow-300 via-yellow-600 to-amber-900 animate-foil-shift p-[2px]';
  if (level >= 8)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-purple-400 via-purple-700 to-black animate-foil-shift p-[2px]';
  if (level >= 5)  return 'bg-[length:200%_200%] bg-gradient-to-tr from-blue-400 via-blue-700 to-black animate-foil-shift p-[2px]';
  return 'bg-gradient-to-b from-gray-500 to-gray-800 p-[1px]';
};

// 등급별 텍스트 색상
export const getTierTextColor = (level) => {
  if (level >= 20) return 'text-cyan-300 drop-shadow-[0_0_8px_#67e8f9]';
  if (level >= 18) return 'text-fuchsia-400 drop-shadow-[0_0_8px_#e879f9]';
  if (level >= 15) return 'text-red-400 drop-shadow-[0_0_8px_#f87171]';
  if (level >= 11) return 'text-yellow-400 drop-shadow-[0_0_5px_#facc15]';
  if (level >= 8)  return 'text-purple-400 drop-shadow-[0_0_5px_#c084fc]';
  if (level >= 5)  return 'text-blue-400 drop-shadow-[0_0_5px_#60a5fa]';
  return 'text-gray-300';
};

// 커스텀 프레임 오버레이 이펙트
export const renderFrameOverlay = (frame) => {
  if (!frame) return null;
  if (frame === 'frame_rust') return <div className="absolute inset-0 pointer-events-none z-[40] border-[4px] border-[#a0522d] shadow-[inset_0_0_40px_rgba(139,69,19,0.9)] opacity-90"></div>;
  if (frame === 'frame_gold') return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-yellow-400 shadow-[inset_0_0_50px_rgba(250,204,21,0.8)] animate-pulse"></div>;
  if (frame === 'frame_neon') return <div className="absolute inset-0 pointer-events-none z-[40] border-[2px] border-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,1),0_0_15px_rgba(236,72,153,1)] border-r-pink-500 border-b-pink-500"></div>;
  if (frame === 'frame_void') return <div className="absolute inset-0 pointer-events-none z-[40] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.95)_100%)] border-2 border-purple-900 shadow-[inset_0_0_80px_rgba(88,28,135,1)]"></div>;
  if (frame === 'frame_hologram') return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[40] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.2)_3px,transparent_4px)] mix-blend-screen opacity-50"></div>
      <div className="absolute left-0 right-0 w-full h-[30%] pointer-events-none z-[41] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent mix-blend-screen" style={{ animation: 'scanline 2.5s linear infinite' }}></div>
    </>
  );
  if (frame === 'frame_blood') return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-red-600" style={{ animation: 'blood-pulse 1.5s ease-in-out infinite' }}></div>;
  if (frame === 'frame_obsidian') return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-gray-800 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.4)_25%,transparent_30%)]" style={{ backgroundSize: '200% 100%', animation: 'obsidian-shine 3s linear infinite', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9)' }}></div>;
  return null;
};

// 랭킹 리스트 등에 들어갈 미니 사이즈 카드
export const MiniCard = ({ card, onClick }) => {
  if (!card) return null;
  const foilBg = getFoilClass(card.level);
  return (
    <div onClick={onClick} className={`relative w-24 aspect-[2/3.1] rounded-lg ${foilBg} overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-500 hover:scale-110 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="w-full h-full bg-black relative rounded-md overflow-hidden border border-black/50">
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover opacity-90" />
        {renderFrameOverlay(card.equippedFrame)}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 text-center border-t border-white/20 z-30">
          <span className={`text-xs font-mono font-black ${getTierTextColor(card.level)}`}>LV.{card.level}</span>
        </div>
      </div>
    </div>
  );
};

// 덱, 뷰어 등에 들어갈 풀 사이즈 카드 컴포넌트
export const CardItem = ({ card, onCardClick, onCardHover, className="" }) => {
  if(!card) return (
    <div className={`w-full aspect-[2/3.1] border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-[10px] flex items-center justify-center text-white/30 font-mono text-sm transition-all duration-500 ${className}`}>
      <span className="opacity-30">EMPTY SLOT</span>
    </div>
  );
  
  const foilBg = getFoilClass(card.level);
  const textCol = getTierTextColor(card.level);
  
  return (
    <div 
      onClick={onCardClick ? () => onCardClick(card) : undefined} 
      onMouseEnter={onCardHover}
      className={`relative w-full aspect-[2/3.1] rounded-[10px] cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group ${foilBg} ${className}`}
    >
      <div className="w-full h-full relative z-10 rounded-[8px] overflow-hidden bg-black flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        <img src={card.imageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
        <div className="absolute inset-0 opacity-15 pointer-events-none z-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-80"></div>
        
        {renderFrameOverlay(card.equippedFrame)}
        
        {card.level >= 11 && <div className="absolute inset-0 holographic-overlay opacity-30 mix-blend-color-dodge z-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-50"></div>}
        {card.level >= 15 && <div className="absolute inset-0 bg-red-600/10 mix-blend-color-burn animate-pulse z-20 pointer-events-none"></div>}

        <div className="relative z-30 flex flex-col h-full p-3 transition-transform duration-500">
          <div className="flex justify-between items-start w-full drop-shadow-lg relative">
            <div className="font-sans font-black text-[1em] sm:text-xl tracking-wider text-white truncate max-w-[120px] uppercase leading-none mt-1 group-hover:text-emerald-300 transition-colors duration-300">
              {card.name}
            </div>
            
            {/* 고유 특성(Trait) 배지 */}
            {card.uniqueTrait && (
              <div className="absolute right-0 top-0 px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/50 rounded text-[0.45em] text-emerald-400 font-bold mix-blend-normal drop-shadow-md z-40">
                {card.uniqueTrait.name}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 w-full">
            <div className="text-[0.65em] text-white/70 italic leading-snug line-clamp-2 break-words drop-shadow-md bg-black/40 p-1 rounded-sm border-l border-white/20 transition-all duration-300 group-hover:bg-black/60 group-hover:text-white">
              "{card.description}"
            </div>
            <div className="flex flex-wrap gap-1 w-full">
              {card.unlockedSkills.map((s, i) => (
                <div key={i} className="flex items-center bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border-l-2 border-white/50 transition-all duration-300 group-hover:bg-white/20">
                  <span className="text-[0.6em] font-bold text-white tracking-widest">{s}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end gap-2 w-full mt-1">
              <div className="flex-1 grid grid-cols-4 gap-1 bg-black/60 backdrop-blur-md border border-white/20 p-1.5 rounded-sm transition-all duration-300 group-hover:bg-black/80">
                <div className="flex flex-col items-center"><span className="text-[0.45em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">ATK</span><span className="text-[0.7em] font-bold text-white">{card.stats.atk}</span></div>
                <div className="flex flex-col items-center"><span className="text-[0.45em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">DEF</span><span className="text-[0.7em] font-bold text-white">{card.stats.def}</span></div>
                <div className="flex flex-col items-center"><span className="text-[0.45em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">SPD</span><span className="text-[0.7em] font-bold text-white">{card.stats.spd}</span></div>
                <div className="flex flex-col items-center"><span className="text-[0.45em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">CRT</span><span className="text-[0.7em] font-bold text-white">{card.stats.crit}</span></div>
              </div>
              
              <div className={`w-[2.5em] h-[1.8em] bg-black border border-current flex items-center justify-center transform -skew-x-12 shadow-[0_0_10px_currentColor] transition-all duration-500 group-hover:shadow-[0_0_20px_currentColor] group-hover:scale-110 ${textCol}`}>
                <span className="transform skew-x-12 text-[0.8em] font-mono font-black tracking-tighter drop-shadow-md">LV.{card.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };
