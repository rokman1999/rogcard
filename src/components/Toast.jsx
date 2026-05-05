// Toast: 화면 우하단에 잠깐 표시되는 알림 메시지 컴포넌트
// 3초 후 자동 사라짐 - 사용자의 액션 결과를 비침습적으로 전달하기 위함

import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  // 3초 뒤 자동 닫힘 - 사용자가 알림을 놓치지 않도록 충분한 시간 부여
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
    <div className={`fixed bottom-8 right-8 px-6 py-4 border bg-black/60 backdrop-blur-3xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up font-mono text-base tracking-wider ${bgColors[type]}`}>
      {type === 'success' && <div className="w-2 h-2 bg-emerald-400"></div>}
      {type === 'error' && <div className="w-2 h-2 bg-red-500"></div>}
      {type === 'warning' && <div className="w-2 h-2 bg-amber-500"></div>}
      {type === 'info' && <div className="w-2 h-2 bg-white/50"></div>}
      <span className="font-light">{message}</span>
    </div>
  );
};

export default Toast;
