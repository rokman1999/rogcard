// 앱 전역 설정값. gameData.js와 분리한 이유:
// 게임 밸런스 수치(스탯, 비용)와 달리 앱 구조에 종속된 설정이기 때문.
// ex) ICONS_KEYS는 lucide-react 아이콘 선택 UI에만 관련됨.

export const CREATE_CARD_COST = 5000;
export const STARTING_GOLD = 1000000;

// 아바타 선택에서 사용할 lucide-react 아이콘 이름 목록
// 이 배열 순서가 곧 UI의 표시 순서
export const ICONS_KEYS = ['User', 'Skull', 'Ghost', 'Terminal', 'Cpu'];
