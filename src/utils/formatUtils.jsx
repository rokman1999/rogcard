// 공통 포매팅/UI 헬퍼 함수
// React JSX를 반환하는 함수도 여기 포함 - 단순 표현 변환이므로 utils에 적합

import React from 'react';
import { User, Skull, Ghost, Terminal, Cpu } from 'lucide-react';

// 숫자에 천 단위 쉼표 포맷 적용 (골드 표시에 사용)
export const formatMoney = (num) => new Intl.NumberFormat('en-US').format(num || 0);

// 아이콘 이름 문자열 → lucide-react JSX 컴포넌트 반환
// 아이콘을 문자열로 DB에 저장하고 런타임에 컴포넌트로 변환하기 위해 필요
export const getIcon = (name) => {
  const icons = { User, Skull, Ghost, Terminal, Cpu };
  const IconCmp = icons[name] || User;
  return <IconCmp size={20} />;
};
