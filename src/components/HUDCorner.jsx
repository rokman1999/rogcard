// HUDCorner: 카드/패널의 4모서리에 배치하는 게임 UI 장식 요소
// 여러 화면에서 반복 사용되므로 컴포넌트로 추출하여 일관성 유지

import React from 'react';

const HUDCorner = () => (
  <>
    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/40 pointer-events-none z-10 transform -translate-x-2 -translate-y-2 transition-all duration-500"></div>
    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/40 pointer-events-none z-10 transform translate-x-2 -translate-y-2 transition-all duration-500"></div>
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/40 pointer-events-none z-10 transform -translate-x-2 translate-y-2 transition-all duration-500"></div>
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/40 pointer-events-none z-10 transform translate-x-2 translate-y-2 transition-all duration-500"></div>
  </>
);

export default HUDCorner;
