/**
 * 《夏末蟬鳴的彼岸》（Beyond the Summer Cicadas）
 * 視覺小說核心狀態機、轉場演出、存讀檔、圖鑑與跨裝置互動控制器
 */
(function () {
  'use strict';

  const META_KEY = 'cicada_vn_meta_v1';
  const SAVE_SLOT_PREFIX = 'cicada_vn_save_slot_';
  const QUICKSAVE_KEY = 'cicada_vn_quicksave_v1';
  const MAX_HISTORY_LOG = 80;

  const VN = window.VN_SCRIPT;
  const audio = window.audioEngine;

  // ===========================================================================
  // DOM 參照
  // ===========================================================================
  const el = {
    gameRoot: document.getElementById('game-root'),
    titleScreen: document.getElementById('title-screen'),
    btnNewGame: document.getElementById('btn-new-game'),
    btnContinue: document.getElementById('btn-continue'),
    continueSub: document.getElementById('continue-sub'),
    btnTitleLoad: document.getElementById('btn-title-load'),
    btnTitleGallery: document.getElementById('btn-title-gallery'),
    titleGalleryCount: document.getElementById('title-gallery-count'),
    btnTitleSettings: document.getElementById('btn-title-settings'),
    btnGuideToggle: document.getElementById('btn-guide-toggle'),
    guideCard: document.getElementById('guide-card'),

    vnStage: document.getElementById('vn-stage'),
    bgLayerA: document.getElementById('bg-layer-a'),
    bgLayerB: document.getElementById('bg-layer-b'),
    stageVignette: document.getElementById('stage-vignette'),
    curtain: document.getElementById('scene-transition-curtain'),

    charSlots: {
      left: document.getElementById('char-slot-left'),
      center: document.getElementById('char-slot-center'),
      right: document.getElementById('char-slot-right')
    },

    controlBar: document.getElementById('control-bar'),
    sceneChapterPill: document.getElementById('scene-chapter-pill'),
    btnSave: document.getElementById('btn-save'),
    btnLoad: document.getElementById('btn-load'),
    btnLog: document.getElementById('btn-log'),
    btnAuto: document.getElementById('btn-auto'),
    btnSkip: document.getElementById('btn-skip'),
    btnHideUi: document.getElementById('btn-hide-ui'),
    btnMute: document.getElementById('btn-mute'),
    muteLabelText: document.getElementById('mute-label-text'),
    btnSettings: document.getElementById('btn-settings'),
    btnTitle: document.getElementById('btn-title'),

    choicesLayer: document.getElementById('choices-layer'),
    choicesList: document.getElementById('choices-list'),

    dialogueBox: document.getElementById('dialogue-box'),
    shimmerBar: document.getElementById('shimmer-bar'),
    mindsetToast: document.getElementById('mindset-toast'),
    nameplate: document.getElementById('nameplate'),
    nameplateText: document.getElementById('nameplate-text'),
    modeBadge: document.getElementById('mode-badge'),
    dialogueText: document.getElementById('dialogue-text'),
    dialogueCursor: document.getElementById('dialogue-cursor'),
    hideUiOverlay: document.getElementById('hide-ui-overlay'),

    endingOverlay: document.getElementById('ending-overlay'),
    endingCode: document.getElementById('ending-code'),
    endingTitle: document.getElementById('ending-title'),
    endingBadge: document.getElementById('ending-badge'),
    endingUnlockProgress: document.getElementById('ending-unlock-progress'),
    endingQuote: document.getElementById('ending-quote'),
    endingSummary: document.getElementById('ending-summary'),
    btnEndingGallery: document.getElementById('btn-ending-gallery'),
    btnEndingLoad: document.getElementById('btn-ending-load'),
    btnEndingTitle: document.getElementById('btn-ending-title'),

    modalBackdrop: document.getElementById('modal-backdrop'),
    modalSaveLoad: document.getElementById('modal-saveload'),
    saveloadTitle: document.getElementById('saveload-title'),
    saveloadMindset: document.getElementById('saveload-mindset'),
    saveloadMindsetText: document.getElementById('saveload-mindset-text'),
    dotDep: document.getElementById('dot-dep'),
    dotOut: document.getElementById('dot-out'),
    dotTruth: document.getElementById('dot-truth'),
    btnQuicksave: document.getElementById('btn-quicksave'),
    btnQuickload: document.getElementById('btn-quickload'),
    quicksaveInfo: document.getElementById('quicksave-info'),
    saveSlotsList: document.getElementById('save-slots-list'),

    modalLog: document.getElementById('modal-log'),
    logList: document.getElementById('log-list'),

    modalGallery: document.getElementById('modal-gallery'),
    galleryModalCount: document.getElementById('gallery-modal-count'),
    galleryCgCount: document.getElementById('gallery-cg-count'),
    tabGalleryEndings: document.getElementById('tab-gallery-endings'),
    tabGalleryCgs: document.getElementById('tab-gallery-cgs'),
    galleryGrid: document.getElementById('gallery-grid'),
    galleryDetail: document.getElementById('gallery-detail'),
    galleryDetailImg: document.getElementById('gallery-detail-img'),
    galleryDetailCode: document.getElementById('gallery-detail-code'),
    galleryDetailTitle: document.getElementById('gallery-detail-title'),
    galleryDetailQuote: document.getElementById('gallery-detail-quote'),
    galleryDetailSummary: document.getElementById('gallery-detail-summary'),
    galleryDetailTags: document.getElementById('gallery-detail-tags'),
    btnGalleryBack: document.getElementById('btn-gallery-back'),

    modalSettings: document.getElementById('modal-settings'),
    setMuted: document.getElementById('set-muted'),
    setBgmVol: document.getElementById('set-bgm-vol'),
    valBgmVol: document.getElementById('val-bgm-vol'),
    setSfxVol: document.getElementById('set-sfx-vol'),
    valSfxVol: document.getElementById('val-sfx-vol'),
    setCicada: document.getElementById('set-cicada'),
    setTextSpeed: document.getElementById('set-text-speed'),
    valTextSpeed: document.getElementById('val-text-speed'),
    setAutoSpeed: document.getElementById('set-auto-speed'),
    valAutoSpeed: document.getElementById('val-auto-speed'),
    setMindsetHint: document.getElementById('set-mindset-hint'),
    setForceSkip: document.getElementById('set-force-skip'),

    modalConfirm: document.getElementById('modal-confirm'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    btnConfirmOk: document.getElementById('btn-confirm-ok'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),

    toastBanner: document.getElementById('toast-banner')
  };

  // ===========================================================================
  // 引擎狀態
  // ===========================================================================
  const state = {
    mode: 'TITLE', // 'TITLE' | 'PLAYING' | 'MODAL' | 'HIDE_UI' | 'END'
    modeBeforeModal: 'TITLE',
    activeModal: null,
    galleryTab: 'endings',
    saveLoadMode: 'save',

    // 遊戲進度資料
    currentNodeId: 'sc_00a',
    currentLineIndex: 0,
    currentLines: [],
    gameState: VN.createInitialGameState(),
    historyLog: [],

    // 舞台渲染狀態
    activeBgId: 'bg_oldhouse',
    activeBgFilter: '',
    bgLayerActive: 'a',
    activeBgmId: null,
    cicadaActive: false,
    activeChars: [],
    slotBufferActive: { left: 'a', center: 'a', right: 'a' },

    // 打字機與自動/快進計時器
    isTyping: false,
    fullLineText: '',
    charCursor: 0,
    typeTimer: null,
    isAutoMode: false,
    autoTimer: null,
    isSkipMode: false,
    isCtrlSkipHeld: false,
    skipTimer: null,
    toastTimer: null,
    mindsetTimer: null,
    idleBarTimer: null,
    confirmCallback: null
  };

  // 全域持久資料
  let meta = {
    unlockedEndings: [],
    unlockedCgs: [],
    readNodes: [],
    uiSettings: {
      textSpeedMs: 28,
      autoSpeedMs: 1600,
      showMindsetHint: true,
      forceSkipUnread: false
    }
  };

  // ===========================================================================
  // 資源預載（消除轉場與換表情閃爍）
  // ===========================================================================
  function preloadAllAssets() {
    const priorityUrls = [
      VN.ASSETS.backgrounds.bg_oldhouse,
      VN.ASSETS.characters.kotori.sprites.idle,
      VN.ASSETS.characters.natsumi.sprites.smile,
      VN.ASSETS.backgrounds.bg_nightroom_blackout,
      VN.ASSETS.characters.kotori.sprites.tense,
      VN.ASSETS.characters.kotori.sprites.sad,
      VN.ASSETS.characters.natsumi.sprites.serious,
      VN.ASSETS.characters.natsumi.sprites.idle
    ];
    const seen = new Set();
    const queue = [];
    const pushUnique = (u) => {
      if (u && !seen.has(u)) {
        seen.add(u);
        queue.push(u);
      }
    };
    priorityUrls.forEach(pushUnique);
    Object.values(VN.ASSETS.backgrounds).forEach(pushUnique);
    Object.values(VN.ASSETS.characters).forEach((ch) => {
      if (ch.sprites) Object.values(ch.sprites).forEach(pushUnique);
      if (ch.outfits) {
        Object.values(ch.outfits).forEach((m) => Object.values(m).forEach(pushUnique));
      }
    });

    const startSequentialPreload = () => {
      let idx = 0;
      const concurrency = 2;
      const pump = () => {
        if (idx >= queue.length) return;
        const src = queue[idx++];
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => pump();
        img.src = src;
      };
      for (let i = 0; i < concurrency; i++) pump();
    };

    if (document.readyState === 'complete') {
      setTimeout(startSequentialPreload, 350);
    } else {
      window.addEventListener('load', () => setTimeout(startSequentialPreload, 350), { once: true });
    }
  }

  // ===========================================================================
  // Meta & 存讀檔持久化
  // ===========================================================================
  function loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.unlockedEndings)) meta.unlockedEndings = parsed.unlockedEndings;
        if (Array.isArray(parsed.unlockedCgs)) meta.unlockedCgs = parsed.unlockedCgs;
        if (Array.isArray(parsed.readNodes)) meta.readNodes = parsed.readNodes;
        if (parsed.uiSettings) {
          meta.uiSettings = Object.assign({}, meta.uiSettings, parsed.uiSettings);
        }
      }
    } catch (e) {}
  }

  function saveMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      existing.unlockedEndings = meta.unlockedEndings;
      existing.unlockedCgs = meta.unlockedCgs;
      existing.readNodes = meta.readNodes;
      existing.uiSettings = meta.uiSettings;
      existing.audioSettings = audio.getAudioSettings();
      localStorage.setItem(META_KEY, JSON.stringify(existing));
    } catch (e) {}
  }

  function markNodeAsRead(nodeId) {
    if (!nodeId) return;
    if (!meta.readNodes.includes(nodeId)) {
      meta.readNodes.push(nodeId);
      saveMeta();
    }
  }

  function unlockCg(cgId) {
    if (!cgId) return;
    if (!meta.unlockedCgs.includes(cgId)) {
      meta.unlockedCgs.push(cgId);
      saveMeta();
      updateTitleGalleryBadge();
    }
  }

  function formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
      date.getFullYear() + '/' +
      pad(date.getMonth() + 1) + '/' +
      pad(date.getDate()) + ' ' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes())
    );
  }

  function readSaveRecord(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getMostRecentSave() {
    const candidates = [
      readSaveRecord(SAVE_SLOT_PREFIX + '1'),
      readSaveRecord(SAVE_SLOT_PREFIX + '2'),
      readSaveRecord(SAVE_SLOT_PREFIX + '3'),
      readSaveRecord(QUICKSAVE_KEY)
    ].filter(Boolean);
    if (!candidates.length) return null;
    candidates.sort((a, b) => (b.savedAtMs || 0) - (a.savedAtMs || 0));
    return candidates[0];
  }

  function buildSavePayload(slotLabel) {
    const node = VN.NODES[state.currentNodeId];
    const line = state.currentLines[state.currentLineIndex] || { text: '' };
    const now = new Date();
    return {
      slotLabel: slotLabel,
      nodeId: state.currentNodeId,
      lineIndex: state.currentLineIndex,
      gameState: Object.assign({}, state.gameState),
      activeBg: state.activeBgId,
      activeBgFilter: state.activeBgFilter,
      activeBgm: state.activeBgmId,
      cicadaActive: state.cicadaActive || audio.isCicadaActive(),
      activeChars: state.activeChars.map((c) => Object.assign({}, c)),
      historyLog: state.historyLog.slice(-MAX_HISTORY_LOG),
      sceneTitle: node ? node.sceneTitle : '序幕',
      snippet: line.text.slice(0, 42) + (line.text.length > 42 ? '…' : ''),
      timestamp: formatTimestamp(now),
      savedAtMs: now.getTime()
    };
  }

  function writeSaveRecord(key, slotLabel) {
    try {
      const payload = buildSavePayload(slotLabel);
      localStorage.setItem(key, JSON.stringify(payload));
      audio.playUI('save');
      updateTitleContinueButton();
      return payload;
    } catch (e) {
      audio.playUI('blocked');
      showToast('瀏覽器儲存空間不足，無法存檔');
      return null;
    }
  }

  function applyLoadedRecord(record) {
    if (!record || !VN.NODES[record.nodeId]) {
      audio.playUI('blocked');
      showToast('存檔資料損毀或不存在');
      return;
    }

    stopAllTimers();
    state.isAutoMode = false;
    state.isSkipMode = false;
    updateControlBarStates();

    state.gameState = Object.assign(VN.createInitialGameState(), record.gameState || {});
    state.historyLog = Array.isArray(record.historyLog) ? record.historyLog.slice(-MAX_HISTORY_LOG) : [];
    state.currentNodeId = record.nodeId;
    state.currentLineIndex = record.lineIndex || 0;

    // 還原視覺舞台
    if (record.activeBg) {
      crossfadeBackground(record.activeBg, record.activeBgFilter || '');
    }
    setStageCharacters(Array.isArray(record.activeChars) ? record.activeChars : []);

    // 還原音訊舞台
    if (record.activeBgm) {
      state.activeBgmId = record.activeBgm;
      audio.playBGM(record.activeBgm, 1000);
      updateVignette(record.activeBgm, record.activeBgFilter || '');
    }
    if (record.cicadaActive) {
      state.cicadaActive = true;
      audio.playSFX('cicada_ambience');
    } else {
      state.cicadaActive = false;
      audio.stopAmbience(800);
    }

    audio.playUI('load');
    closeAllModals(true);
    switchToStage();

    const node = VN.NODES[state.currentNodeId];
    state.currentLines = VN.resolveNodeLines(node, state.gameState);
    el.sceneChapterPill.textContent = node.sceneTitle || '';
    el.choicesLayer.classList.add('is-hidden');
    el.endingOverlay.classList.add('is-hidden');

    const safeIdx = Math.min(state.currentLineIndex, Math.max(0, state.currentLines.length - 1));
    state.currentLineIndex = safeIdx;
    startLine(safeIdx, true);
    showToast('已讀取進度：' + (record.sceneTitle || ''));
  }

  // ===========================================================================
  // 標題與 UI 同步
  // ===========================================================================
  function updateTitleGalleryBadge() {
    const countText = meta.unlockedEndings.length + ' / ' + VN.ENDINGS_META.length;
    el.titleGalleryCount.textContent = countText;
    el.galleryModalCount.textContent = countText;
    if (el.galleryCgCount && Array.isArray(VN.CG_META)) {
      el.galleryCgCount.textContent = meta.unlockedCgs.length + ' / ' + VN.CG_META.length;
    }
  }

  function updateTitleContinueButton() {
    const latest = getMostRecentSave();
    if (latest) {
      el.btnContinue.classList.remove('is-hidden');
      el.continueSub.textContent = latest.sceneTitle + '・' + latest.timestamp;
    } else {
      el.btnContinue.classList.add('is-hidden');
    }
  }

  function updateMuteUI() {
    const muted = audio.getAudioSettings().muted;
    el.setMuted.checked = muted;
    el.btnMute.classList.toggle('is-muted', muted);
    el.muteLabelText.textContent = muted ? '已靜音' : '音效';
  }

  function updateControlBarStates() {
    el.btnAuto.classList.toggle('is-active', state.isAutoMode);
    el.btnSkip.classList.toggle('is-active', state.isSkipMode || state.isCtrlSkipHeld);

    if (state.isSkipMode || state.isCtrlSkipHeld) {
      el.modeBadge.textContent = 'SKIP >>';
      el.modeBadge.classList.remove('is-hidden');
    } else if (state.isAutoMode) {
      el.modeBadge.textContent = 'AUTO';
      el.modeBadge.classList.remove('is-hidden');
    } else {
      el.modeBadge.classList.add('is-hidden');
    }
  }

  function showToast(msg) {
    if (state.toastTimer) clearTimeout(state.toastTimer);
    el.toastBanner.textContent = msg;
    el.toastBanner.classList.remove('is-hidden');
    state.toastTimer = setTimeout(() => {
      el.toastBanner.classList.add('is-hidden');
    }, 2200);
  }

  function triggerMindsetShimmer() {
    el.shimmerBar.classList.remove('is-active');
    void el.shimmerBar.offsetWidth;
    el.shimmerBar.classList.add('is-active');

    if (state.mindsetTimer) clearTimeout(state.mindsetTimer);
    el.mindsetToast.classList.add('is-visible');
    state.mindsetTimer = setTimeout(() => {
      el.mindsetToast.classList.remove('is-visible');
    }, 1800);
  }

  // ===========================================================================
  // 舞台渲染：雙層背景與雙緩衝立繪
  // ===========================================================================
  function crossfadeBackground(bgId, filterClass) {
    const src = VN.ASSETS.backgrounds[bgId];
    if (!src) return;

    const sameBg = state.activeBgId === bgId;
    state.activeBgId = bgId;
    state.activeBgFilter = filterClass || '';

    const activeEl = state.bgLayerActive === 'a' ? el.bgLayerA : el.bgLayerB;
    const nextEl = state.bgLayerActive === 'a' ? el.bgLayerB : el.bgLayerA;

    const isEventCg = Boolean(bgId && bgId.indexOf('cg_') === 0);
    const applyFilterClasses = (imgEl, cls, markCg) => {
      imgEl.classList.remove('filter-dawn', 'filter-cicada', 'filter-breeze', 'filter-sealed');
      if (cls) imgEl.classList.add(cls);
      imgEl.classList.toggle('is-event-cg', markCg);
    };

    if (sameBg && activeEl.getAttribute('src') === src) {
      applyFilterClasses(activeEl, filterClass, isEventCg);
      return;
    }

    nextEl.src = src;
    applyFilterClasses(nextEl, filterClass, isEventCg);
    nextEl.classList.add('is-visible');
    activeEl.classList.remove('is-visible');
    state.bgLayerActive = state.bgLayerActive === 'a' ? 'b' : 'a';
  }

  function updateVignette(bgmId, bgFilter) {
    el.stageVignette.classList.remove('is-tense', 'is-sealed');
    if (bgFilter === 'filter-sealed') {
      el.stageVignette.classList.add('is-sealed');
    } else if (bgmId === 'tension_secret' || bgmId === 'climax_choice') {
      el.stageVignette.classList.add('is-tense');
    }
  }

  function setStageCharacters(charSpecs) {
    state.activeChars = charSpecs.map((c) => Object.assign({}, c));
    const byPos = { left: null, center: null, right: null };
    state.activeChars.forEach((c) => {
      if (byPos.hasOwnProperty(c.pos)) byPos[c.pos] = c;
    });

    ['left', 'center', 'right'].forEach((pos) => {
      const slot = el.charSlots[pos];
      const spec = byPos[pos];
      if (!spec) {
        slot.classList.remove('is-visible', 'is-speaking', 'is-dimmed');
        slot.dataset.charId = '';
        return;
      }

      const charInfo = VN.ASSETS.characters[spec.id];
      const src =
        charInfo &&
        ((spec.outfit && charInfo.outfits && charInfo.outfits[spec.outfit] && charInfo.outfits[spec.outfit][spec.expr]) ||
          (charInfo.sprites && charInfo.sprites[spec.expr]));
      if (!src) return;

      slot.dataset.charId = spec.id;
      slot.classList.add('is-visible');

      const imgA = slot.querySelector('.char-img-a');
      const imgB = slot.querySelector('.char-img-b');
      const curKey = state.slotBufferActive[pos];
      const curImg = curKey === 'a' ? imgA : imgB;
      const nxtImg = curKey === 'a' ? imgB : imgA;

      if (curImg.getAttribute('src') !== src) {
        nxtImg.src = src;
        nxtImg.alt = charInfo.name;
        nxtImg.classList.add('is-active');
        curImg.classList.remove('is-active');
        state.slotBufferActive[pos] = curKey === 'a' ? 'b' : 'a';
      } else {
        curImg.classList.add('is-active');
      }
    });
  }

  function updateSpeakerFocus(speakerId) {
    const isHeroine = speakerId === 'kotori' || speakerId === 'natsumi';
    ['left', 'center', 'right'].forEach((pos) => {
      const slot = el.charSlots[pos];
      if (!slot.classList.contains('is-visible')) return;
      const charId = slot.dataset.charId;
      slot.classList.remove('is-speaking', 'is-dimmed');
      if (isHeroine) {
        if (charId === speakerId) {
          slot.classList.add('is-speaking');
        } else {
          slot.classList.add('is-dimmed');
        }
      }
    });
  }

  // ===========================================================================
  // 核心敘事引擎
  // ===========================================================================
  function stopAllTimers() {
    if (state.typeTimer) {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
    }
    if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
    if (state.skipTimer) {
      clearTimeout(state.skipTimer);
      state.skipTimer = null;
    }
    state.isTyping = false;
  }

  function blurFocusedButton() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  function switchToStage() {
    blurFocusedButton();
    state.mode = 'PLAYING';
    el.titleScreen.classList.remove('is-active');
    el.vnStage.classList.remove('is-ui-hidden');
    el.hideUiOverlay.classList.add('is-hidden');
  }

  function startNewGame() {
    audio.unlock();
    audio.stopBGM(800);
    audio.stopAmbience(800);

    el.curtain.classList.add('is-active');
    setTimeout(() => {
      stopAllTimers();
      state.isAutoMode = false;
      state.isSkipMode = false;
      updateControlBarStates();

      state.gameState = VN.createInitialGameState();
      state.historyLog = [];
      state.activeBgmId = null;
      state.cicadaActive = false;
      state.activeBgId = '';
      state.activeChars = [];
      el.endingOverlay.classList.add('is-hidden');
      el.choicesLayer.classList.add('is-hidden');

      switchToStage();
      enterNode('sc_00a');

      setTimeout(() => {
        el.curtain.classList.remove('is-active');
      }, 260);
    }, 450);
  }

  function enterNode(nodeId) {
    const node = VN.NODES[nodeId];
    if (!node) return;

    if (node.isRouter && typeof node.route === 'function') {
      markNodeAsRead(nodeId);
      const targetId = node.route(state.gameState);
      enterNode(targetId);
      return;
    }

    stopAllTimers();
    state.currentNodeId = nodeId;
    state.currentLineIndex = 0;
    el.choicesLayer.classList.add('is-hidden');
    el.sceneChapterPill.textContent = node.sceneTitle || '';

    // 舞台背景、事件 CG 與濾鏡
    if (node.cg) {
      unlockCg(node.cg);
      crossfadeBackground(node.cg, node.bgFilter || '');
    } else if (node.bg) {
      crossfadeBackground(node.bg, node.bgFilter || '');
    } else if (node.bgFilter) {
      crossfadeBackground(state.activeBgId, node.bgFilter);
    }

    // 背景音樂與暗角
    if (node.bgm) {
      state.activeBgmId = node.bgm;
      audio.playBGM(node.bgm, 1000);
      if (node.bgm === 'tension_secret' || node.bgm === 'climax_choice') {
        state.cicadaActive = false;
      }
    }
    updateVignette(state.activeBgmId, node.bgFilter || state.activeBgFilter);

    // 音效
    if (node.sfx) {
      if (node.sfx === 'cicada_ambience') state.cicadaActive = true;
      audio.playSFX(node.sfx);
    }

    // 角色立繪（事件 CG 期間自動隱藏半身立繪避免疊圖）
    if (node.cg || node.clearChars) {
      setStageCharacters([]);
    } else if (Array.isArray(node.chars)) {
      setStageCharacters(node.chars);
    }

    // 節點自帶數值影響（如 sc_23 / sc_26 / sc_43）
    if (node.effects) {
      const res = VN.applyEffects(state.gameState, node.effects);
      const finalRes = node.resonance || res;
      if (finalRes && finalRes !== 'none') {
        triggerMindsetShimmer();
      }
    }

    // 檢查「已讀快進」保護：若遇到未讀新節點且未開啟強制快進，立即自動停下
    const alreadyRead = meta.readNodes.includes(nodeId);
    if ((state.isSkipMode || state.isCtrlSkipHeld) && !alreadyRead && !meta.uiSettings.forceSkipUnread) {
      state.isSkipMode = false;
      state.isCtrlSkipHeld = false;
      updateControlBarStates();
      showToast('已抵達未讀新劇情，自動停止快進');
    }

    state.currentLines = VN.resolveNodeLines(node, state.gameState);
    startLine(0, false);
  }

  function startLine(lineIdx, skipLogPush) {
    const line = state.currentLines[lineIdx];
    if (!line) return;

    stopAllTimers();
    const speakerId = line.speaker || 'narrator';
    const speakerName = VN.SPEAKER_NAMES[speakerId] || '';

    if (speakerName) {
      el.nameplateText.textContent = speakerName;
      el.nameplate.classList.remove('is-hidden');
    } else {
      el.nameplate.classList.add('is-hidden');
    }

    updateSpeakerFocus(speakerId);

    if (!skipLogPush) {
      const last = state.historyLog[state.historyLog.length - 1];
      if (!last || last.text !== line.text || last.speaker !== speakerName) {
        state.historyLog.push({
          speaker: speakerName || '旁白',
          text: line.text,
          isChoice: false
        });
        if (state.historyLog.length > MAX_HISTORY_LOG) {
          state.historyLog.shift();
        }
      }
    }

    state.fullLineText = line.text;
    const node = VN.NODES[state.currentNodeId];
    const isSkipActive = state.isSkipMode || state.isCtrlSkipHeld;
    const canFastSkip = isSkipActive && (meta.readNodes.includes(state.currentNodeId) || meta.uiSettings.forceSkipUnread);

    if (canFastSkip) {
      // 快進模式：直接顯示文字、靜音打字機，若遇選擇肢則停下
      el.dialogueText.textContent = state.fullLineText;
      state.isTyping = false;
      el.dialogueCursor.classList.remove('is-hidden');

      const isLastLine = lineIdx >= state.currentLines.length - 1;
      if (isLastLine && node && Array.isArray(node.choices)) {
        state.isSkipMode = false;
        state.isCtrlSkipHeld = false;
        updateControlBarStates();
        showChoices(node.choices);
        return;
      }

      state.skipTimer = setTimeout(() => {
        if (state.mode === 'PLAYING') {
          advanceDialogue(true);
        }
      }, 80);
      return;
    }

    // 正常逐字打字機
    el.dialogueText.textContent = '';
    el.dialogueCursor.classList.add('is-hidden');
    state.charCursor = 0;
    state.isTyping = true;

    const speedMs = Math.max(10, Number(meta.uiSettings.textSpeedMs) || 28);
    state.typeTimer = setInterval(() => {
      if (state.charCursor >= state.fullLineText.length) {
        completeTyping();
        return;
      }
      const ch = state.fullLineText.charAt(state.charCursor);
      state.charCursor += 1;
      el.dialogueText.textContent = state.fullLineText.slice(0, state.charCursor);
      audio.playTypeTick(speakerId, ch);

      if (state.charCursor >= state.fullLineText.length) {
        completeTyping();
      }
    }, speedMs);
  }

  function completeTyping() {
    if (state.typeTimer) {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
    }
    state.isTyping = false;
    state.charCursor = state.fullLineText.length;
    el.dialogueText.textContent = state.fullLineText;
    el.dialogueCursor.classList.remove('is-hidden');

    const node = VN.NODES[state.currentNodeId];
    const isLastLine = state.currentLineIndex >= state.currentLines.length - 1;

    if (isLastLine && node && Array.isArray(node.choices)) {
      // 選擇肢出現時停止自動／快進，強制由選擇肢推進
      if (state.isAutoMode || state.isSkipMode) {
        state.isAutoMode = false;
        state.isSkipMode = false;
        updateControlBarStates();
      }
      showChoices(node.choices);
      return;
    }

    if (state.isAutoMode && state.mode === 'PLAYING') {
      const waitMs = Math.max(600, Number(meta.uiSettings.autoSpeedMs) || 1600);
      state.autoTimer = setTimeout(() => {
        if (state.mode === 'PLAYING' && state.isAutoMode) {
          advanceDialogue(true);
        }
      }, waitMs);
    }
  }

  function advanceDialogue(fromAutomation) {
    if (state.mode !== 'PLAYING') return;
    if (!el.choicesLayer.classList.contains('is-hidden')) return;

    if (!fromAutomation && (state.isAutoMode || state.isSkipMode)) {
      state.isAutoMode = false;
      state.isSkipMode = false;
      updateControlBarStates();
    }

    if (state.isTyping) {
      completeTyping();
      return;
    }

    if (!fromAutomation) {
      audio.playUI('advance');
    }

    if (state.currentLineIndex + 1 < state.currentLines.length) {
      state.currentLineIndex += 1;
      startLine(state.currentLineIndex, false);
      return;
    }

    const node = VN.NODES[state.currentNodeId];
    markNodeAsRead(state.currentNodeId);

    if (node && node.ending) {
      triggerEnding(node.ending);
    } else if (node && node.next) {
      enterNode(node.next);
    }
  }

  function showChoices(choices) {
    el.choicesList.innerHTML = '';
    el.dialogueCursor.classList.add('is-hidden');

    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';

      const diamond = document.createElement('span');
      diamond.className = 'choice-diamond';
      diamond.textContent = '◇';

      const textSpan = document.createElement('span');
      textSpan.textContent = choice.label;

      btn.appendChild(diamond);
      btn.appendChild(textSpan);

      btn.addEventListener('mouseenter', () => {
        diamond.textContent = '◆';
        audio.playUI('hover');
      });
      btn.addEventListener('mouseleave', () => {
        diamond.textContent = '◇';
      });
      btn.addEventListener('focus', () => {
        diamond.textContent = '◆';
      });
      btn.addEventListener('blur', () => {
        diamond.textContent = '◇';
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        chooseOption(choice);
      });

      el.choicesList.appendChild(btn);
    });

    el.choicesLayer.classList.remove('is-hidden');
  }

  function chooseOption(choice) {
    blurFocusedButton();
    el.choicesLayer.classList.add('is-hidden');

    state.historyLog.push({
      speaker: '✦ 你的選擇',
      text: choice.label,
      isChoice: true
    });
    if (state.historyLog.length > MAX_HISTORY_LOG) {
      state.historyLog.shift();
    }

    const res = VN.applyEffects(state.gameState, choice.effects);
    const finalRes = choice.resonance || res || 'none';

    audio.playSFX('choice_confirm', { resonance: finalRes });
    if (finalRes !== 'none') {
      triggerMindsetShimmer();
    }

    markNodeAsRead(state.currentNodeId);
    enterNode(choice.next);
  }

  function triggerEnding(endingId) {
    stopAllTimers();
    state.isAutoMode = false;
    state.isSkipMode = false;
    state.isCtrlSkipHeld = false;
    updateControlBarStates();

    if (!meta.unlockedEndings.includes(endingId)) {
      meta.unlockedEndings.push(endingId);
      saveMeta();
    }
    updateTitleGalleryBadge();

    const info = VN.ENDINGS_META.find((item) => item.id === endingId) || VN.ENDINGS_META[0];
    el.endingCode.textContent = info.code;
    el.endingTitle.textContent = info.title;
    el.endingBadge.textContent = info.badge;
    el.endingUnlockProgress.textContent = '已解鎖結局 ' + meta.unlockedEndings.length + ' / ' + VN.ENDINGS_META.length;
    el.endingQuote.textContent = '「' + info.quote + '」';
    el.endingSummary.textContent = info.summary;

    state.mode = 'END';
    el.endingOverlay.classList.remove('is-hidden');
  }

  // ===========================================================================
  // 彈窗系統（Save / Load / Log / Gallery / Settings / Confirm）
  // ===========================================================================
  function openModal(modalName) {
    if (state.mode !== 'MODAL') {
      state.modeBeforeModal = state.mode;
    }
    stopAllTimers();
    if (state.isAutoMode || state.isSkipMode) {
      state.isAutoMode = false;
      state.isSkipMode = false;
      updateControlBarStates();
    }

    state.mode = 'MODAL';
    state.activeModal = modalName;
    audio.playUI('modal_open');

    [el.modalSaveLoad, el.modalLog, el.modalGallery, el.modalSettings, el.modalConfirm].forEach((m) => {
      m.classList.add('is-hidden');
    });

    if (modalName === 'saveload') el.modalSaveLoad.classList.remove('is-hidden');
    else if (modalName === 'log') el.modalLog.classList.remove('is-hidden');
    else if (modalName === 'gallery') el.modalGallery.classList.remove('is-hidden');
    else if (modalName === 'settings') el.modalSettings.classList.remove('is-hidden');
    else if (modalName === 'confirm') el.modalConfirm.classList.remove('is-hidden');

    el.modalBackdrop.classList.remove('is-hidden');
  }

  function closeAllModals(silent) {
    if (el.modalBackdrop.classList.contains('is-hidden')) return;
    blurFocusedButton();
    el.modalBackdrop.classList.add('is-hidden');
    state.activeModal = null;
    state.mode = state.modeBeforeModal || 'TITLE';
    if (!silent) audio.playUI('modal_close');
  }

  function renderMindsetProfile() {
    if (!meta.uiSettings.showMindsetHint || state.modeBeforeModal === 'TITLE') {
      el.saveloadMindset.classList.add('is-hidden');
      return;
    }
    el.saveloadMindset.classList.remove('is-hidden');

    const gs = state.gameState;
    el.dotDep.classList.toggle('is-lit-dep', gs.dependency >= 3);
    el.dotOut.classList.toggle('is-lit-out', gs.outsideBond >= 3);
    el.dotTruth.classList.toggle('is-lit-truth', gs.flag_knows_truth || gs.truth >= 1);

    let caption = '「夏末的風穿過走廊，時間彷彿正站在十字路口。」';
    if (gs.flag_knows_truth) {
      caption = '「河水與十年前的記憶，正悄然浮出水面。」';
    } else if (gs.dependency >= gs.outsideBond + 2) {
      caption = '「窗外的蟬聲似乎越來越遠了……」';
    } else if (gs.outsideBond >= gs.dependency + 1) {
      caption = '「神社的風鈴聲還留在耳邊。」';
    }
    el.saveloadMindsetText.textContent = caption;
  }

  function openSaveLoadModal(mode) {
    state.saveLoadMode = mode;
    el.saveloadTitle.textContent = mode === 'save' ? '儲存進度（Save）' : '讀取進度（Load）';
    renderMindsetProfile();

    const canSave = state.mode === 'PLAYING' || state.modeBeforeModal === 'PLAYING';
    el.btnQuicksave.disabled = !canSave;

    const qRec = readSaveRecord(QUICKSAVE_KEY);
    el.btnQuickload.disabled = !qRec;
    el.quicksaveInfo.textContent = qRec ? (qRec.sceneTitle + '・' + qRec.timestamp) : '尚無快速存檔';

    el.saveSlotsList.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const key = SAVE_SLOT_PREFIX + i;
      const rec = readSaveRecord(key);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'save-slot-card' + (rec ? '' : ' is-empty');

      if (mode === 'load' && !rec) {
        card.disabled = true;
      }

      const top = document.createElement('div');
      top.className = 'save-slot-top';
      const num = document.createElement('span');
      num.className = 'save-slot-num';
      num.textContent = 'SLOT 0' + i;
      const time = document.createElement('span');
      time.className = 'save-slot-time';
      time.textContent = rec ? rec.timestamp : '空欄位';
      top.appendChild(num);
      top.appendChild(time);

      const scene = document.createElement('div');
      scene.className = 'save-slot-scene';
      scene.textContent = rec ? rec.sceneTitle : (mode === 'save' ? '點擊儲存至此欄位' : '尚無存檔紀錄');

      const snippet = document.createElement('div');
      snippet.className = 'save-slot-snippet';
      snippet.textContent = rec ? rec.snippet : '—';

      card.appendChild(top);
      card.appendChild(scene);
      card.appendChild(snippet);

      card.addEventListener('click', () => {
        if (mode === 'save') {
          if (rec) {
            openConfirmModal(
              '覆蓋存檔確認',
              '欄位 0' + i + ' 已有「' + rec.sceneTitle + '」（' + rec.timestamp + '）的紀錄，確定要覆蓋嗎？',
              () => {
                writeSaveRecord(key, 'SLOT 0' + i);
                openSaveLoadModal('save');
                showToast('已儲存至欄位 0' + i);
              }
            );
          } else {
            writeSaveRecord(key, 'SLOT 0' + i);
            openSaveLoadModal('save');
            showToast('已儲存至欄位 0' + i);
          }
        } else {
          if (!rec) {
            audio.playUI('blocked');
            return;
          }
          applyLoadedRecord(rec);
        }
      });

      el.saveSlotsList.appendChild(card);
    }

    openModal('saveload');
  }

  function openLogModal() {
    el.logList.innerHTML = '';
    if (!state.historyLog.length) {
      const empty = document.createElement('p');
      empty.className = 'modal-subtitle';
      empty.textContent = '目前尚無對話紀錄。';
      el.logList.appendChild(empty);
    } else {
      state.historyLog.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'log-entry' + (entry.isChoice ? ' is-choice' : '');

        const sp = document.createElement('span');
        sp.className = 'log-speaker';
        sp.textContent = entry.speaker;

        const txt = document.createElement('p');
        txt.className = 'log-text';
        txt.textContent = entry.text;

        item.appendChild(sp);
        item.appendChild(txt);
        el.logList.appendChild(item);
      });
    }

    openModal('log');
    requestAnimationFrame(() => {
      el.logList.scrollTop = el.logList.scrollHeight;
    });
  }

  function openGalleryModal(tabName) {
    if (tabName === 'endings' || tabName === 'cgs') {
      state.galleryTab = tabName;
    }
    renderGalleryTab();
    openModal('gallery');
  }

  function renderGalleryTab() {
    el.galleryGrid.classList.remove('is-hidden');
    el.galleryDetail.classList.add('is-hidden');
    el.galleryGrid.innerHTML = '';
    updateTitleGalleryBadge();

    if (el.tabGalleryEndings && el.tabGalleryCgs) {
      const isEndings = state.galleryTab === 'endings';
      el.tabGalleryEndings.classList.toggle('is-active', isEndings);
      el.tabGalleryEndings.setAttribute('aria-selected', String(isEndings));
      el.tabGalleryCgs.classList.toggle('is-active', !isEndings);
      el.tabGalleryCgs.setAttribute('aria-selected', String(!isEndings));
    }

    if (state.galleryTab === 'cgs' && Array.isArray(VN.CG_META)) {
      VN.CG_META.forEach((cgItem) => {
        const unlocked = meta.unlockedCgs.includes(cgItem.id);
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'gallery-card ' + (unlocked ? 'is-unlocked' : 'is-locked');

        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'gallery-thumb-wrap';
        const img = document.createElement('img');
        img.src = VN.ASSETS.backgrounds[cgItem.id] || VN.ASSETS.backgrounds.cg_epilogue;
        img.alt = unlocked ? cgItem.title : '未解鎖事件 CG';
        img.className = 'gallery-thumb';
        thumbWrap.appendChild(img);

        if (!unlocked) {
          const lockBadge = document.createElement('div');
          lockBadge.className = 'gallery-lock-badge';
          lockBadge.textContent = 'LOCKED';
          thumbWrap.appendChild(lockBadge);
        }

        const body = document.createElement('div');
        body.className = 'gallery-card-body';
        const code = document.createElement('p');
        code.className = 'gallery-card-code';
        code.textContent = cgItem.chapter;

        const title = document.createElement('h3');
        title.className = 'gallery-card-title';
        title.textContent = unlocked ? cgItem.title : '？？？';

        const hint = document.createElement('p');
        hint.className = 'gallery-card-hint';
        hint.textContent = unlocked ? '「' + cgItem.quote + '」' : '線索：' + cgItem.hint;

        body.appendChild(code);
        body.appendChild(title);
        body.appendChild(hint);
        card.appendChild(thumbWrap);
        card.appendChild(body);

        card.addEventListener('click', () => {
          if (!unlocked) {
            audio.playUI('blocked');
            showToast('尚未解鎖此事件插畫，試著探索不同分歧吧');
            return;
          }
          showCgDetail(cgItem);
        });

        el.galleryGrid.appendChild(card);
      });
      return;
    }

    VN.ENDINGS_META.forEach((ending) => {
      const unlocked = meta.unlockedEndings.includes(ending.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-card ' + (unlocked ? 'is-unlocked' : 'is-locked');

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'gallery-thumb-wrap';
      const img = document.createElement('img');
      img.src = ending.thumbSrc || VN.ASSETS.backgrounds[ending.cgId || 'cg_epilogue'] || VN.ASSETS.backgrounds.cg_epilogue;
      img.alt = unlocked ? ending.title : '未解鎖結局';
      img.className = 'gallery-thumb ' + (unlocked ? ending.filterClass : '');
      thumbWrap.appendChild(img);

      if (!unlocked) {
        const lockBadge = document.createElement('div');
        lockBadge.className = 'gallery-lock-badge';
        lockBadge.textContent = 'LOCKED';
        thumbWrap.appendChild(lockBadge);
      }

      const body = document.createElement('div');
      body.className = 'gallery-card-body';
      const code = document.createElement('p');
      code.className = 'gallery-card-code';
      code.textContent = ending.code + '・' + ending.badge;

      const title = document.createElement('h3');
      title.className = 'gallery-card-title';
      title.textContent = unlocked ? ending.title : '？？？';

      const hint = document.createElement('p');
      hint.className = 'gallery-card-hint';
      hint.textContent = unlocked ? '「' + ending.quote + '」' : '線索：' + ending.hint;

      body.appendChild(code);
      body.appendChild(title);
      body.appendChild(hint);
      card.appendChild(thumbWrap);
      card.appendChild(body);

      card.addEventListener('click', () => {
        if (!unlocked) {
          audio.playUI('blocked');
          showToast('尚未解鎖此結局，試著依照線索探索分歧吧');
          return;
        }
        showGalleryDetail(ending);
      });

      el.galleryGrid.appendChild(card);
    });
  }

  function showCgDetail(cgItem) {
    el.galleryGrid.classList.add('is-hidden');
    el.galleryDetail.classList.remove('is-hidden');
    el.galleryDetailImg.src = VN.ASSETS.backgrounds[cgItem.id] || VN.ASSETS.backgrounds.cg_epilogue;
    el.galleryDetailImg.className = 'gallery-detail-img';
    el.galleryDetailCode.textContent = cgItem.chapter;
    el.galleryDetailTitle.textContent = cgItem.title;
    el.galleryDetailQuote.textContent = '「' + cgItem.quote + '」';
    el.galleryDetailSummary.textContent = cgItem.caption || '';
    el.galleryDetailTags.innerHTML = '';
  }

  function showGalleryDetail(ending) {
    el.galleryGrid.classList.add('is-hidden');
    el.galleryDetail.classList.remove('is-hidden');
    el.galleryDetailImg.src = VN.ASSETS.backgrounds[ending.cgId || 'cg_epilogue'] || VN.ASSETS.backgrounds.cg_epilogue;
    el.galleryDetailImg.className = 'gallery-detail-img ' + ending.filterClass;
    el.galleryDetailCode.textContent = ending.code + '・' + ending.badge;
    el.galleryDetailTitle.textContent = ending.title;
    el.galleryDetailQuote.textContent = '「' + ending.quote + '」';
    el.galleryDetailSummary.textContent = ending.summary;

    el.galleryDetailTags.innerHTML = '';
    ending.keywords.forEach((kw) => {
      const tag = document.createElement('span');
      tag.className = 'gallery-tag';
      tag.textContent = '# ' + kw;
      el.galleryDetailTags.appendChild(tag);
    });
  }

  function syncSettingsUI() {
    const a = audio.getAudioSettings();
    el.setMuted.checked = Boolean(a.muted);
    el.setBgmVol.value = Math.round((a.bgmVolume ?? 0.7) * 100);
    el.valBgmVol.textContent = el.setBgmVol.value + '%';
    el.setSfxVol.value = Math.round((a.sfxVolume ?? 0.8) * 100);
    el.valSfxVol.textContent = el.setSfxVol.value + '%';
    el.setCicada.checked = a.cicadaEnabled !== false;

    el.setTextSpeed.value = meta.uiSettings.textSpeedMs;
    el.valTextSpeed.textContent = formatTextSpeedLabel(meta.uiSettings.textSpeedMs);
    el.setAutoSpeed.value = meta.uiSettings.autoSpeedMs;
    el.valAutoSpeed.textContent = (meta.uiSettings.autoSpeedMs / 1000).toFixed(1) + ' 秒';
    el.setMindsetHint.checked = meta.uiSettings.showMindsetHint !== false;
    el.setForceSkip.checked = Boolean(meta.uiSettings.forceSkipUnread);
  }

  function formatTextSpeedLabel(ms) {
    if (ms <= 18) return '極快';
    if (ms <= 26) return '偏快';
    if (ms <= 34) return '標準';
    return '舒緩';
  }

  function openSettingsModal() {
    syncSettingsUI();
    openModal('settings');
  }

  function openConfirmModal(title, message, onConfirm) {
    state.confirmCallback = onConfirm;
    el.confirmTitle.textContent = title;
    el.confirmMessage.textContent = message;
    openModal('confirm');
  }

  function returnToTitleConfirmed() {
    audio.stopBGM(800);
    audio.stopAmbience(800);
    stopAllTimers();
    state.isAutoMode = false;
    state.isSkipMode = false;
    state.isCtrlSkipHeld = false;
    updateControlBarStates();

    el.curtain.classList.add('is-active');
    setTimeout(() => {
      closeAllModals(true);
      el.endingOverlay.classList.add('is-hidden');
      el.choicesLayer.classList.add('is-hidden');
      state.mode = 'TITLE';
      el.titleScreen.classList.add('is-active');
      updateTitleContinueButton();
      updateTitleGalleryBadge();
      audio.playBGM('title_breeze', 800);
      setTimeout(() => {
        el.curtain.classList.remove('is-active');
      }, 220);
    }, 420);
  }

  // ===========================================================================
  // 事件綁定
  // ===========================================================================
  function bindEvents() {
    // 標題畫面按鈕
    el.btnNewGame.addEventListener('click', () => {
      audio.unlock();
      startNewGame();
    });

    el.btnContinue.addEventListener('click', () => {
      audio.unlock();
      const latest = getMostRecentSave();
      if (latest) {
        applyLoadedRecord(latest);
      } else {
        audio.playUI('blocked');
      }
    });

    el.btnTitleLoad.addEventListener('click', () => {
      audio.unlock();
      openSaveLoadModal('load');
    });

    el.btnTitleGallery.addEventListener('click', () => {
      audio.unlock();
      openGalleryModal();
    });

    el.btnTitleSettings.addEventListener('click', () => {
      audio.unlock();
      openSettingsModal();
    });

    el.btnGuideToggle.addEventListener('click', () => {
      const expanded = el.btnGuideToggle.getAttribute('aria-expanded') === 'true';
      el.btnGuideToggle.setAttribute('aria-expanded', String(!expanded));
      el.guideCard.classList.toggle('is-collapsed', expanded);
    });

    // 舞台點擊推進（避免點擊控制列與彈窗誤觸）
    el.vnStage.addEventListener('click', () => {
      if (state.mode === 'PLAYING') {
        advanceDialogue(false);
      }
    });

    el.controlBar.addEventListener('click', (e) => e.stopPropagation());
    el.controlBar.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (e.detail > 0) btn.blur();
      });
    });
    el.choicesLayer.addEventListener('click', (e) => e.stopPropagation());
    el.endingOverlay.addEventListener('click', (e) => e.stopPropagation());

    // 控制列功能鈕
    el.btnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      openSaveLoadModal('save');
    });

    el.btnLoad.addEventListener('click', (e) => {
      e.stopPropagation();
      openSaveLoadModal('load');
    });

    el.btnLog.addEventListener('click', (e) => {
      e.stopPropagation();
      openLogModal();
    });

    el.btnAuto.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAutoMode();
    });

    el.btnSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSkipMode();
    });

    el.btnHideUi.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHideUI();
    });

    el.hideUiOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.mode === 'HIDE_UI') toggleHideUI();
    });

    el.btnMute.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextMuted = !audio.getAudioSettings().muted;
      audio.setAudioSettings({ muted: nextMuted });
      updateMuteUI();
    });

    el.btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      openSettingsModal();
    });

    el.btnTitle.addEventListener('click', (e) => {
      e.stopPropagation();
      openConfirmModal(
        '回到標題畫面',
        '尚未存檔的目前進度將會遺失，確定要回到標題畫面嗎？',
        returnToTitleConfirmed
      );
    });

    // 快速存檔 / 快速讀取
    el.btnQuicksave.addEventListener('click', () => {
      const saved = writeSaveRecord(QUICKSAVE_KEY, 'Q.SAVE');
      if (saved) {
        openSaveLoadModal(state.saveLoadMode);
        showToast('快速存檔完成');
      }
    });

    el.btnQuickload.addEventListener('click', () => {
      const qRec = readSaveRecord(QUICKSAVE_KEY);
      if (qRec) applyLoadedRecord(qRec);
    });

    // 圖鑑詳情返回與頁籤切換
    el.btnGalleryBack.addEventListener('click', () => {
      el.galleryDetail.classList.add('is-hidden');
      el.galleryGrid.classList.remove('is-hidden');
    });

    if (el.tabGalleryEndings && el.tabGalleryCgs) {
      el.tabGalleryEndings.addEventListener('click', () => {
        state.galleryTab = 'endings';
        renderGalleryTab();
      });
      el.tabGalleryCgs.addEventListener('click', () => {
        state.galleryTab = 'cgs';
        renderGalleryTab();
      });
    }

    // 結局畫面按鈕
    el.btnEndingGallery.addEventListener('click', () => openGalleryModal());
    el.btnEndingLoad.addEventListener('click', () => openSaveLoadModal('load'));
    el.btnEndingTitle.addEventListener('click', () => returnToTitleConfirmed());

    // 關閉彈窗按鈕與背景遮罩
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeAllModals(false));
    });

    el.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === el.modalBackdrop) {
        closeAllModals(false);
      }
    });

    el.btnConfirmCancel.addEventListener('click', () => {
      state.confirmCallback = null;
      closeAllModals(false);
    });

    el.btnConfirmOk.addEventListener('click', () => {
      const cb = state.confirmCallback;
      state.confirmCallback = null;
      closeAllModals(true);
      if (typeof cb === 'function') cb();
    });

    // 設定變更即時生效
    el.setMuted.addEventListener('change', () => {
      audio.setAudioSettings({ muted: el.setMuted.checked });
      updateMuteUI();
    });

    el.setBgmVol.addEventListener('input', () => {
      const val = Number(el.setBgmVol.value) / 100;
      el.valBgmVol.textContent = el.setBgmVol.value + '%';
      audio.setAudioSettings({ bgmVolume: val });
    });

    el.setSfxVol.addEventListener('input', () => {
      const val = Number(el.setSfxVol.value) / 100;
      el.valSfxVol.textContent = el.setSfxVol.value + '%';
      audio.setAudioSettings({ sfxVolume: val });
    });

    el.setSfxVol.addEventListener('change', () => {
      audio.playSFX('choice_confirm', { resonance: 'none' });
    });

    el.setCicada.addEventListener('change', () => {
      audio.setAudioSettings({ cicadaEnabled: el.setCicada.checked });
      if (el.setCicada.checked && state.cicadaActive) {
        audio.playSFX('cicada_ambience');
      }
    });

    el.setTextSpeed.addEventListener('input', () => {
      const ms = Number(el.setTextSpeed.value);
      meta.uiSettings.textSpeedMs = ms;
      el.valTextSpeed.textContent = formatTextSpeedLabel(ms);
      saveMeta();
    });

    el.setAutoSpeed.addEventListener('input', () => {
      const ms = Number(el.setAutoSpeed.value);
      meta.uiSettings.autoSpeedMs = ms;
      el.valAutoSpeed.textContent = (ms / 1000).toFixed(1) + ' 秒';
      saveMeta();
    });

    el.setMindsetHint.addEventListener('change', () => {
      meta.uiSettings.showMindsetHint = el.setMindsetHint.checked;
      saveMeta();
    });

    el.setForceSkip.addEventListener('change', () => {
      meta.uiSettings.forceSkipUnread = el.setForceSkip.checked;
      saveMeta();
    });

    // 桌面滑鼠閒置時微淡出控制列
    const wakeControlBar = () => {
      el.controlBar.classList.remove('is-idle-dim');
      if (state.idleBarTimer) clearTimeout(state.idleBarTimer);
      state.idleBarTimer = setTimeout(() => {
        if (state.mode === 'PLAYING') {
          el.controlBar.classList.add('is-idle-dim');
        }
      }, 3500);
    };
    el.vnStage.addEventListener('mousemove', wakeControlBar);

    // 滾輪向上開啟對話紀錄
    el.vnStage.addEventListener('wheel', (e) => {
      if (state.mode === 'PLAYING' && e.deltaY < -25) {
        openLogModal();
      }
    }, { passive: true });

    // 鍵盤快捷鍵
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  function toggleAutoMode() {
    if (state.mode !== 'PLAYING') return;
    if (!el.choicesLayer.classList.contains('is-hidden')) return;

    state.isAutoMode = !state.isAutoMode;
    if (state.isAutoMode) {
      state.isSkipMode = false;
      if (!state.isTyping) {
        const waitMs = Math.max(600, Number(meta.uiSettings.autoSpeedMs) || 1600);
        state.autoTimer = setTimeout(() => {
          if (state.mode === 'PLAYING' && state.isAutoMode) advanceDialogue(true);
        }, waitMs);
      }
    } else if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
    updateControlBarStates();
  }

  function toggleSkipMode() {
    if (state.mode !== 'PLAYING') return;
    if (!el.choicesLayer.classList.contains('is-hidden')) return;

    if (!state.isSkipMode) {
      const isRead = meta.readNodes.includes(state.currentNodeId);
      if (!isRead && !meta.uiSettings.forceSkipUnread) {
        audio.playUI('blocked');
        showToast('此段為未讀新劇情，已讀部分才可快進（可於設定開啟強制快進）');
        return;
      }
      state.isSkipMode = true;
      state.isAutoMode = false;
      updateControlBarStates();
      startLine(state.currentLineIndex, true);
    } else {
      state.isSkipMode = false;
      if (state.skipTimer) clearTimeout(state.skipTimer);
      updateControlBarStates();
    }
  }

  function toggleHideUI() {
    if (state.mode === 'PLAYING') {
      state.mode = 'HIDE_UI';
      el.vnStage.classList.add('is-ui-hidden');
      el.hideUiOverlay.classList.remove('is-hidden');
    } else if (state.mode === 'HIDE_UI') {
      state.mode = 'PLAYING';
      el.vnStage.classList.remove('is-ui-hidden');
      el.hideUiOverlay.classList.add('is-hidden');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      if (state.mode === 'MODAL') {
        closeAllModals(false);
      } else if (state.mode === 'HIDE_UI') {
        toggleHideUI();
      } else if (state.mode === 'PLAYING') {
        openSettingsModal();
      }
      return;
    }

    if (state.mode === 'HIDE_UI') {
      if (e.key.toLowerCase() === 'h') toggleHideUI();
      return;
    }

    if (state.mode !== 'PLAYING') return;

    if (e.key === ' ' || e.key === 'Enter') {
      const activeBtn = document.activeElement && document.activeElement.closest('button');
      const isVisibleStageBtn =
        activeBtn &&
        el.vnStage.contains(activeBtn) &&
        activeBtn.offsetParent !== null &&
        (!el.choicesLayer.contains(activeBtn) || !el.choicesLayer.classList.contains('is-hidden'));
      if (isVisibleStageBtn) return;
      if (activeBtn && !isVisibleStageBtn) blurFocusedButton();
      e.preventDefault();
      advanceDialogue(false);
    } else if (e.key.toLowerCase() === 'a') {
      toggleAutoMode();
    } else if (e.key.toLowerCase() === 's') {
      toggleSkipMode();
    } else if (e.key === 'Control' && !state.isCtrlSkipHeld) {
      const isRead = meta.readNodes.includes(state.currentNodeId);
      if (isRead || meta.uiSettings.forceSkipUnread) {
        state.isCtrlSkipHeld = true;
        state.isAutoMode = false;
        updateControlBarStates();
        startLine(state.currentLineIndex, true);
      }
    } else if (e.key.toLowerCase() === 'h') {
      toggleHideUI();
    } else if (e.key.toLowerCase() === 'l') {
      openLogModal();
    } else if (e.key.toLowerCase() === 'q') {
      const saved = writeSaveRecord(QUICKSAVE_KEY, 'Q.SAVE');
      if (saved) showToast('快速存檔完成');
    }
  }

  function handleKeyUp(e) {
    if (e.key === 'Control' && state.isCtrlSkipHeld) {
      state.isCtrlSkipHeld = false;
      if (state.skipTimer) {
        clearTimeout(state.skipTimer);
        state.skipTimer = null;
      }
      updateControlBarStates();
    }
  }

  // ===========================================================================
  // 初始化
  // ===========================================================================
  function init() {
    loadMeta();
    preloadAllAssets();
    updateTitleGalleryBadge();
    updateTitleContinueButton();
    updateMuteUI();
    syncSettingsUI();
    bindEvents();

    // 標題畫面排隊播放 title_breeze（首次使用者互動時由 audioEngine 自動柔和淡入）
    audio.playBGM('title_breeze', 600);
  }

  init();
})();
