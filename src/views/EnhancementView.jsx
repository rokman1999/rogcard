// EnhancementView: 카드 강화 화면
// 강화 단계별로 다른 시각 효과(charging_fast, charging_tension, success, fail, destroyed)
// 강화 아이템(부스트, 보호권)을 체크박스로 사용 여부 선택

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import HUDCorner from '../components/HUDCorner';
import CardItem from '../components/CardItem';
import { ENHANCEMENT_RULES, COST_BY_LEVEL } from '../constants/gameData';
import { formatMoney } from '../utils/formatUtils';

const EnhancementView = () => {
  const {
    userData, selectedCard, isProcessing,
    enhanceVisualState,
    useBoost, setUseBoost,
    useProtect, setUseProtect,
    setCurrentView,
    wrapClick,
    handleEnhance
  } = useGame();

  if (!selectedCard) return null;

  const isMax = selectedCard.level >= 30;
  const nextRule = !isMax ? ENHANCEMENT_RULES[selectedCard.level + 1] : null;
  const cost = !isMax ? COST_BY_LEVEL[selectedCard.level + 1] : 0;

  // 강화 상태에 따른 카드 시각 효과 클래스 결정
  let effectClass = "";
  if (enhanceVisualState === 'charging_fast')
    effectClass = "animate-shake pointer-events-none brightness-125 scale-[1.02] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]";
  else if (enhanceVisualState === 'charging_tension')
    effectClass = "animate-tension-shake pointer-events-none brightness-150 saturate-150 scale-[1.05] drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]";
  else if (enhanceVisualState.startsWith('success')) {
    const lvl = parseInt(enhanceVisualState.split('_')[1]);
    effectClass = lvl >= 15
      ? "animate-flash-bang drop-shadow-[0_0_50px_rgba(0,255,255,1)] scale-110"
      : lvl >= 10
        ? "animate-flash-bang drop-shadow-[0_0_30px_rgba(255,255,0,0.8)] scale-[1.05]"
        : "animate-flash-bang drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]";
  } else if (enhanceVisualState === 'fail')
    effectClass = "animate-shake grayscale brightness-50";
  else if (enhanceVisualState === 'destroyed')
    effectClass = "animate-shatter opacity-0";

  return (
    <div className="min-h-[85vh] flex flex-col items-center py-10 px-4 animate-fade-in relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
      {/* 8강 이상 성공 시 화면 전체 플래시 효과 */}
      {enhanceVisualState.startsWith('success') && parseInt(enhanceVisualState.split('_')[1]) >= 8 && (
        <div className="absolute inset-0 bg-white/20 animate-flash-white pointer-events-none z-0"></div>
      )}
      <div className="w-full flex justify-start mb-8">
        <button onClick={wrapClick(() => setCurrentView('deck'))} className="text-white/40 hover:text-white flex items-center gap-2 font-mono text-sm uppercase">
          <ArrowRight className="rotate-180" size={14} /> 뒤로 가기
        </button>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full">
        {/* 좌측: 현재 스탯 패널 */}
        <div className="w-full lg:w-1/3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative order-2 lg:order-1">
          <HUDCorner />
          <h4 className="font-mono font-light text-base text-white/50 mb-6 border-b border-white/10 pb-3 uppercase">카드 능력치</h4>
          <div className="space-y-4 font-mono text-base tracking-widest font-light">
            <div className="flex justify-between"><span>HP</span><span className="text-white font-bold">{selectedCard.stats.hp}</span></div>
            <div className="flex justify-between"><span>ATK</span><span className="text-white font-bold">{selectedCard.stats.atk}</span></div>
            <div className="flex justify-between"><span>DEF</span><span className="text-white font-bold">{selectedCard.stats.def}%</span></div>
            <div className="flex justify-between"><span>SPD</span><span className="text-white font-bold">{selectedCard.stats.spd}</span></div>
            <div className="flex justify-between"><span>CRT</span><span className="text-white font-bold">{selectedCard.stats.crit}%</span></div>
            <div className="flex justify-between border-t border-white/10 pt-4">
              <span className="text-white/60">행운 보너스</span>
              <span className="text-emerald-400 font-bold">+{(selectedCard.stats.luck * 0.3).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 중앙: 카드 (강화 효과 애니메이션 적용) */}
        <div className="w-64 md:w-80 lg:w-[360px] order-1 lg:order-2 flex flex-col items-center relative">
          <div className={`transition-all duration-300 w-full ${effectClass}`}>
            {enhanceVisualState !== 'destroyed' && <CardItem card={selectedCard} className="pointer-events-none" />}
          </div>
        </div>

        {/* 우측: 강화 조작 패널 */}
        <div className="w-full lg:w-1/3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 relative order-3 flex flex-col justify-center min-h-[300px]">
          <HUDCorner />
          {isMax ? (
            <div className="text-center text-white font-mono font-light text-2xl tracking-[0.2em] uppercase">최대 성능 도달</div>
          ) : (
            <>
              <div className="text-center mb-6 flex items-center justify-center gap-6 font-mono tracking-widest">
                <span className="text-white/30 text-xl font-light">LV.{selectedCard.level}</span>
                <ArrowRight className="text-white/20" size={20} />
                <span className="text-3xl font-bold text-white drop-shadow-md">LV.{selectedCard.level + 1}</span>
              </div>
              {/* 강화 아이템 사용 체크박스 */}
              <div className="w-full mb-6 font-mono text-xs tracking-widest">
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={useBoost} onChange={() => setUseBoost(!useBoost)} disabled={!(userData?.items?.boost > 0)} className="accent-white cursor-pointer" />
                  <span className={userData?.items?.boost > 0 ? "text-white" : "text-white/30"}>부스트 사용 (보유: {userData?.items?.boost || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={useProtect} onChange={() => setUseProtect(!useProtect)} disabled={!(userData?.items?.protect > 0) || nextRule.onFail === 'keep'} className="accent-white cursor-pointer" />
                  <span className={userData?.items?.protect > 0 && nextRule.onFail !== 'keep' ? "text-white" : "text-white/30"}>보호권 사용 (보유: {userData?.items?.protect || 0})</span>
                </div>
              </div>
              {/* 성공 확률 표시 */}
              <div className="w-full mb-8 font-mono text-sm tracking-widest font-light">
                <div className="flex justify-between mb-4 text-white/50"><span>기본 확률</span><span>{nextRule.successRate}%</span></div>
                <div className="flex justify-between text-white border-t border-white/10 pt-4">
                  <span>현재 확률</span>
                  <span className={useBoost ? "text-emerald-400 font-bold" : ""}>
                    {Math.min(99, (nextRule.successRate + selectedCard.stats.luck * 0.3 + (useBoost ? 10 : 0))).toFixed(1)}%
                  </span>
                </div>
              </div>
              {/* 실패 시 결과 안내 */}
              <div className="w-full mb-10 font-mono text-xs tracking-widest p-4 border border-white/5 bg-black/20">
                <span className="text-white/40 block mb-3 uppercase">실패 시:</span>
                {(nextRule.onFail === 'keep' || useProtect) && (
                  <span className="text-white/80">안전 (등급 유지) {useProtect && <span className="text-emerald-400 font-bold">[보호됨]</span>}</span>
                )}
                {(nextRule.onFail === 'down' && !useProtect) && (
                  <span className="text-white/80">등급 하락 -{nextRule.levelDownOnFail}</span>
                )}
                {(nextRule.onFail === 'mixed' && !useProtect) && (
                  <div className="space-y-2">
                    <span className="text-white/80 block">등급 하락 -{nextRule.levelDownOnFail} ({100 - nextRule.destroyChance}%)</span>
                    <span className="text-red-500 font-bold block animate-pulse">카드 영구 파괴 ({nextRule.destroyChance}%)</span>
                  </div>
                )}
              </div>
              <button
                onClick={wrapClick(() => handleEnhance(selectedCard))}
                disabled={isProcessing || enhanceVisualState !== 'idle'}
                className="w-full py-4 bg-white/10 border border-white/20 text-white font-mono text-sm uppercase hover:bg-white hover:text-black disabled:opacity-30"
              >
                카드 강화 [ -{formatMoney(cost)} GOLD ]
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancementView;
