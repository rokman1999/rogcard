// FrameOverlay: 카드 위에 overlay로 렌더링되는 프레임 스킨 컴포넌트
// CardItem과 MiniCard 양쪽에서 사용되므로 별도 컴포넌트로 분리

import React from 'react';

const FrameOverlay = ({ frame }) => {
  if (!frame) return null;

  if (frame === 'frame_rust')
    return <div className="absolute inset-0 pointer-events-none z-[40] border-[4px] border-[#a0522d] shadow-[inset_0_0_40px_rgba(139,69,19,0.9)] opacity-90"></div>;

  if (frame === 'frame_gold')
    return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-yellow-400 shadow-[inset_0_0_50px_rgba(250,204,21,0.8)] animate-pulse"></div>;

  if (frame === 'frame_neon')
    return <div className="absolute inset-0 pointer-events-none z-[40] border-[2px] border-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,1),0_0_15px_rgba(236,72,153,1)] border-r-pink-500 border-b-pink-500"></div>;

  if (frame === 'frame_void')
    return <div className="absolute inset-0 pointer-events-none z-[40] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.95)_100%)] border-2 border-purple-900 shadow-[inset_0_0_80px_rgba(88,28,135,1)]"></div>;

  if (frame === 'frame_hologram')
    return (
      <>
        <div className="absolute inset-0 pointer-events-none z-[40] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.2)_3px,transparent_4px)] mix-blend-screen opacity-50"></div>
        <div className="absolute left-0 right-0 w-full h-[30%] pointer-events-none z-[41] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent mix-blend-screen" style={{ animation: 'scanline 2.5s linear infinite' }}></div>
      </>
    );

  if (frame === 'frame_blood')
    return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-red-600" style={{ animation: 'blood-pulse 1.5s ease-in-out infinite' }}></div>;

  if (frame === 'frame_obsidian')
    return <div className="absolute inset-0 pointer-events-none z-[40] border-[3px] border-gray-800 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.4)_25%,transparent_30%)]" style={{ backgroundSize: '200% 100%', animation: 'obsidian-shine 3s linear infinite', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9)' }}></div>;

  return null;
};

export default FrameOverlay;
