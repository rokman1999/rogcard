// GameContext: 앱 전체 상태와 핸들러의 단일 진실 공급원(Single Source of Truth)
// 모든 뷰 컴포넌트가 props 없이 useGame() 훅으로 상태와 핸들러에 접근할 수 있게 함.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  auth, db,
  USERS_PATH, CARDS_PATH, MATCHES_PATH, GLOBAL_CHAT_PATH,
  collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc,
  arrayUnion, addDoc, query, where, getDocs, increment,
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword
} from '../services/firebase';
import {
  STATS_BY_LEVEL, COST_BY_LEVEL, ENHANCEMENT_RULES, STARTING_GOLD, CREATE_CARD_COST,
  acquireRandomSkillsForLevelUp, getUnlockedSkills
} from '../constants/gameData';
import { getRandomTrait } from '../constants/gameData';
import { getSellPrice } from '../constants/gameData';
import { formatMoney } from '../utils/formatUtils';
import { simulateBattleLog } from '../utils/battleEngine';
import { sfx } from '../sounds/sfx';

const GameContext = createContext(undefined);

export function GameProvider({ children }) {

  // --- 유저/카드 데이터 ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  // --- 화면 라우팅 ---
  const [currentView, setCurrentView] = useState('login');
  const [selectedCard, setSelectedCard] = useState(null);

  // --- 공통 UI ---
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rankingTab, setRankingTab] = useState('level');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previewCard, setPreviewCard] = useState(null);
  const [selectedSkillDesc, setSelectedSkillDesc] = useState(null);
  const [selectedAchDesc, setSelectedAchDesc] = useState(null);

  const bgmRef = useRef(null);

  // --- 강화 관련 ---
  const [useBoost, setUseBoost] = useState(false);
  const [useProtect, setUseProtect] = useState(false);
  const [enhanceVisualState, setEnhanceVisualState] = useState('idle');

  // --- 초월 관련 ---
  const [tCard1, setTCard1] = useState(null);
  const [tCard2, setTCard2] = useState(null);
  const [transcendState, setTranscendState] = useState('idle');

  // --- 이미지 크롭 ---
  const [cropImage, setCropImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  // --- 로그인 폼 ---
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('User');

  // --- 프로필 관련 ---
  const [viewingProfileUserId, setViewingProfileUserId] = useState(null);
  const [guestbookInput, setGuestbookInput] = useState('');
  const [isEditingProfileDesc, setIsEditingProfileDesc] = useState(false);
  const [editProfileDesc, setEditProfileDesc] = useState('');

  // --- 어드민 ---
  const [isEditingGold, setIsEditingGold] = useState(false);
  const [editGoldValue, setEditGoldValue] = useState('');

  // --- 충전 모달 ---
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeStep, setChargeStep] = useState(1);
  const [selectedChargePack, setSelectedChargePack] = useState(null);

  // --- PvP ---
  const [pvpRoomId, setPvpRoomId] = useState(null);
  const [pvpRoomData, setPvpRoomData] = useState(null);
  const [pvpRoomName, setPvpRoomName] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);

  // --- 채팅 ---
  const [chatInput, setChatInput] = useState('');
  const [globalChats, setGlobalChats] = useState([]);
  const [globalChatInput, setGlobalChatInput] = useState('');

  // --- 전투 ---
  const [battleReward, setBattleReward] = useState(0);
  const [battleBet, setBattleBet] = useState(1000);
  const [aiOpponent, setAiOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleStep, setBattleStep] = useState(0);
  const [liveState, setLiveState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleType, setBattleType] = useState('AI');

  // --- 거래소 ---
  const [sellPriceInput, setSellPriceInput] = useState('');
  const [marketTab, setMarketTab] = useState('all');
  const [marketSelectedCardId, setMarketSelectedCardId] = useState('');

  // ============================================================
  // useEffect 1: PWA 뷰포트 및 매니페스트 설정
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
      name: "ROG CARD ARENA", short_name: "ROG CARD", start_url: ".",
      display: "standalone", background_color: "#050505", theme_color: "#050505",
      icons: [{ src: "https://api.dicebear.com/7.x/bottts/svg?seed=rogcard&backgroundColor=0a0a0a", sizes: "192x192", type: "image/svg+xml" }]
    };
    const blob = new Blob([JSON.stringify(manifestContent)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) { manifestLink = document.createElement('link'); manifestLink.rel = 'manifest'; document.head.appendChild(manifestLink); }
    manifestLink.href = manifestURL;
    return () => URL.revokeObjectURL(manifestURL);
  }, []);

  // ============================================================
  // useEffect 2: BGM 제어
  // ============================================================
  useEffect(() => {
    if (bgmRef.current) {
      if (soundEnabled) bgmRef.current.play().catch(() => {});
      else bgmRef.current.pause();
    }
  }, [soundEnabled]);

  // ============================================================
  // useEffect 3: 온라인 핑 (lastActive 60초마다 갱신)
  // ============================================================
  useEffect(() => {
    if (!user) return;
    const ping = () => { updateDoc(doc(db, USERS_PATH, user.uid), { lastActive: Date.now() }).catch(() => {}); };
    ping();
    const interval = setInterval(ping, 60000);
    return () => clearInterval(interval);
  }, [user, currentView]);

  // ============================================================
  // useEffect 4: Firebase Auth 상태 리스너
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, USERS_PATH, u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.nickname.startsWith('USR_') || data.nickname.startsWith('Player_')) setCurrentView('login');
          else { setUserData(data); setCurrentView('lobby'); }
        } else { setCurrentView('login'); }
      } else { setCurrentView('login'); }
    });
    return () => unsubscribe();
  }, []);

  // ============================================================
  // useEffect 5: Firestore 실시간 구독
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
      // 카드 이미지 프리로드
      cards.forEach(card => {
        if (card.imageUrl) { const img = new Image(); img.src = card.imageUrl; }
      });
    });
    const usersUnsub = onSnapshot(collection(db, USERS_PATH), (snapshot) => {
      const usersData = snapshot.docs.map(d => d.data());
      setAllUsers(usersData);
      setOnlineCount(usersData.filter(u => Date.now() - (u.lastActive || 0) < 300000).length);
    });
    const globalChatUnsub = onSnapshot(collection(db, GLOBAL_CHAT_PATH), (snapshot) => {
      const chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = chats.sort((a, b) => {
        const tA = typeof a.timestamp === 'number' ? a.timestamp : Number(a.timestamp) || 0;
        const tB = typeof b.timestamp === 'number' ? b.timestamp : Number(b.timestamp) || 0;
        return tA - tB;
      });
      setGlobalChats(sorted.slice(-100));
    });
    const matchesUnsub = onSnapshot(collection(db, MATCHES_PATH), (snapshot) => {
      const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveRooms(matches.filter(m => m.status === 'waiting').sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => { userUnsub(); cardsUnsub(); usersUnsub(); globalChatUnsub(); matchesUnsub(); };
  }, [user]);

  // ============================================================
  // useEffect 6: PvP 방 실시간 구독
  // ============================================================
  useEffect(() => {
    if (!pvpRoomId) { setPvpRoomData(null); return; }
    const unsub = onSnapshot(doc(db, MATCHES_PATH, pvpRoomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPvpRoomData(data);
        if (data.status === 'battling' && currentView === 'pvp_room') {
          setBattleLog(data.battleLog);
          setLiveState({ p1Hp: data.hostCard.stats.hp, p2Hp: data.guestCard.stats.hp, p1Max: data.hostCard.stats.hp, p2Max: data.guestCard.stats.hp, currentAction: null });
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
  // useEffect 7: 화면 전환 시 상태 초기화
  // ============================================================
  useEffect(() => {
    if (currentView !== 'enhance') { setUseBoost(false); setUseProtect(false); }
    if (currentView !== 'card_details') { setSelectedSkillDesc(null); }
    if (currentView !== 'profile') { setSelectedAchDesc(null); }
    if (currentView !== 'transcend') { setTCard1(null); setTCard2(null); setTranscendState('idle'); }
  }, [currentView]);

  // ============================================================
  // useEffect 8: 카드 생성 모달 닫힐 때 크롭 상태 초기화
  // ============================================================
  useEffect(() => {
    if (!showCreateModal) {
      setCropImage(null); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 });
    }
  }, [showCreateModal]);

  // ============================================================
  // useEffect 9: 전투 애니메이션 스텝 루프
  // ============================================================
  useEffect(() => {
    if ((currentView === 'battle' || currentView === 'battle_pvp_play') && battleLog.length > 0 && battleStep < battleLog.length) {
      const stepData = battleLog[battleStep];
      let delay = 900;
      if (stepData.type === 'start') delay = 1500;
      else if (stepData.type === 'critical') delay = 1400;
      else if (stepData.type === 'skill') delay = 1200;
      else if (stepData.type === 'dodge' || stepData.type === 'attack') delay = 800;
      else if (stepData.type === 'heal') delay = 1000;
      else if (stepData.type === 'end') delay = 1000;

      setLiveState(prev => ({ ...prev, currentAction: stepData }));

      if (stepData.type === 'critical') playSfx('crit');
      else if (stepData.type === 'skill') playSfx('skill');
      else if (stepData.type === 'dodge') playSfx('dodge');
      else if (stepData.type === 'attack') playSfx('hit');
      else if (stepData.type === 'heal') playSfx('heal');

      const hpDelay = ['attack', 'critical', 'skill', 'revive', 'heal'].includes(stepData.type) ? 300 : 0;
      const hpTimer = setTimeout(() => {
        setLiveState(prev => ({ ...prev, p1Hp: stepData.state.p1Hp, p2Hp: stepData.state.p2Hp }));
      }, hpDelay);

      const nextTimer = setTimeout(() => {
        if (stepData.type === 'end') {
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

  const playSfx = (type, param) => {
    if (soundEnabled && sfx[type]) sfx[type](param);
  };

  const showToast = (msg, type = 'info') => setToast({ message: msg, type });

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

  const handleLogin = async (e) => {
    e.preventDefault();
    sfx.init(); playSfx('click');
    if (!loginNickname.trim() || !loginPassword.trim()) { showToast("닉네임과 비밀번호를 입력하세요", "warning"); return; }
    if (loginPassword.length < 4) { showToast("비밀번호는 4자리 이상이어야 합니다", "warning"); return; }
    setIsProcessing(true);
    try {
      const dummyEmail = `${loginNickname.toLowerCase()}@rogcard.app`;
      const firebasePassword = loginPassword + "_ROG";
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
            profileDesc: "자기소개가 아직 없습니다.", guestbook: [],
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

  const handleAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (userData.lastAttendance === today) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(10000), lastAttendance: today });
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
    e.target.value = '';
  };

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

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (myCards.length >= (userData?.maxSlots || 3)) { showToast("보유 슬롯이 가득 찼습니다.", "error"); playSfx('error'); return; }
    if (userData.money < CREATE_CARD_COST) { showToast("자금이 부족합니다.", "error"); playSfx('error'); return; }
    if (!cropImage || !imgRef.current) { showToast("이미지를 업로드해주세요.", "error"); playSfx('error'); return; }

    setIsProcessing(true);
    const cardNameValue = e.target.cardName.value.toUpperCase();
    const cardDescValue = e.target.cardDescription.value || "DATA CORRUPTED.";

    const img = new Image();
    img.onload = async () => {
      try {
        const targetW = 400; const targetH = 620; const R = targetW / 200;
        const canvas = document.createElement('canvas'); canvas.width = targetW; canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        const nW = img.naturalWidth || 1;
        const nH = img.naturalHeight || 1;
        const S_0 = Math.max(200 / nW, 310 / nH);
        const finalScale = S_0 * cropZoom;
        const dW = nW * finalScale; const dH = nH * finalScale;

        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, (100 - dW / 2 + cropPan.x) * R, (155 - dH / 2 + cropPan.y) * R, dW * R, dH * R);

        const base64Image = canvas.toDataURL('image/jpeg', 0.85);
        const newCardRef = doc(collection(db, CARDS_PATH));

        await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(-CREATE_CARD_COST) });
        await setDoc(newCardRef, {
          cardId: newCardRef.id, ownerId: user.uid,
          name: cardNameValue, description: cardDescValue,
          imageUrl: base64Image, level: 1, stats: STATS_BY_LEVEL[1],
          unlockedSkills: [], equippedFrame: null,
          uniqueTrait: getRandomTrait(), createdAt: new Date().toISOString()
        });

        playSfx('success'); showToast("카드 생성 완료", "success"); setShowCreateModal(false); setIsProcessing(false);
      } catch (err) {
        playSfx('error'); showToast("생성 실패", "error"); setIsProcessing(false); console.error(err);
      }
    };
    img.onerror = () => { playSfx('error'); showToast("이미지 로드 실패", "error"); setIsProcessing(false); };
    img.src = cropImage;
  };

  const handleSellCard = (card) => {
    const sellPrice = getSellPrice(card.level);
    setConfirmModal({
      title: "카드 판매",
      message: `[${card.name}] 카드를 시스템에 영구 판매하시겠습니까?\n\n판매 획득 골드: ${formatMoney(sellPrice)} GOLD\n(다른 유저에게 거래소에서 판매하려면 거래소 메뉴를 이용하세요.)\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: "판매 확정", cancelText: "취소",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(sellPrice) });
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
      updateQuestProgress('chat');
    } catch (err) {}
  };

  const handleBuyItem = async (itemId, price, name) => {
    if (userData.money < price) { showToast("자금이 부족합니다", "error"); playSfx('error'); return; }
    setIsProcessing(true);
    try {
      const userRef = doc(db, USERS_PATH, user.uid);
      let updateData = { money: increment(-price) };
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
        if (useBoost) itemsUpdate.boost = Math.max(0, (itemsUpdate.boost || 0) - 1);
        if (useProtect) itemsUpdate.protect = Math.max(0, (itemsUpdate.protect || 0) - 1);

        await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(-cost), items: itemsUpdate });
        setUseBoost(false); setUseProtect(false);
        updateQuestProgress('enhance');

        if (Math.random() * 100 < finalRate) {
          const updatedCard = { ...card, level: nextLevel, stats: STATS_BY_LEVEL[nextLevel], unlockedSkills: acquireRandomSkillsForLevelUp(card.unlockedSkills, nextLevel) };
          await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
          setSelectedCard(updatedCard);
          setEnhanceVisualState(`success_${nextLevel}`); playSfx('upgradeSuccess'); showToast(`강화 성공: LV.${nextLevel}`, "success");
          if (nextLevel >= 10) await addDoc(collection(db, GLOBAL_CHAT_PATH), { sender: 'SYSTEM', text: `🎉 [${userData.nickname}]님이 [${card.name}] ${nextLevel}강 한계돌파에 성공했습니다!`, timestamp: Date.now() });
        } else {
          if (rule.onFail === 'keep') {
            setEnhanceVisualState('fail'); playSfx('error'); showToast("강화 실패 (등급 유지)", "warning");
          } else if (rule.onFail === 'down') {
            const newLvl = Math.max(1, card.level - rule.levelDownOnFail);
            const updatedCard = { ...card, level: newLvl, stats: STATS_BY_LEVEL[newLvl] };
            await updateDoc(doc(db, CARDS_PATH, card.id), updatedCard);
            setSelectedCard(updatedCard); setEnhanceVisualState('fail'); playSfx('upgradeFail'); showToast(`등급 하락: LV.${newLvl}`, "error");
          } else if (rule.onFail === 'mixed') {
            if (Math.random() * 100 < rule.destroyChance) {
              await deleteDoc(doc(db, CARDS_PATH, card.id));
              setEnhanceVisualState('destroyed'); playSfx('upgradeFail'); showToast("카드 파괴됨", "error"); setSelectedCard(null);
            } else {
              const newLvl = Math.max(1, card.level - rule.levelDownOnFail);
              const updatedCard = { ...card, level: newLvl, stats: STATS_BY_LEVEL[newLvl] };
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

  const handleTranscend = async () => {
    if (!tCard1 || !tCard2 || tCard1.id === tCard2.id) { showToast("합성할 LV.20 카드 두 장을 선택해주세요.", "warning"); return; }
    if (userData.money < 5000000) { showToast("자금이 부족합니다. (5,000,000 G 필요)", "error"); return; }

    setIsProcessing(true);
    setTranscendState('merging');
    playSfx('charge');

    setTimeout(async () => {
      try {
        await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(-5000000) });

        const newStats = STATS_BY_LEVEL[21];
        let newSkills = [...tCard1.unlockedSkills];
        if (!newSkills.includes('초월의 힘')) newSkills.push('초월의 힘');

        await updateDoc(doc(db, CARDS_PATH, tCard1.id), { level: 21, stats: newStats, unlockedSkills: newSkills, equippedFrame: 'frame_transcend' });
        await deleteDoc(doc(db, CARDS_PATH, tCard2.id));

        setTranscendState('success');
        playSfx('upgradeSuccess');
        showToast("초월 합성 성공!", "success");
        await addDoc(collection(db, GLOBAL_CHAT_PATH), { sender: 'SYSTEM', text: `✨ [${userData.nickname}]님이 [${tCard1.name}] 초월에 성공하여 신의 영역에 도달했습니다! ✨`, timestamp: Date.now() });

        setTimeout(() => { setTranscendState('idle'); setTCard1(null); setTCard2(null); setCurrentView('deck'); }, 3000);
      } catch (e) {
        showToast("초월 합성 중 오류가 발생했습니다.", "error");
        setTranscendState('idle');
      }
      setIsProcessing(false);
    }, 3000);
  };

  const startAIBattleSetup = (myCard) => {
    // AI 레벨 너프: aiWins/4 기준 (기존 /2보다 상승폭 완화)
    const aiLevel = Math.min(20, 1 + Math.floor((userData?.aiWins || 0) / 4));
    const aiNames = ["SYS.GHOST", "NEXUS.AI", "NULL.PTR", "GLITCH.SYS", "VOID.EXE"];
    const baseStats = STATS_BY_LEVEL[aiLevel];
    // AI 전투력 너프
    const nerfedStats = {
      hp: Math.max(50, Math.floor(baseStats.hp * 0.6)),
      atk: Math.max(10, Math.floor(baseStats.atk * 0.5)),
      def: Math.max(0, Math.floor(baseStats.def * 0.4)),
      spd: Math.max(10, Math.floor(baseStats.spd * 0.6)),
      crit: Math.max(0, Math.floor(baseStats.crit * 0.5)),
      luck: 0
    };
    setAiOpponent({
      id: 'ai_card', cardId: 'ai_card',
      name: aiNames[Math.floor(Math.random() * aiNames.length)],
      level: aiLevel, stats: nerfedStats,
      unlockedSkills: getUnlockedSkills(aiLevel),
      description: `네트워크를 떠도는 위협 수준 ${aiLevel}의 개체. (너프됨)`,
      imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}&backgroundColor=0a0a0a`
    });
    setSelectedCard(myCard);
    setBattleReward(aiLevel * 2000 + 5000);
    setBattleType('AI');
    setCurrentView('battle_ai_setup');
  };

  const executeAIBattle = async () => {
    const simLog = simulateBattleLog(selectedCard, aiOpponent);
    setBattleLog(simLog);
    setLiveState({ p1Hp: selectedCard.stats.hp, p2Hp: aiOpponent.stats.hp, p1Max: selectedCard.stats.hp, p2Max: aiOpponent.stats.hp, currentAction: null });
    setBattleStep(0); setBattleResult(null); setCurrentView('battle');
  };

  const handleBattleEnd = async (isWin) => {
    setBattleResult(isWin ? 'win' : 'lose');
    if (!user || !userData) return;

    if (battleType === 'AI') {
      updateQuestProgress('ai');
      if (isWin) updateQuestProgress('win_ai');
    } else if (battleType === 'PvP') {
      updateQuestProgress('pvp');
    }

    const userRef = doc(db, USERS_PATH, user.uid);
    try {
      if (battleType === 'AI') {
        if (isWin) await updateDoc(userRef, { money: increment(battleReward), aiWins: increment(1) });
        else await updateDoc(userRef, { losses: increment(1) });
      } else {
        if (isWin) await updateDoc(userRef, { money: increment(battleBet * 2), wins: increment(1) });
        else await updateDoc(userRef, { losses: increment(1) });

        // PvP 종료 시 시스템 메시지
        if (pvpRoomData?.host?.uid === user.uid) {
          const winnerName = isWin ? pvpRoomData.host.nickname : pvpRoomData.guest.nickname;
          const loserName = isWin ? pvpRoomData.guest.nickname : pvpRoomData.host.nickname;
          await addDoc(collection(db, GLOBAL_CHAT_PATH), {
            sender: 'SYSTEM',
            text: `⚔️ [${winnerName}]님이 [${loserName}]님과의 혈투에서 승리하여 ${formatMoney(battleBet * 2)} GOLD를 쟁취했습니다!`,
            timestamp: Date.now()
          });
        }
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

  const handleJoinPvPRoom = async (roomId, cardOverride = null) => {
    setIsProcessing(true);
    const targetCard = cardOverride || selectedCard;
    try {
      const matchRef = doc(db, MATCHES_PATH, roomId);
      const snap = await getDoc(matchRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.status !== 'waiting') showToast("이미 게임이 시작되었거나 가득 찬 방입니다.", "warning");
        else if (userData.money < data.bet) showToast(`입장 자금이 부족합니다. (필요: ${formatMoney(data.bet)} GOLD)`, "error");
        else {
          await updateDoc(matchRef, { guest: { uid: user.uid, nickname: userData.nickname }, guestCard: targetCard, status: 'ready' });
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
    await updateDoc(doc(db, USERS_PATH, pvpRoomData.host.uid), { money: increment(-pvpRoomData.bet) });
    await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), {
      status: 'battling',
      battleLog: simulateBattleLog(pvpRoomData.hostCard, pvpRoomData.guestCard)
    });
  };

  const handleLeaveRoom = async () => {
    const isHost = pvpRoomData?.host?.uid === user?.uid;
    if (isHost) { try { await deleteDoc(doc(db, MATCHES_PATH, pvpRoomId)); } catch (e) {} }
    setPvpRoomId(null);
    setCurrentView('lobby');
  };

  const handleAddGuestbook = async (e) => {
    e.preventDefault();
    if (!guestbookInput.trim() || !viewingProfileUserId) return;
    try {
      await updateDoc(doc(db, USERS_PATH, viewingProfileUserId), {
        guestbook: arrayUnion({ writerId: user.uid, writerName: userData.nickname, text: guestbookInput.trim(), timestamp: Date.now() })
      });
      setGuestbookInput('');
    } catch (err) { showToast("방명록 작성 실패", "error"); }
  };

  const handleSaveProfileDesc = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, USERS_PATH, user.uid), { profileDesc: editProfileDesc });
      setIsEditingProfileDesc(false);
      showToast("프로필 업데이트 완료", "success");
    } catch (err) { showToast("업데이트 실패", "error"); }
  };

  const updateQuestProgress = async (type) => {
    if (!user || !userData) return;
    const today = new Date().toISOString().split('T')[0];
    let q = userData.quests || { date: today, ai: 0, win_ai: 0, enhance: 0, pvp: 0, chat: 0, market: 0, buy_market: 0, claimed: [] };
    if (q.date !== today) q = { date: today, ai: 0, win_ai: 0, enhance: 0, pvp: 0, chat: 0, market: 0, buy_market: 0, claimed: [] };
    q[type] = (q[type] || 0) + 1;
    await updateDoc(doc(db, USERS_PATH, user.uid), { quests: q }).catch(() => {});
  };

  const handleClaimQuest = async (questId, reward) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      let q = userData.quests || { date: new Date().toISOString().split('T')[0], ai: 0, win_ai: 0, enhance: 0, pvp: 0, chat: 0, market: 0, buy_market: 0, claimed: [] };
      q.claimed.push(questId);
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(reward), quests: q });
      playSfx('success');
      showToast(`보상 수령: +${formatMoney(reward)} G`, "success");
    } catch (e) { showToast("수령 실패", "error"); }
    setIsProcessing(false);
  };

  const handleListMarket = async (card, price) => {
    if (!price || isNaN(price) || price <= 0) return showToast("올바른 금액을 입력하세요.", "warning");
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, CARDS_PATH, card.id), { isSelling: true, price: Number(price) });
      showToast("거래소에 등록되었습니다.", "success");
      setSellPriceInput('');
      setMarketSelectedCardId('');
      updateQuestProgress('market');
      if (selectedCard?.id === card.id) setSelectedCard(null);
      setCurrentView('market');
    } catch (e) { showToast("등록 실패", "error"); }
    setIsProcessing(false);
  };

  const handleCancelMarket = async (card) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, CARDS_PATH, card.id), { isSelling: false, price: null });
      showToast("판매가 취소되었습니다.", "success");
      setCurrentView('deck');
    } catch (e) { showToast("취소 실패", "error"); }
    setIsProcessing(false);
  };

  const handleBuyMarket = async (card) => {
    if (userData.money < card.price) return showToast("자금이 부족합니다.", "error");
    setConfirmModal({
      title: "거래소 거래",
      message: `[${card.name}] 카드를 ${formatMoney(card.price)} GOLD에 구매하시겠습니까?`,
      confirmText: "구매 확정", cancelText: "취소",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateDoc(doc(db, USERS_PATH, card.ownerId), { money: increment(card.price) });
          await updateDoc(doc(db, USERS_PATH, user.uid), { money: increment(-card.price) });
          await updateDoc(doc(db, CARDS_PATH, card.id), { ownerId: user.uid, isSelling: false, price: null, equippedFrame: null });
          updateQuestProgress('buy_market');
          playSfx('success'); showToast("성공적으로 거래되었습니다!", "success");
        } catch (e) { showToast("거래 실패", "error"); playSfx('error'); }
        setIsProcessing(false); setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleEquipTitle = async (title) => {
    try {
      await updateDoc(doc(db, USERS_PATH, user.uid), { equippedTitle: title });
      showToast(`[${title}] 칭호 장착 완료`, "success");
    } catch (e) { showToast("장착 실패", "error"); }
  };

  const handleAdminSetGold = async (targetUserId, amount) => {
    if (userData?.nickname !== '영록달록') return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, USERS_PATH, targetUserId), { money: amount });
      showToast(`어드민 권한: 골드 ${formatMoney(amount)} 적용 완료`, "success");
    } catch (e) { showToast("적용 실패", "error"); }
    setIsProcessing(false);
  };

  // ============================================================
  // context value
  // ============================================================
  const contextValue = {
    // 상태
    user, userData, myCards, allUsers, allCards, onlineCount,
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
    selectedAchDesc, setSelectedAchDesc,
    bgmRef,
    useBoost, setUseBoost,
    useProtect, setUseProtect,
    enhanceVisualState, setEnhanceVisualState,
    tCard1, setTCard1,
    tCard2, setTCard2,
    transcendState, setTranscendState,
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
    viewingProfileUserId, setViewingProfileUserId,
    guestbookInput, setGuestbookInput,
    isEditingProfileDesc, setIsEditingProfileDesc,
    editProfileDesc, setEditProfileDesc,
    isEditingGold, setIsEditingGold,
    editGoldValue, setEditGoldValue,
    showChargeModal, setShowChargeModal,
    chargeStep, setChargeStep,
    selectedChargePack, setSelectedChargePack,
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
    sellPriceInput, setSellPriceInput,
    marketTab, setMarketTab,
    marketSelectedCardId, setMarketSelectedCardId,
    // 핸들러
    playSfx, showToast, wrapClick, handleHover,
    handleLogin, handleAttendance,
    handleFileChange, clampPan,
    handleCropPointerDown, handleCropPointerMove, handleCropPointerUp, handleZoomChange,
    handleCreateCard, handleSellCard,
    handleSendGlobalChat, handleBuyItem,
    handleEquipCardFrame, handleEnhance,
    handleTranscend,
    startAIBattleSetup, executeAIBattle, handleBattleEnd,
    generateRoomCode, handleCreatePvPRoom, handleJoinPvPRoom,
    handleSendChat, handleStartPvPBattle, handleLeaveRoom,
    handleAddGuestbook, handleSaveProfileDesc,
    updateQuestProgress, handleClaimQuest,
    handleListMarket, handleCancelMarket, handleBuyMarket,
    handleEquipTitle, handleAdminSetGold,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (ctx === undefined) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
