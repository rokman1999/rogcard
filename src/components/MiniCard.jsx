// MiniCard: 랭킹/전투 준비 화면 등 공간이 좁을 때 사용하는 카드 미니어처
// CardItem과 같은 비주얼 언어를 쓰되 정보량을 최소화

import React from 'react';
import FrameOverlay from './FrameOverlay';
import { getFoilClass, getTierTextColor } from '../utils/cardUtils';

const MiniCard = ({ card, onClick }) => {
  if (!card) return null;

  const foilBg = getFoilClass(card.level);

  return (
    <div
      onClick={onClick}
      className={`relative w-24 aspect-[2/3.1] rounded-lg ${foilBg} overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-500 hover:scale-110 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="w-full h-full bg-black relative rounded-md overflow-hidden border border-black/50">
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover opacity-90" />
        <FrameOverlay frame={card.equippedFrame} />
        {/* 레벨만 표시하여 카드 식별 가능하게 최소 정보 제공 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 text-center border-t border-white/20 z-30">
          <span className={`text-xs font-mono font-black ${getTierTextColor(card.level)}`}>LV.{card.level}</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCard;
