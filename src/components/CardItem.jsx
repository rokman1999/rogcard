// CardItem: 게임의 핵심 UI 요소인 카드 컴포넌트
// 카드 레벨에 따라 홀로그램/글로우 효과가 달라지며, 호버 시 애니메이션 포함
// CardItem은 전체 크기, MiniCard는 미니어처 버전 - 각각 다른 맥락에서 사용

import FrameOverlay from './FrameOverlay';
import { getFoilClass, getTierTextColor } from '../utils/cardUtils';

const CardItem = ({ card, onClick, onHover, className = "", compact = false, hideSkills = false }) => {
  // 카드 데이터가 없으면 빈 슬롯 표시 (덱 관리 화면에서 빈 슬롯 시각화)
  if (!card) return (
    <div className={`w-full aspect-[2/3.1] border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-[10px] flex items-center justify-center text-white/30 font-mono text-sm transition-all duration-500 ${className}`}>
      <span className="opacity-30">EMPTY SLOT</span>
    </div>
  );

  const foilBg = getFoilClass(card.level);
  const textCol = getTierTextColor(card.level);

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`relative w-full aspect-[2/3.1] transition-all duration-500 group ${foilBg} ${className}`}
    >
      <div className="w-full h-full relative z-10 overflow-hidden bg-black flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        <img
          src={card.imageUrl}
          alt={card.name}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
        />
        {/* 노이즈 텍스처 오버레이: 디지털 카드 특유의 질감 표현 */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none z-10 mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIi8+PC9zdmc+')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-80"></div>

        {/* 장착된 프레임 스킨 오버레이 */}
        <FrameOverlay frame={card.equippedFrame} />

        {/* 고급 레벨 전용 홀로그래픽 오버레이 효과 */}
        {/* level 15+ 빨간 포일 티어에서 color-dodge 와 color-burn 동시 적용 시 윈도우 GPU에서 초록 아티팩트 발생 → level 11-14에만 적용 */}
        {card.level >= 11 && card.level < 15 && (
          <div className="absolute inset-0 holographic-overlay opacity-30 mix-blend-color-dodge z-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-50"></div>
        )}
        {card.level >= 15 && card.level < 21 && (
          <div className="absolute inset-0 bg-red-600/10 mix-blend-color-burn animate-pulse z-20 pointer-events-none"></div>
        )}
        {/* 초월 티어: 시안 화이트 펄스 */}
        {card.level >= 21 && (
          <div className="absolute inset-0 bg-cyan-300/10 mix-blend-screen animate-pulse z-20 pointer-events-none"></div>
        )}

        <div className="relative z-30 flex flex-col h-full p-3 transition-transform duration-500">
          <div className="flex justify-between items-start w-full drop-shadow-lg relative min-h-[30px]">
            <div className="font-sans font-black text-[1em] sm:text-[1.1em] tracking-wider text-white break-words text-left leading-tight mt-1 transition-colors duration-300 w-[70%]">
              {card.name}
            </div>
            {card.uniqueTrait && (
              <div className="absolute right-0 top-0 px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/50 rounded text-[0.45em] sm:text-[0.5em] text-emerald-400 font-bold mix-blend-normal drop-shadow-md z-40 whitespace-nowrap">
                {card.uniqueTrait.name}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 w-full">
            {!compact && (
              <div className="text-[0.7em] text-white/70 italic leading-snug line-clamp-2 break-words drop-shadow-md bg-black/40 p-1.5 rounded-sm border-l border-white/20 transition-all duration-300 group-hover:bg-black/60 group-hover:text-white">
                "{card.description}"
              </div>
            )}
            {!compact && !hideSkills && (
              <div className="flex flex-wrap gap-1 w-full">
                {card.unlockedSkills.map((s, i) => (
                  <div key={i} className="flex items-center bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border-l-2 border-white/50 transition-all duration-300 group-hover:bg-white/20">
                    <span className="text-[0.65em] font-bold text-white tracking-widest">{s}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-end gap-2 w-full mt-1">
              {!compact && (
                <div className="flex-1 grid grid-cols-4 gap-1 bg-black/60 backdrop-blur-md border border-white/20 p-1.5 rounded-sm transition-all duration-300 group-hover:bg-black/80">
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">ATK</span>
                    <span className="text-[0.7em] font-bold text-white">{card.stats.atk}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">DEF</span>
                    <span className="text-[0.7em] font-bold text-white">{card.stats.def}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">SPD</span>
                    <span className="text-[0.7em] font-bold text-white">{card.stats.spd}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[0.55em] text-white/50 font-mono transition-colors duration-300 group-hover:text-white/80">CRT</span>
                    <span className="text-[0.7em] font-bold text-white">{card.stats.crit}</span>
                  </div>
                </div>
              )}

              {/* 레벨 배지: 기울어진 형태로 강화 단계를 강조 표현 */}
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

export default CardItem;
