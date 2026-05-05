// ShopView: 아이템 및 프레임 스킨 구매 화면
// 강화 보조 아이템, 슬롯 확장, 프레임 스킨을 판매하여 골드 소비 루프 형성

import React from 'react';
import { ArrowRight, ArrowUpCircle, Shield, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import { formatMoney } from '../utils/formatUtils';

const ShopView = () => {
  const {
    userData, isProcessing,
    setCurrentView,
    wrapClick, handleBuyItem
  } = useGame();

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto animate-fade-in relative z-10 min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/20">
        <h2 className="text-3xl font-mono font-light text-white tracking-[0.2em] uppercase">시스템 상점</h2>
        <button onClick={wrapClick(() => setCurrentView('lobby'))} className="text-white/50 hover:text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>

      {/* 소모 아이템 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30 hover:bg-white/[0.05]">
          <HUDCorner />
          <ArrowUpCircle size={36} className="text-emerald-400 mb-6" strokeWidth={1} />
          <h3 className="font-mono font-light text-xl text-white mb-2">강화 확률 부스트</h3>
          <p className="text-base font-sans text-white/50 mb-6 flex-1">다음 강화 시 성공 확률을 10% 증가시킵니다.</p>
          <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
            <span className="font-mono text-white/40 text-sm">보유: {userData?.items?.boost || 0}</span>
            <button onClick={wrapClick(() => handleBuyItem('boost', 10000, '확률 부스트'))} disabled={isProcessing} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black">10,000 G</button>
          </div>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30 hover:bg-white/[0.05]">
          <HUDCorner />
          <Shield size={36} className="text-blue-400 mb-6" strokeWidth={1} />
          <h3 className="font-mono font-light text-xl text-white mb-2">하락/파괴 보호권</h3>
          <p className="text-base font-sans text-white/50 mb-6 flex-1">강화 실패 시 등급 하락 및 파괴를 1회 막아줍니다.</p>
          <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
            <span className="font-mono text-white/40 text-sm">보유: {userData?.items?.protect || 0}</span>
            <button onClick={wrapClick(() => handleBuyItem('protect', 50000, '하락/파괴 보호권'))} disabled={isProcessing} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black">50,000 G</button>
          </div>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative flex flex-col transition-all hover:border-white/30 hover:bg-white/[0.05]">
          <HUDCorner />
          <Plus size={36} className="text-amber-400 mb-6" strokeWidth={1} />
          <h3 className="font-mono font-light text-xl text-white mb-2">카드 슬롯 확장</h3>
          <p className="text-base font-sans text-white/50 mb-6 flex-1">보유 가능한 카드의 최대 개수를 1칸 늘립니다.</p>
          <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
            <span className="font-mono text-white/40 text-sm">현재: {userData?.maxSlots || 3} / 10</span>
            <button onClick={wrapClick(() => handleBuyItem('slot', 20000, '카드 슬롯 확장'))} disabled={isProcessing || (userData?.maxSlots >= 10)} className="bg-white/10 text-white font-mono text-xs tracking-widest px-4 py-2 hover:bg-white hover:text-black disabled:opacity-30">20,000 G</button>
          </div>
        </div>
      </div>

      {/* 프레임 스킨 섹션 */}
      <h3 className="text-xl font-mono font-light text-white tracking-widest mb-6 uppercase border-b border-white/10 pb-2">프레임 스킨 (상세 정보에서 장착)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { id: 'frame_rust', name: '녹슨 고철', desc: '세월의 흔적이 묻은 앤틱 프레임', price: 10000, color: 'text-[#a1662f]' },
          { id: 'frame_hologram', name: '홀로그램 스캔라인', desc: '화려한 스캔라인 오버레이', price: 50000, color: 'text-cyan-300' },
          { id: 'frame_blood', name: '블러드 펄스', desc: '핏빛 쉐도우 효과', price: 100000, color: 'text-red-500' },
          { id: 'frame_obsidian', name: '옵시디언 엣지', desc: '고급스러운 다크 엣지 음영', price: 300000, color: 'text-gray-400' },
          { id: 'frame_gold', name: '골든 아우라', desc: '황금빛 프레임 & 글로우', price: 500000, color: 'text-yellow-400' },
          { id: 'frame_neon', name: '네온 사이버', desc: '시안/핑크 사이버펑크 네온', price: 1000000, color: 'text-pink-400' }
        ].map(f => (
          <div key={f.id} className="bg-white/[0.02] border border-white/10 p-5 flex items-center justify-between transition-colors hover:bg-white/[0.05]">
            <div>
              <div className={`${f.color} font-mono mb-1 text-sm font-bold`}>{f.name}</div>
              <div className="text-xs text-white/50">{f.desc}</div>
            </div>
            {userData?.frames?.includes(f.id)
              ? <button disabled className="px-4 py-2 bg-white/20 text-white/50 font-mono text-[10px] whitespace-nowrap">보유 중</button>
              : <button onClick={() => handleBuyItem(f.id, f.price, f.name)} className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black font-mono text-[10px] whitespace-nowrap">{formatMoney(f.price)} G</button>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopView;
