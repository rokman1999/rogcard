// GameContext: 앱 전체 상태와 핸들러의 단일 진실 공급원(Single Source of Truth)
// 모든 뷰 컴포넌트가 props 없이 useGame() 훅으로 상태와 핸들러에 접근할 수 있게 함.
// prop drilling 없이 깊은 컴포넌트 트리에서도 상태 공유가 가능한 것이 핵심 이유.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  auth, db,
  USERS_PATH, CARDS_PATH, MATCHES_PATH, GLOBAL_CHAT_PATH,
  collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc,
  arrayUnion, addDoc, query, where, getDocs,
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword
} from '../services/firebase';
import {
  STATS_BY_LEVEL, COST_BY_LEVEL, ENHANCEMENT_RULES, STARTING_GOLD
} from '../constants/gameData';
import { getRandomTrait, getUnlockedSkills, getSellPrice } from '../utils/cardUtils';
import { formatMoney } from '../utils/formatUtils';
import { simulateBattleLog } from '../utils/battleEngine';
import { sfx } from '../sounds/sfx';

// Context 객체 생성 - 초기값은 undefined (useGame()에서 Provider 밖 사용 감지용)
const GameContext = createContext(undefined);

// ============================================================
// GameProvider: 모든 게임 상태, 핸들러, 사이드이펙트를 보유하는 컴포넌트
// App.jsx를 이것으로 감싸면 앱 어디서든 useGame()으로 접근 가능
// ============================================================
export function GameProvider({ children }) {

  // --- 유저/카드 데이터 상태 ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCards, setAllCards] = useState([]);

  // --- 화면 라우팅 상태 ---
  const [currentView, setCurrentView] = useState('login');
  const [selectedCard, setSelectedCard] = useState(null);

  // --- 공통 UI 상태 ---
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rankingTab, setRankingTab] = useState('win');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previewCard, setPreviewCard] = useState(null);
  const [selectedSkillDesc, setSelectedSkillDesc] = useState(null);

  // BGM ref: 오디오 엘리먼트를 AppContent의 <audio>와 공유하기 위해 context에서 관리
  const bgmRef = useRef(null);

  // --- 강화 관련 상태 ---
  const [useBoost, setUseBoost] = useState(false);
  const [useProtect, setUseProtect] = useState(false);
  const [enhanceVisualState, setEnhanceVisualState] = useState('idle');

  // --- 카드 생성 이미지 크롭 상태 ---
  const [cropImage, setCropImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // imgRef: 캔버스 드로잉 시 자연 크기 접근을 위해 context에서 관리
  const imgRef = useRef(null);

  // --- 로그인 폼 상태 ---
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('User');

  // --- PvP 관련 상태 ---
  const [pvpRoomId, setPvpRoomId] = useState(null);
  const [pvpRoomData, setPvpRoomData] = useState(null);
  const [pvpRoomName, setPvpRoomName] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);

  // --- 채팅 상태 ---
  const [chatInput, setChatInput] = useState('');
  const [globalChats, setGlobalChats] = useState([]);
  const [globalChatInput, setGlobalChatInput] = useState('');

  // --- 전투 상태 ---
  const [battleReward, setBattleReward] = useState(0);
  const [battleBet, setBattleBet] = useState(1000);
  const [aiOpponent, setAiOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleStep, setBattleStep] = useState(0);
  const [liveState, setLiveState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleType, setBattleType] = useState('AI');

  // ============================================================
  // useEffect 1: PWA 뷰포트 및 매니페스트 설정 (앱 최초 마운트 시 1회)
  // 모바일에서 PWA처럼 동작하도록 메타 태그를 동적으로 주입하는 이유:
  // index.html을 수정하지 않고 앱 레이어에서 제어하여 이식성 향상
  // ============================================================
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

    const manifestContent = {
      name: "ROG CARD ARENA",
      short_name: "ROG CARD",
      start_url: ".",
      display: "standalone",
      background_color: "#050505",
      theme_color: "#050505",
      icons: [{ src: "https://api.dicebear.com/7.x/bottts/svg?seed=rogcard&backgroundColor=0a0a0a", sizes: "192x192", type: "image/svg+xml" }]
    };
    const blob = new Blob([JSON.stringify(manifestContent)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);

    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestURL;

    return () => URL.revokeObjectURL(manifestURL);
  }, []);

  // ============================================================
  // useEffect 2: soundEnabled 변경 시 BGM 재생/정지
  // soundEnabled가 바뀔 때만 실행하여 불필요한 오디오 조작 방지
  // ============================================================
  useEffect(() => {
    if (bgmRef.current) {
      if (soundEnabled) bgmRef.current.play().catch(() => {});
      else bgmRef.current.pause();
    }
  }, [soundEnabled]);

  // ============================================================
  // useEffect 3: Firebase Auth 상태 리스너
  // 앱 전체에서 단 한 번만 구독해야 중복 리스너 방지
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, USERS_PATH, u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          // 임시 닉네임(USR_, Player_) 보유 시 다시 로그인 화면으로 - 닉네임 미설정 상태
          if (data.nickname.startsWith('USR_') || data.nickname.startsWith('Player_')) setCurrentView('login');
          else { setUserData(data); setCurrentView('lobby'); }
        } else { setCurrentView('login'); }
      } else { setCurrentView('login'); }
    });
    return () => unsubscribe();
  }, []);

  // ============================================================
  // useEffect 4: Firestore 실시간 구독 (user 변경 시 재구독)
  // user가 바뀔 때마다 이전 구독을 정리하고 새로 구독해야 데이터 누수 방지
  // ============================================================
  useEffect(() => {
    if (!user) return;
    const userUnsub = onSnapshot(doc(db, USERS_PATH, user.uid), (docSnap) => {
      if (docSnap.exists()) setUserData(docSnap.data());
    });
    const cardsUnsub = onSnapshot(collection(db, CARDS_PATH), (snapshot) => {
      const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllCards(cards);
      setMyCards(cards.filter(c => c.ownerId === user.uid).sort((a, b) => b.level - a.level));
    });
    const usersUnsub = onSnapshot(collection(db, USERS_PATH), (snapshot) => {
      setAllUsers(snapshot.docs.map(d => d.data()));
    });
    const globalChatUnsub = onSnapshot(collection(db, GLOBAL_CHAT_PATH), (snapshot) => {
      let chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGlobalChats(chats.sort((a, b) => a.timestamp - b.timestamp).slice(-50));
    });
    const matchesUnsub = onSnapshot(collection(db, MATCHES_PATH), (snapshot) => {
      const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveRooms(matches.filter(m => m.status === 'waiting').sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => { userUnsub(); cardsUnsub(); usersUnsub(); globalChatUnsub(); matchesUnsub(); };
  }, [user]);

  // ============================================================
  // useEffect 5: PvP 방 실시간 구독 (pvpRoomId 변경 시)
  // 방 상태가 'battling'으로 바뀌는 순간 자동으로 전투 화면으로 전환
  // ============================================================
  useEffect(() => {
    if (!pvpRoomId) { setPvpRoomData(null); return; }
    const unsub = onSnapshot(doc(db, MATCHES_PATH, pvpRoomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPvpRoomData(data);
        if (data.status === 'battling' && currentView === 'pvp_room') {
          setBattleLog(data.battleLog);
          setLiveState({
            p1Hp: data.hostCard.stats.hp, p2Hp: data.guestCard.stats.hp,
            p1Max: data.hostCard.stats.hp, p2Max: data.guestCard.stats.hp,
            currentAction: null
          });
          setBattleStep(0); setBattleResult(null); setCurrentView('battle_pvp_play');
        }
      } else {
        showToast("방이 파괴되었습니다.", "error");
        setPvpRoomId(null); setCurrentView('lobby');
      }
    });
    return () => unsub();
  }, [pvpRoomId, currentView]);

  // ============================================================
  // useEffect 6: 화면 전환 시 일부 상태 초기화
  // 다른 화면으로 이동하면 이전 화면의 임시 상태를 정리하여 UI 오염 방지
  // ============================================================
  useEffect(() => {
    if (currentView !== 'enhance') { setUseBoost(false); setUseProtect(false); }
    if (currentView !== 'card_details') { setSelectedSkillDesc(null); }
  }, [currentView]);

  // ============================================================
  // useEffect 7: 카드 생성 모달 닫힐 때 크롭 상태 초기화
  // 다음에 모달을 열었을 때 이전 이미지가 남아있지 않도록 정리
  // ============================================================
  useEffect(() => {
    if (!showCreateModal) {
      setCropImage(null); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 });
    }
  }, [showCreateModal]);

  // ============================================================
  // useEffect 8: 전투 애니메이션 스텝 루프
  // 전투 로그를 순차적으로 재생하여 카드 전투 애니메이션을 구현
  // ============================================================
  useEffect(() => {
    if ((currentView === 'battle' || currentView === 'battle_pvp_play') && battleLog.length > 0 && battleStep < battleLog.length) {
      const stepData = battleLog[battleStep];
      let delay = 900;
      if (stepData.type === 'start') delay = 1500;
      else if (stepData.type === 'critical') delay = 1400;
      else if (stepData.type === 'skill') delay = 1200;
      else if (stepData.type === 'dodge' || stepData.type === 'attack') delay = 800;
      else if (stepData.type === 'end') delay = 1000;

      setLiveState(prev => ({ ...prev, currentAction: stepData }));

      // 타격 유형별 효과음 재생
      if (stepData.type === 'critical') playSfx('crit');
      else if (stepData.type === 'skill') playSfx('skill');
      else if (stepData.type === 'dodge') playSfx('dodge');
      else if (stepData.type === 'attack') playSfx('hit');

      // 체력바 감소를 타격 효과 뒤로 딜레이 - 시각적 임팩트 순서를 맞추기 위함
      const hpDelay = ['attack', 'critical', 'skill', 'revive'].includes(stepData.type) ? 300 : 0;
      const hpTimer = setTimeout(() => {
        setLiveState(prev => ({ ...prev, p1Hp: stepData.state.p1Hp, p2Hp: stepData.state.p2Hp }));
      }, hpDelay);

      const nextTimer = setTimeout(() => {
        if (stepData.type === 'end') {
          // PvP에서 게스트는 p2가 내 카드 - 승패 판정 반전 필요
          const isHost = battleType !== 'PvP' || pvpRoomData?.host?.uid === user?.uid;
          const amIWinner = stepData.winner === (isHost ? 'p1' : 'p2');
          playSfx(amIWinner ? 'success' : 'error');
          handleBattleEnd(amIWinner);
        } else {
          setBattleStep(s => s + 1);
        }
      }, delay);

      return () => { clearTimeout(hpTimer); clearTimeout(nextTimer); };
    }
  }, [currentView, battleStep, battleLog, battleType, pvpRoomData, user]);

  // ============================================================
  // 핸들러 함수들
  // ============================================================

  // soundEnabled 상태를 체크하여 sfx 싱글턴에 위임
  const playSfx = (type, param) => {
    if (soundEnabled && sfx[type]) sfx[type](param);
  };

  const showToast = (msg, type = 'info') => setToast({ message: msg, type });

  // 모든 버튼 클릭에 사용하는 래퍼: AudioContext 초기화 + 클릭음 + BGM 시작
  // 브라우저 정책상 AudioContext는 사용자 인터랙션 이후에만 활성화 가능하기 때문
  const wrapClick = (fn) => (e) => {
    sfx.init();
    playSfx('click');
    if (soundEnabled && bgmRef.current && bgmRef.current.paused) {
      bgmRef.current.volume = 0.2;
      bgmRef.current.play().catch(() => {});
    }
    if (fn) fn(e);
  };

  const handleHover = () => playSfx('hover');

  // 로그인/회원가입 통합 핸들러
  // 닉네임 기반으로 이메일을 생성하여 Firebase Auth를 사용 (이메일 없는 간편 로그인)
  const handleLogin = async (e) => {
    e.preventDefault();
    sfx.init(); playSfx('click');
    if (!loginNickname.trim() || !loginPassword.trim()) { showToast("닉네임과 비밀번호를 입력하세요", "warning"); return; }
    if (loginPassword.length < 4) { showToast("비밀번호는 4자리 이상이어야 합니다", "warning"); return; }
    setIsProcessing(true);
    try {
      const dummyEmail = `${loginNickname.toLowerCase()}@rogcard.app`;
      const firebasePassword = loginPassword + "_ROG"; // Firebase 6자리 제한 우회용 패딩
      let currentUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, dummyEmail, firebasePassword);
        currentUser = cred.user;
      } catch (err) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, dummyEmail, firebasePassword);
          currentUser = cred.user;
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') showToast("비밀번호가 일치하지 않습니다.", "error");
          else showToast("로그인 처리 중 오류가 발생했습니다.", "error");
          playSfx('error'); setIsProcessing(false); return;
        }
      }

      const userRef = doc(db, USERS_PATH, currentUser.uid);
      const snap = await getDoc(userRef);
      const config = { nickname: loginNickname.trim(), icon: selectedIconName };

      if (snap.exists()) {
        await updateDoc(userRef, config);
        setUserData({ ...snap.data(), ...config });
      } else {
        // 같은 닉네임의 이전 계정 데이터가 있으면 카드까지 이전 UID로 마이그레이션
        const q = query(collection(db, USERS_PATH), where("nickname", "==", config.nickname));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const oldDoc = querySnapshot.docs[0];
          const oldUid = oldDoc.id;
          const cardsQ = query(collection(db, CARDS_PATH), where("ownerId", "==", oldUid));
          const cardsSnap = await getDocs(cardsQ);
          await Promise.all(cardsSnap.docs.map(cDoc => updateDoc(doc(db, CARDS_PATH, cDoc.id), { ownerId: currentUser.uid })));
          const migratedData = { ...oldDoc.data(), userId: currentUser.uid, ...config };
          await setDoc(userRef, migratedData);
          setUserData(migratedData);
        } else {
          const newUserData = {
            userId: currentUser.uid, nickname: config.nickname, icon: config.icon,
            money: STARTING_GOLD, wins: 0, losses: 0, aiWins: 0, maxSlots: 3,
            items: { boost: 0, protect: 0 }, frames: ['default'],
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        }
      }
      playSfx('login'); setCurrentView('lobby');
    } catch (err) {
      showToast("접근이 거부되었습니다.", "error"); playSfx('error');
    } finally { setIsProcessing(false); }
  };

  // 일일 출석 보상: 같은 날 중복 수령 방지 (lastAttendance 날짜 비교)
  const handleAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (userData.lastAttendance === today) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money + 10000, lastAttendance: today });
      playSfx('success'); showToast("일일 출석 보상: +10,000 GOLD", "success");
    } catch (err) { showToast("시스템 오류 발생", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCropImage(ev.target.result); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // 이미지 팬 범위를 카드 영역 내로 제한하는 함수
  // 카드 밖으로 이미지가 벗어나면 빈 공간이 생겨 카드가 깨져 보이기 때문
  const clampPan = (x, y, zoom) => {
    if (!imgRef.current || !imgLoaded) return { x, y };
    const S_0 = Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight);
    const finalScale = S_0 * zoom;
    const dW = imgRef.current.naturalWidth * finalScale;
    const dH = imgRef.current.naturalHeight * finalScale;
    const maxDx = Math.max(0, (dW - 200) / 2);
    const maxDy = Math.max(0, (dH - 310) / 2);
    return { x: Math.min(Math.max(x, -maxDx), maxDx), y: Math.min(Math.max(y, -maxDy), maxDy) };
  };

  const handleCropPointerDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: (e.touches ? e.touches[0].clientX : e.clientX) - cropPan.x,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - cropPan.y
    });
  };
  const handleCropPointerMove = (e) => {
    if (!isDragging) return;
    setCropPan(clampPan(
      (e.touches ? e.touches[0].clientX : e.clientX) - dragStart.x,
      (e.touches ? e.touches[0].clientY : e.clientY) - dragStart.y,
      cropZoom
    ));
  };
  const handleCropPointerUp = () => setIsDragging(false);
  const handleZoomChange = (e) => {
    setCropZoom(Number(e.target.value));
    setCropPan(prev => clampPan(prev.x, prev.y, Number(e.target.value)));
  };

  // 카드 생성: 크롭된 이미지를 canvas로 합성하여 base64로 저장
  // 서버 스토리지 없이 Firestore에 직접 이미지를 저장하는 오프라인 친화적 설계
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (myCards.length >= (userData?.maxSlots || 3)) { showToast("보유 슬롯이 가득 찼습니다.", "error"); playSfx('error'); return; }
    if (userData.money < 5000) { showToast("자금이 부족합니다.", "error"); playSfx('error'); return; }
    if (!cropImage || !imgLoaded || !imgRef.current) { showToast("이미지를 업로드해주세요.", "error"); playSfx('error'); return; }

    setIsProcessing(true);
    try {
      const targetW = 800; const targetH = 1240; const R = targetW / 200;
      const canvas = document.createElement('canvas'); canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      const S_0 = Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight);
      const finalScale = S_0 * cropZoom;
      const dW = imgRef.current.naturalWidth * finalScale;
      const dH = imgRef.current.naturalHeight * finalScale;

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(imgRef.current, (100 - dW / 2 + cropPan.x) * R, (155 - dH / 2 + cropPan.y) * R, dW * R, dH * R);

      const base64Image = canvas.toDataURL('image/jpeg', 0.95);
      const newCardRef = doc(collection(db, CARDS_PATH));

      await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money - 5000 });
      await setDoc(newCardRef, {
        cardId: newCardRef.id, ownerId: user.uid,
        name: e.target.cardName.value.toUpperCase(),
        description: e.target.cardDescription.value || "DATA CORRUPTED.",
        imageUrl: base64Image, level: 1, stats: STATS_BY_LEVEL[1],
        unlockedSkills: [], equippedFrame: null,
        uniqueTrait: getRandomTrait(), createdAt: new Date().toISOString()
      });

      playSfx('success'); showToast("카드 생성 완료", "success"); setShowCreateModal(false); setIsProcessing(false);
    } catch (err) { playSfx('error'); showToast("생성 실패", "error"); setIsProcessing(false); }
  };

  // 카드 판매: confirm 모달을 통해 실수 방지 후 Firestore에서 카드 삭제
  const handleSellCard = (card) => {
    const sellPrice = getSellPrice(card.level);
    setConfirmModal({
      title: "카드 판매",
      message: `[${card.name}] 카드를 판매하시겠습니까?\n\n판매 획득 골드: ${formatMoney(sellPrice)} GOLD\n(낮은 레벨의 카드는 판매 금액이 매우 적을 수 있습니다.)\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: "판매 확정", cancelText: "취소",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money + sellPrice });
          await deleteDoc(doc(db, CARDS_PATH, card.id));
          playSfx('success'); showToast(`판매 완료: +${formatMoney(sellPrice)} GOLD`, "success");
        } catch (e) { showToast("오류 발생", "error"); playSfx('error'); }
        setIsProcessing(false); setConfirmModal(null); setCurrentView('deck');
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleSendGlobalChat = async (e) => {
    e.preventDefault();
    if (!globalChatInput.trim()) return;
    try {
      await addDoc(collection(db, GLOBAL_CHAT_PATH), {
        sender: userData.nickname, text: globalChatInput.trim(), timestamp: Date.now()
      });
      setGlobalChatInput('');
    } catch (err) {}
  };

  const handleBuyItem = async (itemId, price, name) => {
    if (userData.money < price) { showToast("자금이 부족합니다", "error"); playSfx('error'); return; }
    setIsProcessing(true);
    try {
      const userRef = doc(db, USERS_PATH, user.uid);
      let updateData = { money: userData.money - price };
      if (itemId === 'boost') updateData.items = { ...(userData.items || {}), boost: ((userData.items || {}).boost || 0) + 1 };
      else if (itemId === 'protect') updateData.items = { ...(userData.items || {}), protect: ((userData.items || {}).protect || 0) + 1 };
      else if (itemId === 'slot') updateData.maxSlots = (userData.maxSlots || 3) + 1;
      else if (itemId.startsWith('frame_')) updateData.frames = arrayUnion(itemId);

      await updateDoc(userRef, updateData);
      playSfx('success'); showToast(`구매 완료: ${name}`, "success");
    } catch (e) { showToast("구매 실패", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleEquipCardFrame = async (frameId) => {
    if (!selectedCard) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, CARDS_PATH, selectedCard.id), { equippedFrame: frameId });
      setSelectedCard(prev => ({ ...prev, equippedFrame: frameId }));
      playSfx('equip'); showToast(frameId ? "프레임 장착 완료" : "프레임 해제 완료", "success");
    } catch (e) { showToast("적용 실패", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  // 카드 강화: 레벨에 따른 리스크/리워드 구조
  // 낮은 레벨은 빠르게(isFast), 높은 레벨은 긴장감 있는 애니메이션 후 결과 공개
  const handleEnhance = async (card) => {
    const nextLevel = card.level + 1;
    if (nextLevel > 20) return;
    const cost = COST_BY_LEVEL[nextLevel];
    if (userData.money < cost) { showToast("자금이 부족합니다", "error"); playSfx('error'); return; }

    setIsProcessing(true);
    const isFast = card.level < 8;
    setEnhanceVisualState(isFast ? 'charging_fast' : 'charging_tension'); playSfx('charge');

    setTimeout(async () => {
      try {
        const rule = { ...ENHANCEMENT_RULES[nextLevel] };
        let finalRate = Math.min(99, Math.max(1, rule.successRate + (card.stats.luck || 0) * 0.3));
        if (useBoost) finalRate = Math.min(99, finalRate + 10);
        if (useProtect) { rule.onFail = 'keep'; rule.destroyChance = 0; }

        const itemsUpdate = { ...userData.items };
        if (useBoost) itemsUpdate.boost = Math.max(0, itemsUpdate.boost - 1);
        if (useProtect) itemsUpdate.protect = Math.max(0, itemsUpdate.protect - 1);

        await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money - cost, items: itemsUpdate });
        setUseBoost(false); setUseProtect(false);

        if (Math.random() * 100 < finalRate) {
          const updatedCard = { ...card, level: nextLevel, stats: STATS_BY_LEVEL[nextLevel], unlockedSkills: getUnlockedSkills(nextLevel) };
          await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
          setSelectedCard(updatedCard);
          setEnhanceVisualState(`success_${nextLevel}`); playSfx('upgradeSuccess'); showToast(`강화 성공: LV.${nextLevel}`, "success");
          // 10강 이상 성공 시 전체 채팅에 알림 - 고강화 카드의 희귀성 강조 및 커뮤니티 공유
          if (nextLevel >= 10) await addDoc(collection(db, GLOBAL_CHAT_PATH), { sender: 'SYSTEM', text: `🎉 [${userData.nickname}]님이 [${card.name}] ${nextLevel}강 한계돌파에 성공했습니다!`, timestamp: Date.now() });
        } else {
          if (rule.onFail === 'keep') {
            setEnhanceVisualState('fail'); playSfx('error'); showToast("강화 실패 (등급 유지)", "warning");
          } else if (rule.onFail === 'down') {
            const newLvl = Math.max(1, card.level - rule.levelDownOnFail);
            const updatedCard = { ...card, level: newLvl, stats: STATS_BY_LEVEL[newLvl], unlockedSkills: getUnlockedSkills(newLvl) };
            await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
            setSelectedCard(updatedCard); setEnhanceVisualState('fail'); playSfx('upgradeFail'); showToast(`등급 하락: LV.${newLvl}`, "error");
          } else if (rule.onFail === 'mixed') {
            if (Math.random() * 100 < rule.destroyChance) {
              await deleteDoc(doc(db, CARDS_PATH, card.id));
              setEnhanceVisualState('destroyed'); playSfx('upgradeFail'); showToast("카드 파괴됨", "error"); setSelectedCard(null);
            } else {
              const newLvl = Math.max(1, card.level - rule.levelDownOnFail);
              const updatedCard = { ...card, level: newLvl, stats: STATS_BY_LEVEL[newLvl], unlockedSkills: getUnlockedSkills(newLvl) };
              await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
              setSelectedCard(updatedCard); setEnhanceVisualState('fail'); playSfx('upgradeFail'); showToast(`치명적 실패 (등급 하락): LV.${newLvl}`, "error");
            }
          }
        }
      } catch (e) { showToast("시스템 오류 발생", "error"); setEnhanceVisualState('idle'); }
      setIsProcessing(false);
      setTimeout(() => { setEnhanceVisualState((prev) => prev === 'destroyed' ? 'destroyed' : 'idle'); }, 800);
    }, isFast ? 100 : 2500);
  };

  // AI 대전 준비: 유저의 AI 승리 횟수에 비례하여 난이도를 자동 조정
  const startAIBattleSetup = (myCard) => {
    const aiLevel = Math.min(20, 1 + Math.floor((userData?.aiWins || 0) / 2));
    const aiNames = ["SYS.GHOST", "NEXUS.AI", "NULL.PTR", "GLITCH.SYS", "VOID.EXE"];
    setAiOpponent({
      id: 'ai_card', cardId: 'ai_card',
      name: aiNames[Math.floor(Math.random() * aiNames.length)],
      level: aiLevel, stats: STATS_BY_LEVEL[aiLevel],
      unlockedSkills: getUnlockedSkills(aiLevel),
      description: `네트워크를 떠도는 위협 수준 ${aiLevel}의 개체.`,
      imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}&backgroundColor=0a0a0a`
    });
    setSelectedCard(myCard); setBattleReward(aiLevel * 500 + 1000); setBattleType('AI'); setCurrentView('battle_ai_setup');
  };

  // AI 전투 실행: 시뮬레이션 결과를 상태에 저장하고 전투 화면으로 전환
  const executeAIBattle = async () => {
    const simLog = simulateBattleLog(selectedCard, aiOpponent);
    setBattleLog(simLog);
    setLiveState({ p1Hp: selectedCard.stats.hp, p2Hp: aiOpponent.stats.hp, p1Max: selectedCard.stats.hp, p2Max: aiOpponent.stats.hp, currentAction: null });
    setBattleStep(0); setBattleResult(null); setCurrentView('battle');
  };

  // 전투 종료: 결과에 따라 골드/승패 기록 업데이트
  const handleBattleEnd = async (isWin) => {
    setBattleResult(isWin ? 'win' : 'lose');
    if (!user || !userData) return;
    const userRef = doc(db, USERS_PATH, user.uid);
    try {
      if (battleType === 'AI') {
        if (isWin) await updateDoc(userRef, { money: (userData.money || 0) + battleReward, wins: (userData.wins || 0) + 1, aiWins: (userData.aiWins || 0) + 1 });
        else await updateDoc(userRef, { losses: (userData.losses || 0) + 1 });
      } else {
        if (isWin) await updateDoc(userRef, { money: (userData.money || 0) + battleBet * 2, wins: (userData.wins || 0) + 1 });
        else await updateDoc(userRef, { losses: (userData.losses || 0) + 1 });
      }
    } catch (e) { console.error(e); }
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleCreatePvPRoom = async (e) => {
    e.preventDefault();
    if (userData.money < battleBet) { showToast("자금이 부족합니다", "error"); return; }
    if (!pvpRoomName.trim()) { showToast("방 이름을 입력하세요", "warning"); return; }
    setIsProcessing(true);
    try {
      const code = generateRoomCode();
      await setDoc(doc(db, MATCHES_PATH, code), {
        id: code, roomName: pvpRoomName.trim(),
        host: { uid: user.uid, nickname: userData.nickname },
        hostCard: selectedCard, guest: null, guestCard: null,
        bet: battleBet, status: 'waiting', chat: [], battleLog: null, createdAt: Date.now()
      });
      setPvpRoomId(code); setBattleType('PvP'); setCurrentView('pvp_room');
    } catch (err) { showToast("방 생성 실패", "error"); }
    setIsProcessing(false);
  };

  const handleJoinPvPRoom = async (roomId) => {
    setIsProcessing(true);
    try {
      const matchRef = doc(db, MATCHES_PATH, roomId);
      const snap = await getDoc(matchRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.status !== 'waiting') showToast("이미 게임이 시작되었거나 가득 찬 방입니다.", "warning");
        else if (userData.money < data.bet) showToast(`입장 자금이 부족합니다. (필요: ${formatMoney(data.bet)} GOLD)`, "error");
        else {
          await updateDoc(matchRef, { guest: { uid: user.uid, nickname: userData.nickname }, guestCard: selectedCard, status: 'ready' });
          setBattleBet(data.bet); setPvpRoomId(roomId); setBattleType('PvP'); setCurrentView('pvp_room');
        }
      } else { showToast("존재하지 않는 방입니다.", "error"); }
    } catch (err) { showToast("입장 실패", "error"); }
    setIsProcessing(false);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !pvpRoomId) return;
    try {
      await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), {
        chat: arrayUnion({ sender: userData.nickname, text: chatInput.trim(), time: Date.now() })
      });
      setChatInput('');
    } catch (err) {}
  };

  const handleStartPvPBattle = async () => {
    if (!pvpRoomData || pvpRoomData.host.uid !== user.uid || pvpRoomData.status !== 'ready') return;
    await updateDoc(doc(db, USERS_PATH, pvpRoomData.host.uid), { money: userData.money - pvpRoomData.bet });
    await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), {
      status: 'battling',
      battleLog: simulateBattleLog(pvpRoomData.hostCard, pvpRoomData.guestCard)
    });
  };

  // 방 나가기: 호스트는 방 삭제, 게스트는 그냥 나가기
  // JSX 인라인에서 추출하여 재사용성 및 가독성 향상
  const handleLeaveRoom = async () => {
    const isHost = pvpRoomData?.host?.uid === user?.uid;
    if (isHost) { try { await deleteDoc(doc(db, MATCHES_PATH, pvpRoomId)); } catch (e) {} }
    setPvpRoomId(null);
    setCurrentView('lobby');
  };

  // ============================================================
  // context value: 모든 상태와 핸들러를 뷰 컴포넌트에 노출
  // ============================================================
  const contextValue = {
    // 상태
    user, userData, myCards, allUsers, allCards,
    currentView, setCurrentView,
    selectedCard, setSelectedCard,
    toast, setToast,
    isProcessing, setIsProcessing,
    confirmModal, setConfirmModal,
    showCreateModal, setShowCreateModal,
    rankingTab, setRankingTab,
    soundEnabled, setSoundEnabled,
    previewCard, setPreviewCard,
    selectedSkillDesc, setSelectedSkillDesc,
    bgmRef,
    useBoost, setUseBoost,
    useProtect, setUseProtect,
    enhanceVisualState, setEnhanceVisualState,
    cropImage, setCropImage,
    imgLoaded, setImgLoaded,
    cropZoom, setCropZoom,
    cropPan, setCropPan,
    isDragging, setIsDragging,
    dragStart, setDragStart,
    imgRef,
    loginNickname, setLoginNickname,
    loginPassword, setLoginPassword,
    selectedIconName, setSelectedIconName,
    pvpRoomId, setPvpRoomId,
    pvpRoomData, setPvpRoomData,
    pvpRoomName, setPvpRoomName,
    activeRooms,
    chatInput, setChatInput,
    globalChats,
    globalChatInput, setGlobalChatInput,
    battleReward, setBattleReward,
    battleBet, setBattleBet,
    aiOpponent, setAiOpponent,
    battleLog, setBattleLog,
    battleStep, setBattleStep,
    liveState, setLiveState,
    battleResult, setBattleResult,
    battleType, setBattleType,
    // 핸들러
    playSfx, showToast, wrapClick, handleHover,
    handleLogin, handleAttendance,
    handleFileChange, clampPan,
    handleCropPointerDown, handleCropPointerMove, handleCropPointerUp, handleZoomChange,
    handleCreateCard, handleSellCard,
    handleSendGlobalChat, handleBuyItem,
    handleEquipCardFrame, handleEnhance,
    startAIBattleSetup, executeAIBattle, handleBattleEnd,
    generateRoomCode, handleCreatePvPRoom, handleJoinPvPRoom,
    handleSendChat, handleStartPvPBattle, handleLeaveRoom,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// useGame 훅: Provider 밖에서 사용하면 즉시 오류 발생 (개발 시 실수 방지)
export function useGame() {
  const ctx = useContext(GameContext);
  if (ctx === undefined) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
