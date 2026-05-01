import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, arrayUnion, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db, USERS_PATH, CARDS_PATH, MATCHES_PATH, GLOBAL_CHAT_PATH } from '../config/firebase';
import { CREATE_CARD_COST, STARTING_GOLD, STATS_BY_LEVEL, COST_BY_LEVEL, getSellPrice, ENHANCEMENT_RULES, getRandomTrait, getUnlockedSkills } from '../constants/gameData';
import { sfx } from '../utils/audio';

export const useGameLogic = () => {
  // DB 상태
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCards, setAllCards] = useState([]);
  
  // UI 뷰 상태
  const [currentView, setCurrentView] = useState('login'); 
  const [selectedCard, setSelectedCard] = useState(null);
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rankingTab, setRankingTab] = useState('money');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previewCard, setPreviewCard] = useState(null); 
  const [selectedSkillDesc, setSelectedSkillDesc] = useState(null); 
  const bgmRef = useRef(null);

  // 아이템/강화 이펙트 상태
  const [useBoost, setUseBoost] = useState(false);
  const [useProtect, setUseProtect] = useState(false);
  const [enhanceVisualState, setEnhanceVisualState] = useState('idle');

  // 이미지 크롭 상태
  const [cropImage, setCropImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  // 로그인 폼 
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('User');

  // PvP 방 상태
  const [pvpRoomId, setPvpRoomId] = useState(null);
  const [pvpRoomData, setPvpRoomData] = useState(null);
  const [pvpRoomName, setPvpRoomName] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [globalChats, setGlobalChats] = useState([]);
  const [globalChatInput, setGlobalChatInput] = useState('');

  // 배틀 상태 관리
  const [battleReward, setBattleReward] = useState(0);
  const [battleBet, setBattleBet] = useState(1000);
  const [aiOpponent, setAiOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleStep, setBattleStep] = useState(0);
  const [liveState, setLiveState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battleType, setBattleType] = useState('AI'); 

  // 사운드 및 모달 헬퍼 함수
  const playSfx = (type, param) => { if(soundEnabled && sfx[type]) sfx[type](param); };
  const showToast = (msg, type = 'info') => setToast({ message: msg, type });
  const wrapClick = (fn) => (e) => { 
    sfx.init(); playSfx('click'); 
    if (soundEnabled && bgmRef.current && bgmRef.current.paused) {
      bgmRef.current.volume = 0.2; bgmRef.current.play().catch(() => {});
    }
    if(fn) fn(e); 
  };
  const handleHover = () => playSfx('hover');

  useEffect(() => {
    if (bgmRef.current) {
      if (soundEnabled) bgmRef.current.play().catch(() => {});
      else bgmRef.current.pause();
    }
  }, [soundEnabled]);

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

  useEffect(() => {
    if (!user) return;
    const userUnsub = onSnapshot(doc(db, USERS_PATH, user.uid), (docSnap) => { if (docSnap.exists()) setUserData(docSnap.data()); });
    const cardsUnsub = onSnapshot(collection(db, CARDS_PATH), (snapshot) => {
      const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllCards(cards); setMyCards(cards.filter(c => c.ownerId === user.uid).sort((a,b) => b.level - a.level));
    });
    const usersUnsub = onSnapshot(collection(db, USERS_PATH), (snapshot) => { setAllUsers(snapshot.docs.map(d => d.data())); });
    const globalChatUnsub = onSnapshot(collection(db, GLOBAL_CHAT_PATH), (snapshot) => {
      let chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGlobalChats(chats.sort((a,b) => a.timestamp - b.timestamp).slice(-50));
    });
    const matchesUnsub = onSnapshot(collection(db, MATCHES_PATH), (snapshot) => {
      const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveRooms(matches.filter(m => m.status === 'waiting').sort((a,b) => b.createdAt - a.createdAt));
    });
    return () => { userUnsub(); cardsUnsub(); usersUnsub(); globalChatUnsub(); matchesUnsub(); };
  }, [user]);

  // PvP 룸 실시간 업데이트 리스너
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
        showToast("방이 파괴되었습니다.", "error"); setPvpRoomId(null); setCurrentView('lobby');
      }
    });
    return () => unsub();
  }, [pvpRoomId, currentView]);

  useEffect(() => {
    if(currentView !== 'enhance') { setUseBoost(false); setUseProtect(false); }
    if(currentView !== 'card_details') { setSelectedSkillDesc(null); }
  }, [currentView]);

  useEffect(() => {
    if (!showCreateModal) { setCropImage(null); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 }); }
  }, [showCreateModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    sfx.init(); playSfx('click');
    if (!loginNickname.trim() || !loginPassword.trim()) { showToast("닉네임과 비밀번호를 입력하세요", "warning"); return; }
    if (loginPassword.length < 6) { showToast("비밀번호는 6자리 이상이어야 합니다", "warning"); return; }
    setIsProcessing(true);
    try {
      const dummyEmail = `${loginNickname.toLowerCase()}@rogcard.app`;
      let currentUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, dummyEmail, loginPassword);
        currentUser = cred.user;
      } catch (err) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, dummyEmail, loginPassword);
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
          const newUserData = { userId: currentUser.uid, nickname: config.nickname, icon: config.icon, money: STARTING_GOLD, wins: 0, losses: 0, aiWins: 0, maxSlots: 3, items: { boost: 0, protect: 0 }, frames: ['default'], createdAt: new Date().toISOString() };
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
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money + 10000, lastAttendance: today });
      playSfx('success'); showToast("일일 출석 보상: +10,000 GOLD", "success");
    } catch (err) { showToast("시스템 오류 발생", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { setCropImage(ev.target.result); setImgLoaded(false); setCropZoom(1); setCropPan({ x: 0, y: 0 }); };
      reader.readAsDataURL(e.target.files[0]);
    }
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

  const handleCropPointerDown = (e) => { setIsDragging(true); setDragStart({ x: (e.touches ? e.touches[0].clientX : e.clientX) - cropPan.x, y: (e.touches ? e.touches[0].clientY : e.clientY) - cropPan.y }); };
  const handleCropPointerMove = (e) => { if (!isDragging) return; setCropPan(clampPan((e.touches ? e.touches[0].clientX : e.clientX) - dragStart.x, (e.touches ? e.touches[0].clientY : e.clientY) - dragStart.y, cropZoom)); };
  const handleCropPointerUp = () => setIsDragging(false);
  const handleZoomChange = (e) => { setCropZoom(Number(e.target.value)); setCropPan(prev => clampPan(prev.x, prev.y, Number(e.target.value))); };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (myCards.length >= (userData?.maxSlots || 3)) { showToast("보유 슬롯이 가득 찼습니다.", "error"); playSfx('error'); return; }
    if (userData.money < CREATE_CARD_COST) { showToast("자금이 부족합니다.", "error"); playSfx('error'); return; }
    if (!cropImage || !imgLoaded || !imgRef.current) { showToast("이미지를 업로드해주세요.", "error"); playSfx('error'); return; }
    
    setIsProcessing(true);
    try {
      const targetW = 800; const targetH = 1240; const R = targetW / 200; 
      const canvas = document.createElement('canvas'); canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      const S_0 = Math.max(200 / imgRef.current.naturalWidth, 310 / imgRef.current.naturalHeight);
      const finalScale = S_0 * cropZoom;
      const dW = imgRef.current.naturalWidth * finalScale; const dH = imgRef.current.naturalHeight * finalScale;

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(imgRef.current, (100 - dW/2 + cropPan.x) * R, (155 - dH/2 + cropPan.y) * R, dW * R, dH * R);

      const base64Image = canvas.toDataURL('image/jpeg', 0.95);
      const newCardRef = doc(collection(db, CARDS_PATH));
      
      await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money - CREATE_CARD_COST });
      await setDoc(newCardRef, { cardId: newCardRef.id, ownerId: user.uid, name: e.target.cardName.value.toUpperCase(), description: e.target.cardDescription.value || "DATA CORRUPTED.", imageUrl: base64Image, level: 1, stats: STATS_BY_LEVEL[1], unlockedSkills: [], equippedFrame: null, uniqueTrait: getRandomTrait(), createdAt: new Date().toISOString() });
      
      playSfx('success'); showToast("카드 생성 완료", "success"); setShowCreateModal(false); setIsProcessing(false);
    } catch (err) { playSfx('error'); showToast("생성 실패", "error"); setIsProcessing(false); }
  };

  const handleSellCard = (card) => {
    const sellPrice = getSellPrice(card.level);
    setConfirmModal({
      title: "카드 판매", message: `[${card.name}] 카드를 판매하시겠습니까?`, confirmText: "판매 확정", cancelText: "취소",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateDoc(doc(db, USERS_PATH, user.uid), { money: userData.money + sellPrice });
          await deleteDoc(doc(db, CARDS_PATH, card.id));
          playSfx('success'); showToast(`판매 완료: +${formatMoney(sellPrice)} GOLD`, "success");
        } catch(e) { showToast("오류 발생", "error"); playSfx('error'); }
        setIsProcessing(false); setConfirmModal(null); setCurrentView('deck');
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleSendGlobalChat = async (e) => {
    e.preventDefault();
    if(!globalChatInput.trim()) return;
    try { await setDoc(doc(collection(db, GLOBAL_CHAT_PATH)), { sender: userData.nickname, text: globalChatInput.trim(), timestamp: Date.now() }); setGlobalChatInput(''); } catch(err) {}
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
    } catch(e) { showToast("구매 실패", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleEquipCardFrame = async (frameId) => {
    if (!selectedCard) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, CARDS_PATH, selectedCard.id), { equippedFrame: frameId });
      setSelectedCard(prev => ({ ...prev, equippedFrame: frameId }));
      playSfx('equip'); showToast(frameId ? "프레임 장착 완료" : "프레임 해제 완료", "success");
    } catch(e) { showToast("적용 실패", "error"); playSfx('error'); }
    setIsProcessing(false);
  };

  const handleEnhance = async (card) => {
    const nextLevel = card.level + 1;
    if (nextLevel > 20) return;
    const cost = COST_BY_LEVEL[nextLevel];
    if (userData.money < cost) { showToast("자금이 부족합니다", "error"); playSfx('error'); return; }

    setIsProcessing(true);
    const isFast = card.level < 8;
    setEnhanceVisualState(isFast ? 'charging_fast' : 'charging_tension'); playSfx('charge', isFast);
    
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
      } catch(e) { showToast("시스템 오류 발생", "error"); setEnhanceVisualState('idle'); }
      setIsProcessing(false);
      setTimeout(() => { setEnhanceVisualState((prev) => prev === 'destroyed' ? 'destroyed' : 'idle'); }, 800);
    }, isFast ? 100 : 2500);
  };

  const startAIBattleSetup = (myCard) => {
    const aiLevel = Math.min(20, 1 + Math.floor((userData?.aiWins || 0) / 2));
    const aiNames = ["SYS.GHOST", "NEXUS.AI", "NULL.PTR", "GLITCH.SYS", "VOID.EXE"];
    setAiOpponent({
      id: 'ai_card', cardId: 'ai_card', name: aiNames[Math.floor(Math.random() * aiNames.length)], level: aiLevel,
      stats: STATS_BY_LEVEL[aiLevel], unlockedSkills: getUnlockedSkills(aiLevel),
      description: `네트워크를 떠도는 위협 수준 ${aiLevel}의 개체.`,
      imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}&backgroundColor=0a0a0a`
    });
    setSelectedCard(myCard); setBattleReward(aiLevel * 500 + 1000); setBattleType('AI'); setCurrentView('battle_ai_setup');
  };

  const simulateBattleLog = (c1, c2) => {
    const p1 = { ...c1.stats, name: c1.name, skills: c1.unlockedSkills, trait: c1.uniqueTrait, attackCount:0, revived:false, damageTaken:0, key:'p1', originalHp: c1.stats.hp };
    const p2 = { ...c2.stats, name: c2.name, skills: c2.unlockedSkills, trait: c2.uniqueTrait, attackCount:0, revived:false, damageTaken:0, key:'p2', originalHp: c2.stats.hp };
    if (p1.trait?.name === '암살자') p1.crit += 15; if (p2.trait?.name === '암살자') p2.crit += 15;
    if (p1.trait?.name === '바람돌이') p1.dodgeRate = 10; if (p2.trait?.name === '바람돌이') p2.dodgeRate = 10;

    const log = [{ type: 'start', text: `교전 개시: [${p1.name}] VS [${p2.name}]`, state: { p1Hp: p1.hp, p2Hp: p2.hp } }];
    let turn = 0;
    while(p1.hp > 0 && p2.hp > 0 && turn < 100) {
      turn++;
      let p1First = p1.spd >= p2.spd;
      if (p1.skills.includes('선빵필승') && !p2.skills.includes('선빵필승')) p1First = true;
      if (!p1.skills.includes('선빵필승') && p2.skills.includes('선빵필승')) p1First = false;

      for(const attacker of p1First ? [p1, p2] : [p2, p1]) {
        if(attacker.hp <= 0) continue;
        const defender = attacker.key === 'p1' ? p2 : p1;
        if(defender.hp <= 0) continue;

        attacker.attackCount++;
        let dodgeChance = defender.skills.includes('닌자 무빙') ? 15 : 0;
        if (defender.trait?.name === '바람돌이') dodgeChance += 10;

        if(Math.random() * 100 < dodgeChance) { log.push({ type: 'dodge', text: `슈슉! [${defender.name}]의 신들린 닌자 무빙!`, state: { p1Hp: p1.hp, p2Hp: p2.hp }, actor: defender.key }); continue; }

        let damage = attacker.atk; let isCrit = false; let skillUsed = null;
        if (attacker.trait?.name === '광전사' && (attacker.hp / attacker.originalHp) <= 0.5) damage *= 1.3;
        if(attacker.skills.includes('뚝배기 브레이커') && attacker.attackCount % 4 === 0) { damage *= 1.5; skillUsed = '뚝배기 브레이커'; }
        if(attacker.skills.includes('풀악셀') && (attacker.hp / attacker.originalHp) < 0.3) { damage *= 1.5; skillUsed = skillUsed || '풀악셀'; }
        if(attacker.skills.includes('눈깔 뒤집힘')) { damage *= (1 + Math.min(1, attacker.damageTaken / attacker.originalHp)); skillUsed = skillUsed || '눈깔 뒤집힘'; }
        if(attacker.skills.includes('원펀맨')) { isCrit = true; skillUsed = skillUsed || '원펀맨'; }
        else if(Math.random() * 100 < attacker.crit) { isCrit = true; }

        if(isCrit) damage *= 2;
        let finalDef = defender.def + (defender.skills.includes('우주 방어력') ? 10 : 0) + (defender.trait?.name === '강철 바디' ? 15 : 0);
        damage = Math.max(1, Math.floor(damage * (1 - Math.min(90, finalDef) / 100)));
        defender.hp -= damage; defender.damageTaken += damage;

        let healAmount = (attacker.skills.includes('뱀파이어 흡혈') ? damage * 0.15 : 0) + (attacker.trait?.name === '흡혈귀' ? damage * 0.20 : 0);
        if (healAmount > 0) { attacker.hp = Math.min(attacker.originalHp, attacker.hp + Math.floor(healAmount)); if(attacker.skills.includes('뱀파이어 흡혈')) skillUsed = skillUsed || '뱀파이어 흡혈'; }
        if(skillUsed) log.push({ type: 'skill', text: `✨ [${attacker.name}]의 특수 프로토콜 <${skillUsed}> 발동!`, state: { p1Hp: p1.hp, p2Hp: p2.hp }, actor: attacker.key, skill: skillUsed });

        log.push({ type: isCrit ? 'critical' : 'attack', text: `[${attacker.name}] ${isCrit ? "뼈와 살이 분리되는 일격!!" : "퍼억! 데미지가 들어갑니다."} (-${Math.floor(damage)})`, state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) }, damage: Math.floor(damage), attacker: attacker.key, defender: defender.key });

        if(defender.hp <= 0 && defender.skills.includes('예토전생') && !defender.revived) {
          defender.hp = Math.floor(defender.originalHp * 0.3); defender.revived = true;
          log.push({ type: 'revive', text: `🧟 [${defender.name}] : 기적처럼 예토전생합니다!`, state: { p1Hp: p1.hp, p2Hp: p2.hp }, actor: defender.key });
        }
      }
    }
    const isP1Win = p1.hp > 0;
    log.push({ type: 'end', text: `🏁 교전 종료! 승리: [${isP1Win ? p1.name : p2.name}]`, state: { p1Hp: Math.max(0, p1.hp), p2Hp: Math.max(0, p2.hp) }, winner: isP1Win ? 'p1' : 'p2' });
    return log;
  };

  const executeAIBattle = async () => {
    setBattleLog(simulateBattleLog(selectedCard, aiOpponent));
    setLiveState({ p1Hp: selectedCard.stats.hp, p2Hp: aiOpponent.stats.hp, p1Max: selectedCard.stats.hp, p2Max: aiOpponent.stats.hp, currentAction: null });
    setBattleStep(0); setBattleResult(null); setCurrentView('battle');
  };

  useEffect(() => {
    if ((currentView === 'battle' || currentView === 'battle_pvp_play') && battleLog.length > 0 && battleStep < battleLog.length) {
      const stepData = battleLog[battleStep];
      let delay = 900;
      if (stepData.type === 'start') delay = 1500;
      else if (stepData.type === 'critical') delay = 1400;
      else if (stepData.type === 'skill') delay = 1200;
      else if (stepData.type === 'dodge' || stepData.type === 'attack') delay = 800;
      
      const timer = setTimeout(() => {
        setLiveState(prev => ({ ...prev, p1Hp: stepData.state.p1Hp, p2Hp: stepData.state.p2Hp, currentAction: stepData }));
        if (stepData.type === 'critical') playSfx('crit'); else if (stepData.type === 'skill') playSfx('skill'); else if (stepData.type === 'dodge') playSfx('dodge'); else if (stepData.type === 'attack') playSfx('hit');
        else if (stepData.type === 'end') { playSfx(stepData.winner === 'p1' ? 'success' : 'error'); handleBattleEnd(stepData.winner === 'p1'); }
        if (stepData.type !== 'end') setBattleStep(s => s + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentView, battleStep, battleLog]);

  const handleBattleEnd = async (isWin) => {
    setBattleResult(isWin ? 'win' : 'lose');
    const userRef = doc(db, USERS_PATH, user.uid);
    if (battleType === 'AI') {
      if (isWin) await updateDoc(userRef, { money: userData.money + battleReward, wins: userData.wins + 1, aiWins: (userData.aiWins || 0) + 1 });
      else await updateDoc(userRef, { losses: userData.losses + 1 });
    } else {
      if (isWin) await updateDoc(userRef, { money: userData.money + battleBet * 2, wins: userData.wins + 1 });
      else await updateDoc(userRef, { losses: userData.losses + 1 });
    }
  };

  const handleCreatePvPRoom = async (e) => {
    e.preventDefault();
    if(userData.money < battleBet) { showToast("자금이 부족합니다", "error"); return; }
    if(!pvpRoomName.trim()) { showToast("방 이름을 입력하세요", "warning"); return; }
    setIsProcessing(true);
    try {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      await setDoc(doc(db, MATCHES_PATH, code), { id: code, roomName: pvpRoomName.trim(), host: { uid: user.uid, nickname: userData.nickname }, hostCard: selectedCard, guest: null, guestCard: null, bet: battleBet, status: 'waiting', chat: [], battleLog: null, createdAt: Date.now() });
      setPvpRoomId(code); setBattleType('PvP'); setCurrentView('pvp_room');
    } catch(err) { showToast("방 생성 실패", "error"); }
    setIsProcessing(false);
  };

  const handleJoinPvPRoom = async (roomId) => {
    setIsProcessing(true);
    try {
      const matchRef = doc(db, MATCHES_PATH, roomId);
      const snap = await getDoc(matchRef);
      if(snap.exists()) {
        const data = snap.data();
        if(data.status !== 'waiting') showToast("이미 게임이 시작되었거나 가득 찬 방입니다.", "warning");
        else if(userData.money < data.bet) showToast(`입장 자금이 부족합니다. (필요: ${formatMoney(data.bet)} GOLD)`, "error");
        else {
          await updateDoc(matchRef, { guest: { uid: user.uid, nickname: userData.nickname }, guestCard: selectedCard, status: 'ready' });
          setBattleBet(data.bet); setPvpRoomId(roomId); setBattleType('PvP'); setCurrentView('pvp_room');
        }
      } else { showToast("존재하지 않는 방입니다.", "error"); }
    } catch(err) { showToast("입장 실패", "error"); }
    setIsProcessing(false);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if(!chatInput.trim() || !pvpRoomId) return;
    try { await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), { chat: arrayUnion({ sender: userData.nickname, text: chatInput.trim(), time: Date.now() }) }); setChatInput(''); } catch(err) {}
  };

  const handleStartPvPBattle = async () => {
    if(!pvpRoomData || pvpRoomData.host.uid !== user.uid || pvpRoomData.status !== 'ready') return;
    await updateDoc(doc(db, USERS_PATH, pvpRoomData.host.uid), { money: userData.money - pvpRoomData.bet });
    await updateDoc(doc(db, MATCHES_PATH, pvpRoomId), { status: 'battling', battleLog: simulateBattleLog(pvpRoomData.hostCard, pvpRoomData.guestCard) });
  };

  return {
    user, userData, myCards, allUsers, allCards, currentView, setCurrentView, selectedCard, setSelectedCard,
    toast, setToast, isProcessing, setIsProcessing, confirmModal, setConfirmModal, showCreateModal, setShowCreateModal,
    rankingTab, setRankingTab, soundEnabled, setSoundEnabled, previewCard, setPreviewCard, selectedSkillDesc, setSelectedSkillDesc,
    bgmRef, useBoost, setUseBoost, useProtect, setUseProtect, enhanceVisualState, setEnhanceVisualState,
    cropImage, setCropImage, imgLoaded, setImgLoaded, cropZoom, setCropZoom, cropPan, setCropPan, isDragging, setIsDragging, dragStart, setDragStart, imgRef,
    loginNickname, setLoginNickname, loginPassword, setLoginPassword, selectedIconName, setSelectedIconName,
    pvpRoomId, setPvpRoomId, pvpRoomData, setPvpRoomData, pvpRoomName, setPvpRoomName, activeRooms, setActiveRooms,
    chatInput, setChatInput, globalChats, setGlobalChats, globalChatInput, setGlobalChatInput,
    battleReward, setBattleReward, battleBet, setBattleBet, aiOpponent, setAiOpponent, battleLog, setBattleLog, battleStep, setBattleStep, liveState, setLiveState, battleResult, setBattleResult, battleType, setBattleType,
    playSfx, showToast, wrapClick, handleHover, handleLogin, handleAttendance, handleFileChange, handleCropPointerDown, handleCropPointerMove, handleCropPointerUp, handleZoomChange, handleCreateCard, handleSellCard, handleSendGlobalChat, handleBuyItem, handleEquipCardFrame, handleEnhance, startAIBattleSetup, executeAIBattle, handleBattleEnd, handleCreatePvPRoom, handleJoinPvPRoom, handleSendChat, handleStartPvPBattle
  };
};