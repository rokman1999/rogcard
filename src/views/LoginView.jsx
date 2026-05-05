// LoginView: 앱 진입점 화면
// 닉네임+아이콘 선택 → Firebase 이메일 기반 간편 인증
// 배경 비디오로 게임 분위기 연출

import React from 'react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import { getIcon } from '../utils/formatUtils';
import { ICONS_KEYS } from '../constants/appConfig';

const LoginView = () => {
  const {
    loginNickname, setLoginNickname,
    loginPassword, setLoginPassword,
    selectedIconName, setSelectedIconName,
    isProcessing,
    handleLogin, wrapClick, handleHover
  } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 relative z-10 overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-100">
        <source src="https://res.cloudinary.com/dkotceims/video/upload/v1777616211/14904105-hd_1920_1080_30fps_i7kg6w.mp4" type="video/mp4" />
      </video>
      <div className="text-center mb-24 animate-fade-in flex flex-col items-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-black text-white font-logo tracking-[0.1em] drop-shadow-[0_0_20px_rgba(0,0,0,1)] hover:scale-105 transition-transform duration-700">ROG CARD</h1>
        <p className="font-mono text-base tracking-[0.4em] text-white/90 drop-shadow-[0_0_10px_rgba(0,0,0,1)] mt-10">직접 만든 카드를 강화하세요.</p>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6 z-10 animate-slide-up bg-black/60 backdrop-blur-2xl border border-white/20 p-8 relative transition-all duration-300 hover:border-white/40">
        <HUDCorner />
        <div>
          <label className="block font-mono text-sm text-white/50 mb-3 tracking-widest font-light">아바타 선택</label>
          <div className="flex justify-between border-b border-white/10 pb-4">
            {ICONS_KEYS.map(iconName => (
              <div
                key={iconName}
                onClick={wrapClick(() => setSelectedIconName(iconName))}
                onMouseEnter={handleHover}
                className={`p-2 cursor-pointer transition-all duration-300 ${selectedIconName === iconName ? 'text-white border-b border-white scale-110' : 'text-white/30 hover:text-white/70 hover:scale-105'}`}
              >
                {getIcon(iconName)}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-mono text-sm text-white/50 mb-2 tracking-widest font-light">닉네임</label>
          <input
            type="text" value={loginNickname}
            onChange={(e) => setLoginNickname(e.target.value.toUpperCase())}
            placeholder="닉네임 입력" maxLength={10}
            className="w-full p-3 bg-transparent border-b border-white/20 text-white font-sans text-lg focus:outline-none focus:border-white transition-all uppercase placeholder-white/20"
            required
          />
        </div>
        <div>
          <label className="block font-mono text-sm text-white/50 mb-2 tracking-widest font-light">비밀번호</label>
          <input
            type="password" value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="비밀번호 (4자리 이상)" minLength={4}
            className="w-full p-3 bg-transparent border-b border-white/20 text-white font-sans text-lg focus:outline-none focus:border-white transition-all placeholder-white/20"
            required
          />
        </div>
        <button
          type="submit" disabled={isProcessing} onMouseEnter={handleHover}
          className="w-full py-4 bg-white/10 text-white font-light font-mono text-sm hover:bg-white hover:text-black disabled:opacity-50 transition-all uppercase tracking-widest mt-4"
        >
          {isProcessing ? '초기화 중...' : '시스템 접속'}
        </button>
      </form>
    </div>
  );
};

export default LoginView;
