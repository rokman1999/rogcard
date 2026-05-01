import React, { useEffect } from 'react';
import { User, Skull, Ghost, Terminal, Cpu } from 'lucide-react';

// 미래지향적 테두리 코너 장식
export const HUDCorner = () => (
  <>
    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/40 pointer-events-none z-10 transform -translate-x-2 -translate-y-2 transition-all duration-500"></div>
    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/40 pointer-events-none z-10 transform translate-x-2 -translate-y-2 transition-all duration-500"></div>
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/40 pointer-events-none z-10 transform -translate-x-2 translate-y-2 transition-all duration-500"></div>
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/40 pointer-events-none z-10 transform translate-x-2 translate-y-2 transition-all duration-500"></div>
  </>
);

// 알림 메시지 팝업 컴포넌트
export const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    info: 'border-white/30 text-white',
    success: 'border-emerald-500/70 text-emerald-400',
    error: 'border-red-500/70 text-red-400',
    warning: 'border-amber-500/70 text-amber-400'
  };

  return (
    <div className={`fixed bottom-8 right-8 px-6 py-4 border bg-black/60 backdrop-blur-3xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up font-mono text-sm tracking-wider ${bgColors[type]}`}>
      {type === 'success' && <div className="w-1.5 h-1.5 bg-emerald-400"></div>}
      {type === 'error' && <div className="w-1.5 h-1.5 bg-red-500"></div>}
      {type === 'warning' && <div className="w-1.5 h-1.5 bg-amber-500"></div>}
      {type === 'info' && <div className="w-1.5 h-1.5 bg-white/50"></div>}
      <span className="font-light">{message}</span>
    </div>
  );
};

export const formatMoney = (num) => new Intl.NumberFormat('en-US').format(num || 0);

// 유저 프로필 아바타 매핑
export const ICONS = {
  User: <User size={20} />,
  Skull: <Skull size={20} />,
  Ghost: <Ghost size={20} />,
  Terminal: <Terminal size={20} />,
  Cpu: <Cpu size={20} />
};
