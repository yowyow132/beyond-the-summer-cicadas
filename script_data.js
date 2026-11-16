/**
 * 《夏末蟬鳴的彼岸》（Beyond the Summer Cicadas）v3.0 — StoryScope Edition
 * 依據工作室 v1.4.0 規範重構：停電夜倒敘切入 × 記憶閃回 × 角色雙面私心 × 留白終局
 * 全 60 個節點（59 個劇情節點 + 1 個結局分流器 node_router），含 5 張背景與 6 張事件 CG
 */
(function (global) {
  'use strict';

  const ASSETS = {
    backgrounds: {
      bg_nightroom_blackout: 'assets/bg_nightroom_blackout.png',
      bg_oldhouse: 'assets/bg_oldhouse.png',
      bg_embankment: 'assets/bg_embankment.png',
      bg_shrine: 'assets/bg_shrine.png',
      bg_nightroom: 'assets/bg_nightroom.png',
      cg_rain_hair: 'assets/cg_rain_hair.png',
      cg_night_embrace: 'assets/cg_night_embrace.png',
      cg_shrine_confront: 'assets/cg_shrine_confront.png',
      cg_sealed_window: 'assets/cg_sealed_window.png',
      cg_dawn_horizon: 'assets/cg_dawn_horizon.png',
      cg_epilogue: 'assets/cg_epilogue.png'
    },
    characters: {
      kotori: {
        name: '小鳥遊 琴理',
        shortName: '琴理',
        sprites: {
          idle: 'assets/char_kotori_idle.png',
          smile: 'assets/char_kotori_smile.png',
          sad: 'assets/char_kotori_sad.png',
          tense: 'assets/char_kotori_tense.png'
        },
        outfits: {
          white_sundress: {
            idle: 'assets/char_kotori_idle.png',
            smile: 'assets/char_kotori_smile.png',
            sad: 'assets/char_kotori_sad.png',
            tense: 'assets/char_kotori_tense.png'
          }
        }
      },
      natsumi: {
        name: '宮代 夏實',
        shortName: '夏實',
        sprites: {
          idle: 'assets/char_natsumi_idle.png',
          smile: 'assets/char_natsumi_smile.png',
          sad: 'assets/char_natsumi_sad.png',
          serious: 'assets/char_natsumi_serious.png'
        },
        outfits: {
          summer_casual: {
            idle: 'assets/char_natsumi_idle.png',
            smile: 'assets/char_natsumi_smile.png',
            sad: 'assets/char_natsumi_sad.png',
            serious: 'assets/char_natsumi_serious.png'
          }
        }
      }
    }
  };

  const SPEAKER_NAMES = {
    narrator: '',
    yuma: '小鳥遊 悠真',
    kotori: '小鳥遊 琴理',
    natsumi: '宮代 夏實'
  };

  const CG_META = [
    {
      id: 'cg_rain_hair',
      chapter: 'CG 01・閃回・第二日驟雨',
      title: '毛巾摺痕裡的手腕',
      quote: '只要你不點頭，外頭的人就拿我們沒辦法。',
      caption: '暴雨拉起屋外的霧藍水聲，昏黃檯燈把榻榻米照得過分安靜。替剛淋濕進門的琴理拭乾水氣時，隔著棉布輕壓上來的心跳與震動中的舊手機號碼，成了第一場無聲交鋒。',
      hint: '推進至 Act I 閃回「第二日驟雨的毛巾」即可自動解鎖。'
    },
    {
      id: 'cg_night_embrace',
      chapter: 'CG 02・閃回・第三日深夜圓窗',
      title: '圓窗月光下的戳破',
      quote: '你只是害怕一旦不需要照顧我，就再也沒有人非要你不可了。',
      caption: '凌晨兩點，月光從木格圓窗漏在並排的被褥上。看似脆弱依賴的妹妹一句句揭開兄長躲回鄉間老宅、逃避東京挫折與同儕比較的真正私心。',
      hint: '推進至 Act I 閃回「第三日深夜的圓窗」即可自動解鎖。'
    },
    {
      id: 'cg_shrine_confront',
      chapter: 'CG 03・閃回・第三日暴雨神社',
      title: '紅蠟印封套與十年前的火',
      quote: '我以為只要把你們「安全送回正軌」，我欠你們家的債就算還清了。',
      caption: '傾盆夏雨打在神社偏殿屋簷上。被柱腳燒焦和紙角逼至退無可退的夏實，終於拿出綴著紅蠟印卻始終沒寄出的賠償舊信，說出十年前夏祭前夜燈油引燃偏廂的內情。',
      hint: '於 Act II 堤防選擇逼問十年前偏廂起火那晚的真相（抉擇 4A）。'
    },
    {
      id: 'cg_sealed_window',
      chapter: 'CG 04・ENDING A 專屬插畫',
      title: '停在兩點十四分的部屋',
      quote: '門外頭的聲音，聽起來好像變得很遠很遠了呢。',
      caption: '拔掉門鈴細電線、將能看見馬路的木窗逐一落鎖後，停電時卡在兩點十四分的舊鬧鐘不再轉動。微暗琥珀光線裡，半張揉皺的協議書正緊貼掌心發熱。',
      hint: '達成結局 A《繭中之夏》即可解鎖。'
    },
    {
      id: 'cg_dawn_horizon',
      chapter: 'CG 05・ENDING C 專屬插畫',
      title: '雨歇緣廊與不再重疊的腳步',
      quote: '……外頭的風，原來比房間裡還要吵啊。',
      caption: '五點十分推開外側雨戶，潮濕的杉木葉氣味瞬間灌滿走廊。把只剩一格電的手電筒擺回抽屜、各自踩上帆布鞋後，兩人迎向不再替彼此代決的清晨山脊。',
      hint: '達成結局 C《夏末彼岸的微光（True End）》即可解鎖。'
    },
    {
      id: 'cg_epilogue',
      chapter: 'CG 06・彼岸晨風',
      title: '門扉內外的剩餘線索',
      quote: '半張沒找齊的協議書、涼透的麥茶與落地的透明蟬蛻。',
      caption: '在杉林山霧或剛亮起的太陽底下注視木宅彼端——見證單程公車駛離村口，或清晨開著三吋門縫後空蕩寂靜的和室。',
      hint: '達成結局 B《風鈴與未竟的告別》或結局 D《空殼與殘響》即可解鎖。'
    }
  ];

  const ENDINGS_META = [
    {
      id: 'ending_dawn',
      code: 'ENDING C',
      title: '夏末彼岸的微光',
      badge: 'True End',
      cgId: 'cg_dawn_horizon',
      filterClass: 'filter-dawn',
      quote: '石階上敲出兩道不再重疊的節拍，而屋簷下的風鈴輕輕晃了一下。',
      summary: '查明十年前偏廂火災與賠償封口的事實，在深夜坦承自己留在鄉間同樣出於逃避現實的怯懦，並於停電攤牌時不再替琴理做決定、把選擇權還給對方。兄妹與夏實並肩跨越清晨的村口石階。',
      keywords: ['十年前火災', '坦白自我私心', '歸還選擇權'],
      hint: '於圓窗夜談坦白逃避心態、在堤防追問出火災真相，並在最終攤牌將決定權交還給琴理。'
    },
    {
      id: 'ending_breeze',
      code: 'ENDING B',
      title: '風鈴與未竟的告別',
      badge: 'Normal End',
      cgId: 'cg_epilogue',
      filterClass: 'filter-breeze',
      quote: '公車駛入山霧裡，而佛壇抽屜裡還壓著半張沒找齊的協議書。',
      summary: '悠真收下電池與聯絡單獨自搭上早班公車去鎮上辦手續，夏實懷著壓進口袋的紅蠟印秘密守在站牌邊，將那座沒有揭開舊傷的老屋暫時留在了身後的山霧裡。',
      keywords: ['單程早班車', '未拆的信封', '擱置的心結'],
      hint: '在最終夜接過電池先行出門，或傾向配合外界與夏實但未掀開十年前火災真相。'
    },
    {
      id: 'ending_sealed',
      code: 'ENDING A',
      title: '繭中之夏',
      badge: 'Closed End',
      cgId: 'cg_sealed_window',
      filterClass: 'filter-sealed',
      quote: '卡在兩點十四分的鬧鐘旁，誰都沒有再伸手去摸玄關的門把。',
      summary: '停電夜裡扣死門栓、收下琴理悄悄藏了一整天的電池，隔天一早拔掉門鈴電線將外頭所有的善意與催促隔絕。在已經涼透的麥茶與發皺的半張協議書之間，兩人留在了沒有外人的屋裡。',
      keywords: ['扣死門栓', '藏起的電池', '停滯兩點十四分'],
      hint: '多次配合琴理掩藏協議書與拒絕來電，並在停電夜將夏實鎖在門廊之外。'
    },
    {
      id: 'ending_cicada',
      code: 'ENDING D',
      title: '空殼與殘響',
      badge: 'Bitter End',
      cgId: 'cg_epilogue',
      filterClass: 'filter-cicada',
      quote: '玄關開著三吋寬的縫，冷麥茶底下壓著一張沒有署名的短箋。',
      summary: '既沒查明火場舊帳或不敢正視自己的私心，又在最後試圖強硬推開大門或搖擺不前，反而讓早已握著籌碼的琴理獨自拎著袋子趁清晨離開。桌上只留下一顆拆下來的電池與透明蟬蛻。',
      keywords: ['三吋門縫', '留下的電池', '不告而別'],
      hint: '在保留秘密與迎向外界之間猶疑錯位，或未誠實坦白便要求琴理自行抉擇。'
    }
  ];

  function createInitialGameState() {
    return {
      trust: 1,
      bond: 0,
      truth: 0,
      flag_hid_papers: false,
      flag_knows_fire: false,
      flag_admitted_weakness: false,
      flag_final_choice: null
    };
  }

  const NODES = {
    // =========================================================================
    // 【Act 0：現在・第四天深夜・停電之後】（sc_01 ~ sc_07，9 節點）
    // =========================================================================
    sc_01: {
      id: 'sc_01',
      sceneTitle: '現在・停電後的佛壇前',
      bg: 'bg_nightroom_blackout',
      clearChars: true,
      bgm: 'tension_secret',
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '暴雨切斷村裡輸電線已經過了十分鐘。手電筒的光柱突然暗了一半，搖開背蓋一摸——裡面只剩一顆電池。' },
        { speaker: 'narrator', text: '就著快熄滅的微光，我從佛壇最底層抽屜的線香盒底下，摸出半張被整齊撕開的《轉校與撫養權協議書》。' },
        { speaker: 'narrator', text: '屋裡傳來赤腳踩過冷木地板的黏滯聲；同一秒，玄關竹門外響起急促卻刻意壓低的叩門聲。' }
      ],
      next: 'sc_02'
    },

    sc_02: {
      id: 'sc_02',
      sceneTitle: '現在・停電後的佛壇前',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '紙門無聲滑開半幅。琴理站在光圈邊緣，視線沒看我的臉，直接落在那半張起毛邊的協議書與接觸不良的手電筒上。' },
        { speaker: 'kotori', text: '那支手電筒本來就壞了，悠真。別再按了，會傷手。' },
        { speaker: 'kotori', text: '……外頭在拍門的，是夏實對吧。' }
      ],
      next: 'sc_03'
    },

    sc_03: {
      id: 'sc_03',
      sceneTitle: '現在・停電後的佛壇前',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '叩門聲又響了三下，這回混著雨傘滴水的啪嗒聲。琴理微微側過半步，剛好把通往玄關的走道擋住一半。' }
      ],
      choices: [
        {
          label: '把協議書塞回抽屜，起身去玄關打發夏實：「停電而已，我們不需要誰進來。」',
          effects: { trust: 2, bond: -1, flag_hid_papers: true },
          resonance: 'dependency',
          next: 'sc_04a'
        },
        {
          label: '把半張紙舉到微光裡：「姑姑簽好字的文件……妳早就看過了，對吧？」',
          effects: { truth: 2, trust: -1 },
          resonance: 'truth',
          next: 'sc_04b'
        },
        {
          label: '不先拆穿她，側身繞過走道拉開玄關門：「屋裡太暗了，先讓夏實進來。」',
          effects: { bond: 2, truth: 1 },
          resonance: 'outsideBond',
          next: 'sc_04c'
        }
      ]
    },

    sc_04a: {
      id: 'sc_04a',
      sceneTitle: '現在・停電後的佛壇前',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '紙張重新滑回線香盒底，木抽屜合上時發出輕微的卡榫聲。琴理的肩膀這才一點一點鬆下來。' },
        { speaker: 'kotori', text: '嗯……我也覺得，門外有雨的時候還是關著比較好。' }
      ],
      next: 'sc_05'
    },

    sc_04b: {
      id: 'sc_04b',
      sceneTitle: '現在・停電後的佛壇前',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '琴理沒有伸手來搶，只是把指尖緩緩收進背後。手電筒的光閃了一下，她連睫毛都沒眨。' },
        { speaker: 'kotori', text: '撕掉另一半的人又不只我一個，悠真。姑姑打電話來的那天晚上，掛掉電話的人是你吧。' }
      ],
      next: 'sc_05'
    },

    sc_04c: {
      id: 'sc_04c',
      sceneTitle: '現在・停電後的佛壇前',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'left' }],
      lines: [
        { speaker: 'narrator', text: '我越過琴理身旁去撥玄關木栓。手背擦過她臂側時，她整條手臂硬得像塊浸過冰水的木頭。' },
        { speaker: 'kotori', text: '……悠真現在連屋裡停電，都要先找外人進來嗎？' }
      ],
      next: 'sc_05'
    },

    sc_05: {
      id: 'sc_05',
      sceneTitle: '現在・停電後的佛壇前',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'idle', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '門縫拉開一掌寬，潮濕的風立刻灌進來。夏實手裡捏著一排沒拆封的電池和一張摺得發皺的車次表，胸口急促起伏。' },
        { speaker: 'natsumi', text: '還好屋裡沒事……剛才村尾變電箱跳掉，我怕你們留著的那支舊手電筒不夠用。' },
        { speaker: 'natsumi', text: '還有，鎮公所剛才打電話到神社問，明天九點再不把監護與轉學文件補齊，東京那邊的遠房親戚就會直接派人來接琴理——' }
      ],
      next: 'sc_06'
    },

    sc_06: {
      id: 'sc_06',
      sceneTitle: '現在・停電後的佛壇前',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '夏實的視線忽然停在和室深處——半開的佛壇抽屜旁，露出一截沒關嚴的木箱焦痕。她握著電池的手指猛地收緊，指節發白。' },
        { speaker: 'natsumi', text: '……你們翻過老屋偏廂留下的箱子了？' },
        { speaker: 'yuma', text: '夏實，這排電池是妳前天拿來的吧。既然本來裝滿兩顆——另外一顆去哪了？' }
      ],
      next: 'sc_07'
    },

    sc_07: {
      id: 'sc_07',
      sceneTitle: '現在・停電後的佛壇前',
      sfx: 'memory_flash',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '黑暗裡三個人的呼吸同時停了半秒。夏實袖口沾著淡淡的神社線香與舊木屑味，琴理卻悄無聲息地往我身後貼近半寸，像第一天踏進這棟屋子時那樣。' },
        { speaker: 'narrator', text: '那股熟悉的壓迫感猛地撞回腦海——四天前我們搬進來時，這一切究竟是誰先動的手？' }
      ],
      next: 'sc_08'
    },

    // =========================================================================
    // 【Act I：閃回・第一日至第三日深夜（鎖與脆弱）】（sc_08 ~ sc_16，11 節點）
    // =========================================================================
    sc_08: {
      id: 'sc_08',
      sceneTitle: '閃回・第一日午後的木栓',
      bg: 'bg_oldhouse',
      bgm: 'summer_day',
      sfx: 'cicada_ambience',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '四天前剛踏進這棟空了三年的木宅時，琴理並沒有先拆行李，而是順著緣廊把朝向鄰家的木製雨戶一格格插上門栓。' },
        { speaker: 'kotori', text: '巷口的阿姨一直往院子裡看。先把裡面關起來好不好，悠真？' },
        { speaker: 'narrator', text: '我沒有阻止她。在東京被同學用同情眼神盯著、被律師當成未成年的拖油瓶那天起，只有在她說「這屋子只能靠你」的時候，我才覺得自己沒有輸給任何人。' }
      ],
      next: 'sc_09'
    },

    sc_09: {
      id: 'sc_09',
      sceneTitle: '閃回・第二日驟雨的毛巾',
      cg: 'cg_rain_hair',
      bgm: 'twilight_memory',
      sfx: 'door_slide',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '第二天午後驟雨砸上屋簷，外頭拉起一片藍灰水霧。我跪坐在榻榻米上替剛淋濕進門的琴理按乾水氣，小檯燈把我們之間照得過分安靜。' },
        { speaker: 'kotori', text: '外頭的雷聲好吵……毛巾貼著耳朵的時候，就聽不見那麼清楚了。' }
      ],
      next: 'sc_10'
    },

    sc_10: {
      id: 'sc_10',
      sceneTitle: '閃回・第二日驟雨的毛巾',
      cg: 'cg_rain_hair',
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '琴理把毛巾的另一角捏進指縫裡，指腹正好隔著棉布輕輕壓住我的手腕。' },
        { speaker: 'kotori', text: '吶，悠真……剛才你去買東西的時候，玄關那支舊手機一直在震動，顯示的是東京姑姑的號碼。要是明天她又打來，你會接嗎？' }
      ],
      choices: [
        {
          label: '「我等一下就去把手機關靜音。至少這幾天，誰都不要打擾我們。」',
          effects: { trust: 2, bond: -1 },
          resonance: 'dependency',
          next: 'sc_11a'
        },
        {
          label: '「該回的電話還是得回。我陪妳留在這兒，不是為了讓兩個人都躲一輩子。」',
          effects: { bond: 2, trust: -1 },
          resonance: 'outsideBond',
          next: 'sc_11b'
        }
      ]
    },

    sc_11a: {
      id: 'sc_11a',
      sceneTitle: '閃回・第二日驟雨的毛巾',
      cg: 'cg_rain_hair',
      lines: [
        { speaker: 'narrator', text: '琴理指尖的力道鬆開，順勢把額頭靠進我掌心旁的毛巾摺痕裡，嘴角彎起一個讓人卸下戒心的弧度。' },
        { speaker: 'kotori', text: '嗯……只要你不點頭，外頭的人就拿我們沒辦法。' }
      ],
      next: 'sc_12'
    },

    sc_11b: {
      id: 'sc_11b',
      sceneTitle: '閃回・第二日驟雨的毛巾',
      cg: 'cg_rain_hair',
      lines: [
        { speaker: 'narrator', text: '我抽出手把毛巾放回她膝上，往後退開半個坐墊。琴理低頭盯著被抽走的空處，安靜得連雨聲都顯得刺耳。' },
        { speaker: 'kotori', text: '……原來連悠真，也開始算著什麼時候要走了嗎。' }
      ],
      next: 'sc_12'
    },

    sc_12: {
      id: 'sc_12',
      sceneTitle: '閃回・第二日傍晚的訪客',
      bg: 'bg_oldhouse',
      bgm: 'summer_day',
      sfx: 'wind_chime',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '雨勢剛歇，夏實推著腳踏車停在竹門外，遞來一袋冰鎮麥茶與一支全新的手電筒——我親眼看著她推開開關試光，燈泡亮得刺眼。' },
        { speaker: 'natsumi', text: '九月一日之前，轉學報到跟親戚那邊的連絡單都得交出去。我明天一早陪你去鎮公所吧，拖越久對你們越不利。' }
      ],
      next: 'sc_13'
    },

    sc_13: {
      id: 'sc_13',
      sceneTitle: '閃回・第二日傍晚的訪客',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '她話說得極快，像在趕一份非完成不可的工期。可當目光掃過緣廊盡頭那根被深色油漆重新刷蓋過的舊木柱時，夏實的笑臉忽然頓住。' },
        { speaker: 'natsumi', text: '……這棟老屋偏廂十年前燒過一次，木樑潮氣重，真的不適合你們一直關在裡面。明天早上我在堤防等你們，一定要出來喔。' }
      ],
      next: 'sc_14'
    },

    sc_14: {
      id: 'sc_14',
      sceneTitle: '閃回・第三日深夜的圓窗',
      cg: 'cg_night_embrace',
      bgm: 'tension_secret',
      sfx: 'heartbeat',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '第三天凌晨兩點，月光從圓形木格窗漏進來。我原本以為琴理已經睡熟，卻被一隻冰涼的手輕輕按住膝蓋。' },
        { speaker: 'kotori', text: '悠真……你在東京的時候，每次模擬考被同班同學比下去、回家看見空蕩蕩的餐桌，是不是都覺得只有我還等著你，才像個哥哥？' },
        { speaker: 'kotori', text: '你並不是真的放不下我吧。你只是害怕一旦不需要照顧我，就再也沒有人非要你不可了。' }
      ],
      choices: [
        {
          label: '收緊手掌壓住她的手背：「別亂說……我們之間不需要去算這些，只剩彼此有什麼不好？」',
          effects: { trust: 2, truth: -1 },
          resonance: 'dependency',
          next: 'sc_15a'
        },
        {
          label: '沒有抽開膝上的手，低聲承認：「……妳說對了。我躲進這裡，有一半是為了我自己。」',
          effects: { truth: 2, bond: 1, flag_admitted_weakness: true },
          resonance: 'truth',
          next: 'sc_15b'
        }
      ]
    },

    sc_15a: {
      id: 'sc_15a',
      sceneTitle: '閃回・第三日深夜的圓窗',
      cg: 'cg_night_embrace',
      lines: [
        { speaker: 'narrator', text: '我沒有回答她的後半句，只把她冰冷的手指包進掌心。琴理偏過頭把臉貼上我的肩胛，呼吸輕得像一聲得逞的嘆息。' },
        { speaker: 'kotori', text: '……那就好。只要你也承認離不開這裡，明天我什麼都不怕了。' }
      ],
      next: 'sc_16'
    },

    sc_15b: {
      id: 'sc_15b',
      sceneTitle: '閃回・第三日深夜的圓窗',
      cg: 'cg_night_embrace',
      lines: [
        { speaker: 'narrator', text: '說出口的瞬間，連我自己都覺得脊椎一涼。琴理靠在肩上的身體明顯僵了一下，搭在膝頭的五指慢慢蜷緊。' },
        { speaker: 'kotori', text: '……好誠實啊，悠真。可是如果連你都只是在逃跑，那我抓著的這隻手，算什麼呢？' }
      ],
      next: 'sc_16'
    },

    sc_16: {
      id: 'sc_16',
      sceneTitle: '閃回・第三日深夜的圓窗',
      bg: 'bg_nightroom',
      sfx: 'memory_flash',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '那一晚我們都沒再閉眼。天色剛亮，我踩著雨前的悶熱獨自出門——口袋裡塞著從舊柱腳邊撿到的一角燒焦和紙，還有夏實催得太急的疑惑。' }
      ],
      next: 'sc_17'
    },

    // =========================================================================
    // 【Act II：閃回・第三日暴雨堤防與神社（十年前的火）】（sc_17 ~ sc_26，10 節點）
    // =========================================================================
    sc_17: {
      id: 'sc_17',
      sceneTitle: '閃回・堤防的舊帳',
      bg: 'bg_embankment',
      bgm: 'twilight_memory',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '傍晚的積雨雲壓在河橋上方。夏實站在堤防石階口，手裡已經把填好一半的轉校聯絡單和親戚電話抄好了。' },
        { speaker: 'natsumi', text: '你總算肯單獨出來了。這是學校跟鎮公所的聯絡窗口，只要明天上午簽完名——' }
      ],
      next: 'sc_18'
    },

    sc_18: {
      id: 'sc_18',
      sceneTitle: '閃回・堤防的舊帳',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我沒接那張紙，只是把從老屋牆角撿來、邊緣焦黑發脆的神社舊紙符角放在她掌心上。夏實像被燙到一樣猛地縮回手，紙片掉在芒草間。' },
        { speaker: 'yuma', text: '別再拿時間表催我了。妳這麼急著把我們送回東京親戚家，到底是因為擔心我們……還是只要我們不在這裡，妳就不用每天經過那棟燒過的房子？' }
      ],
      next: 'sc_19'
    },

    sc_19: {
      id: 'sc_19',
      sceneTitle: '閃回・堤防的舊帳',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '第一滴雨砸在混凝土橋墩上。夏實盯著地上那角焦紙，嘴唇動了兩次卻沒發出聲音。' }
      ],
      choices: [
        {
          label: '「十年前偏廂起火那晚，宮代家的人到底在現場做了什麼？全部告訴我。」',
          effects: { truth: 2, bond: 1, flag_knows_fire: true },
          resonance: 'truth',
          next: 'sc_20'
        },
        {
          label: '彎腰撿起聯絡單拍掉灰塵：「……算了，過去的別翻了。明天怎麼辦手續，妳直接說吧。」',
          effects: { bond: 2, truth: -1 },
          resonance: 'outsideBond',
          next: 'sc_25'
        }
      ]
    },

    sc_20: {
      id: 'sc_20',
      sceneTitle: '閃回・暴雨簷下的贖罪',
      cg: 'cg_shrine_confront',
      bgm: 'climax_choice',
      sfx: 'heartbeat',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '暴雨傾瀉而下，兩人衝進神社偏殿屋簷底下。夏實沒有擦臉上的水珠，只是從懷裡掏出一封綴著紅蠟印、卻始終沒送出去的舊信封，雙手死死按在胸口。' },
        { speaker: 'natsumi', text: '十年前夏祭前夜……我外公派人把祭典用剩的燈油桶暫放在你們家老宅偏廂的竹棚邊，是我拿線香去試著點亮舊提燈，才會把火星濺到油桶上！' }
      ],
      next: 'sc_21'
    },

    sc_21: {
      id: 'sc_21',
      sceneTitle: '閃回・暴雨簷下的贖罪',
      cg: 'cg_shrine_confront',
      sfx: 'memory_flash',
      lines: [
        { speaker: 'narrator', text: '記憶裡驟然翻起刺鼻的濃煙與木樑斷裂的脆響——難怪母親離村後每逢陰雨就咳得喘不過氣，難怪父親臨走前跟村裡徹底決裂。' },
        { speaker: 'natsumi', text: '偏廂燒塌那天夜裡，是宮代家拿出一筆賠償金私下跟你們外公壓住報案紀錄。大人們要我這輩子不准再提，我外公連房子都幫忙重新上漆蓋掉焦痕——' }
      ],
      next: 'sc_22'
    },

    sc_22: {
      id: 'sc_22',
      sceneTitle: '閃回・暴雨簷下的贖罪',
      cg: 'cg_shrine_confront',
      lines: [
        { speaker: 'narrator', text: '夏實的肩膀抖得厲害，指尖把那枚紅蠟印捏得變了形。' },
        { speaker: 'natsumi', text: '父母出事之後你們突然回來住進那棟屋子，我每天都像看見十年前的火又燒起來一樣！我拼命催你們轉學、幫你們聯絡東京的姑姑、送茶送手電筒——' }
      ],
      next: 'sc_23'
    },

    sc_23: {
      id: 'sc_23',
      sceneTitle: '閃回・暴雨簷下的贖罪',
      cg: 'cg_shrine_confront',
      lines: [
        { speaker: 'natsumi', text: '我以為只要把你們兄妹「安全送回正軌」，我欠你們家的債就算還清了……其實我只是自私地想把你們送離我的視線，好讓我自己睡得著覺而已！' }
      ],
      next: 'sc_24'
    },

    sc_24: {
      id: 'sc_24',
      sceneTitle: '閃回・暴雨簷下的贖罪',
      cg: 'cg_shrine_confront',
      lines: [
        { speaker: 'narrator', text: '她把那封紅蠟印信遞到我面前，眼底沒有半點平時那種居高臨下的熱心，只剩狼狽。我接過信封時，手裡比剛才在堤防上還重。' }
      ],
      next: 'sc_27'
    },

    sc_25: {
      id: 'sc_25',
      sceneTitle: '閃回・未拆的信封',
      bg: 'bg_shrine',
      sfx: 'wind_chime',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '夏實愣在原地看著我彎腰撿起聯絡單。她原本按在胸前口袋的手悄悄鬆開，像把什麼沉重的東西又塞回了深處。' },
        { speaker: 'natsumi', text: '……對不起，悠真。謝謝你沒有追問下去。' }
      ],
      next: 'sc_26'
    },

    sc_26: {
      id: 'sc_26',
      sceneTitle: '閃回・未拆的信封',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '屋簷上方的玻璃風鈴被濕風撞響。夏實把時刻表交到我手裡時，我看見她肩頭明顯鬆了一口氣——那是連她自己都沒察覺的僥倖。' },
        { speaker: 'narrator', text: '那天晚上我提著兩包雜貨走回老宅，沒過多久，全村便在大暴雨裡斷了電。' }
      ],
      next: 'sc_27'
    },

    // =========================================================================
    // 【Act III：回到現在・第四天深夜三方攤牌】（sc_27 ~ sc_35，11 節點）
    // =========================================================================
    sc_27: {
      id: 'sc_27',
      sceneTitle: '現在・三方對峙',
      bg: 'bg_nightroom_blackout',
      bgm: 'tension_secret',
      sfx: 'heartbeat',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '記憶與雨夜重新重合。手電筒的最後一絲餘光閃了兩下徹底熄滅，門廊陷入只剩窗外雨氣的暗影裡。' },
        { speaker: 'narrator', text: '我低頭看著手裡的協議書碎片，再抬眼看面前這兩個人——沒有一個人是無辜的。' }
      ],
      next: 'sc_28'
    },

    sc_28: {
      id: 'sc_28',
      sceneTitle: '現在・三方對峙',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'idle', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'yuma', text: '手電筒的另一顆電池，從昨晚就躺在妳的衣袋裡吧，琴理。' },
        { speaker: 'narrator', text: '琴理沒有急著否認，只是輕輕把手伸進口袋摸了一下，發出極微弱的金屬輕碰聲。' },
        { speaker: 'kotori', text: '如果屋裡沒有燈，外頭又停電，悠真就只能待在房間裡陪我等天亮……這樣不對嗎？' }
      ],
      next: 'sc_29'
    },

    sc_29: {
      id: 'sc_29',
      sceneTitle: '現在・三方對峙',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'right' }
      ],
      lines: [
        { speaker: 'natsumi', text: '琴理，妳把文件撕掉又拆掉電池，只會把悠真一起拖進這個死胡同——' },
        { speaker: 'kotori', text: '那夏實妳呢？從第一天開始就不停送麥茶、送聯絡單、急著替我們聯絡東京的親戚……妳真的只是怕我們沒書唸嗎？' }
      ],
      next: 'sc_30'
    },

    sc_30: {
      id: 'sc_30',
      sceneTitle: '現在・三方對峙',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '夏實的呼吸一窒，下意識抓住玄關門框。' },
        {
          condition: function (s) { return s.flag_knows_fire === true; },
          truthy: {
            speaker: 'yuma',
            text: '十年前這棟屋子燒掉偏廂的那場火，夏實剛才已經在神社告訴我了。琴理，她急著送走我們，是因為看見我們就會想起宮代家的債。'
          },
          falsy: {
            speaker: 'yuma',
            text: '別吵了。這裡沒有誰是真的毫無私心——包括我自己。'
          }
        }
      ],
      next: 'sc_31'
    },

    sc_31: {
      id: 'sc_31',
      sceneTitle: '現在・三方對峙',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        {
          condition: function (s) { return s.flag_knows_fire === true; },
          truthy: {
            speaker: 'natsumi',
            text: '……是啊，我就是想把你們安全送回學校，好讓我自己這十年的罪惡感有地方放。就算這樣，總比兩個人關在沒有光的屋子裡好吧！'
          },
          falsy: {
            speaker: 'natsumi',
            text: '……我只是想讓事情回到正軌而已。悠真，明天九點之前，你到底要不要出門？'
          }
        }
      ],
      next: 'sc_32'
    },

    sc_32: {
      id: 'sc_32',
      sceneTitle: '現在・三方對峙',
      bgm: 'climax_choice',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '協議書的撕角還在指縫裡發皺。琴理盯著我沒移開半寸，夏實捏著新電池的手停在半空。' },
        { speaker: 'kotori', text: '悠真……你今天只要踏出玄關一步，明天就輪到姑姑來接我了。你要我跟你一起出去，還是要我留著？' }
      ],
      next: 'sc_33'
    },

    sc_33: {
      id: 'sc_33',
      sceneTitle: '現在・三方對峙',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '房間暗得看不清兩人的表情，只剩雨滴從屋簷砸進水窪的節拍。' }
      ],
      choices: [
        {
          label: '把夏實推回門廊外，拉上木門插死門栓：「外面的善意我們背不起。琴理，不用管九月了。」',
          effects: { trust: 2, bond: -2, flag_final_choice: 'seal' },
          resonance: 'dependency',
          next: 'sc_34a'
        },
        {
          label: '接過夏實手裡的電池與聯絡單：「我明天去報到。如果妳不肯跨過門檻，那我先走。」',
          effects: { bond: 2, trust: -2, flag_final_choice: 'leave' },
          resonance: 'outsideBond',
          next: 'sc_34b'
        },
        {
          label: '把協議書放上矮桌：「我留著妳是因為我自己怕輸、怕被拋下。明天我會出門——這一次我不替妳選，妳自己決定跟不跟上。」',
          effects: { truth: 2, bond: 1, flag_final_choice: 'open' },
          resonance: 'truth',
          next: 'sc_34c'
        }
      ]
    },

    sc_34a: {
      id: 'sc_34a',
      sceneTitle: '現在・落栓之夜',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '木門合攏把夏實的呼喚切在外面，黃銅門栓「喀」地扣到底。琴理慢慢從口袋摸出那顆被她藏了一整天的電池，放進我手心。' },
        { speaker: 'kotori', text: '……現在可以不用看任何人的臉色了，悠真。' }
      ],
      next: 'sc_35'
    },

    sc_34b: {
      id: 'sc_34b',
      sceneTitle: '現在・分道之夜',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '夏實手裡的電池塞進我掌心，冰涼得像塊鐵。琴理往後退進暗處，沒有拉我的衣袖，只是輕輕點了點頭。' },
        { speaker: 'kotori', text: '嗯。原來只要先走的人是你，就不算背叛了呀。' }
      ],
      next: 'sc_35'
    },

    sc_34c: {
      id: 'sc_34c',
      sceneTitle: '現在・坦白之後',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'tense', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '和室靜了整整五秒。夏實不知何時收起了原本急著遞過來的聯絡單，退到門檻外沒再催促；琴理盯著桌上那半張被我攤平的協議書，指尖微微發抖。' },
        { speaker: 'kotori', text: '……你把責任全部推回來給我，好狡猾啊，悠真。' }
      ],
      next: 'sc_35'
    },

    sc_35: {
      id: 'sc_35',
      sceneTitle: '現在・黎明前夕',
      clearChars: true,
      sfx: 'cicada_ambience',
      lines: [
        { speaker: 'narrator', text: '凌晨四點半，雨勢終於轉弱。走廊盡頭木窗的縫隙裡，滲進第一縷微冷的灰藍天光。' }
      ],
      next: 'node_router'
    },

    // =========================================================================
    // 【終局判定分流器】（node_router）
    // =========================================================================
    node_router: {
      id: 'node_router',
      isRouter: true,
      route: function (s) {
        if (
          s.flag_knows_fire === true &&
          s.flag_admitted_weakness === true &&
          s.flag_final_choice === 'open' &&
          s.bond >= 4 &&
          s.trust <= 3
        ) {
          return 'sc_end_dawn_01';
        }
        if (
          (s.flag_final_choice === 'seal' && s.trust >= 4) ||
          (s.trust >= 5 && s.trust > s.bond)
        ) {
          return 'sc_end_sealed_01';
        }
        if (
          (s.flag_final_choice === 'leave' && s.bond >= 4) ||
          (!s.flag_knows_fire && s.bond >= 5 && s.bond > s.trust)
        ) {
          return 'sc_end_breeze_01';
        }
        return 'sc_end_cicada_01';
      }
    },

    // =========================================================================
    // 【結局 C：ending_dawn — 夏末彼岸的微光】（sc_end_dawn_01 ~ sc_end_dawn_05）
    // =========================================================================
    sc_end_dawn_01: {
      id: 'sc_end_dawn_01',
      sceneTitle: '終章・雨歇的緣廊',
      bg: 'bg_oldhouse',
      bgFilter: 'filter-dawn',
      bgm: 'title_breeze',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '五點十分，我把昨晚掉在桌角的玄關鑰匙放進書包。推開外側雨戶時，潮濕的杉木葉氣味瞬間灌滿走廊。' },
        { speaker: 'narrator', text: '琴理站在門檻邊停了兩秒，伸手把那枚還剩一格電的舊手電筒擺回佛壇抽屜，自己踩上帆布鞋。' }
      ],
      next: 'sc_end_dawn_02'
    },

    sc_end_dawn_02: {
      id: 'sc_end_dawn_02',
      sceneTitle: '終章・雨歇的緣廊',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'kotori', text: '我還是沒辦法立刻喜歡東京的姑姑……也不想原諒那場火。' },
        { speaker: 'yuma', text: '沒人要妳原諒。先把轉學單交了，剩下的，妳想留在這兒或回東京，下週再自己決定。' }
      ],
      next: 'sc_end_dawn_03'
    },

    sc_end_dawn_03: {
      id: 'sc_end_dawn_03',
      sceneTitle: '終章・夏末彼岸的微光',
      cg: 'cg_dawn_horizon',
      bgFilter: 'filter-dawn',
      sfx: 'wind_chime',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '晨風沿著緣廊吹散屋裡的悶氣，屋角的玻璃風鈴清脆地撞響一聲。琴理沒有伸手拉住我的袖口，只是看著東方剛翻亮的山脊線，眼眶微紅地輕輕吐出一口氣。' },
        { speaker: 'kotori', text: '……外頭的風，原來比房間裡還要吵啊。' }
      ],
      next: 'sc_end_dawn_04'
    },

    sc_end_dawn_04: {
      id: 'sc_end_dawn_04',
      sceneTitle: '終章・夏末彼岸的微光',
      bg: 'bg_shrine',
      bgFilter: 'filter-dawn',
      chars: [
        { id: 'kotori', outfit: 'white_sundress', expr: 'idle', pos: 'left' },
        { id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '經過神社石階口時，早早站在那兒的夏實看見並肩走過來的我們，手裡的掃帚差點滑脫。她沒有說「太好了」，只是把昨晚那封紅蠟印信伸過來。' },
        { speaker: 'natsumi', text: '這封信……你們看過之後如果想丟掉，也沒關係。' },
        { speaker: 'kotori', text: '先留著吧。至少下次停電的時候，我們不會再連電池都少一顆了。' }
      ],
      next: 'sc_end_dawn_05'
    },

    sc_end_dawn_05: {
      id: 'sc_end_dawn_05',
      sceneTitle: '結局 C・夏末彼岸的微光',
      cg: 'cg_dawn_horizon',
      bgFilter: 'filter-dawn',
      bgm: 'title_breeze',
      sfx: 'wind_chime',
      clearChars: true,
      ending: 'ending_dawn',
      lines: [
        { speaker: 'narrator', text: '通往村口的碎石坡道上，琴理走快了兩步，鞋跟在石階上敲出兩道不再重疊的節拍。遠處公車進站的煞車聲穿過林梢傳來，而屋簷下的風鈴又輕輕晃了一下。' }
      ]
    },

    // =========================================================================
    // 【結局 A：ending_sealed — 繭中之夏】（sc_end_sealed_01 ~ sc_end_sealed_04）
    // =========================================================================
    sc_end_sealed_01: {
      id: 'sc_end_sealed_01',
      sceneTitle: '結局 A・門栓之內',
      bg: 'bg_oldhouse',
      bgFilter: 'filter-sealed',
      bgm: 'tension_secret',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '上午八點半，竹籬笆外傳來塑膠袋摩擦木柱的聲響，接著是夏實壓低嗓音喊了兩次我的名字。沒人回應，十幾分鐘後腳步聲踩著碎石走遠。' },
        { speaker: 'narrator', text: '我拔掉玄關門鈴的細電線，將最後一扇能看見馬路的木窗也插上插銷。' }
      ],
      next: 'sc_end_sealed_02'
    },

    sc_end_sealed_02: {
      id: 'sc_end_sealed_02',
      sceneTitle: '結局 A・門栓之內',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '桌上的舊鬧鐘在昨夜停電時卡在兩點十四分，我們誰也沒有去換電池。琴理替我倒了半杯已經涼透的麥茶，杯壁上的水珠滑在榻榻米上。' },
        { speaker: 'kotori', text: '門外頭的聲音，聽起來好像變得很遠很遠了呢。' }
      ],
      next: 'sc_end_sealed_03'
    },

    sc_end_sealed_03: {
      id: 'sc_end_sealed_03',
      sceneTitle: '結局 A・繭中之夏',
      cg: 'cg_sealed_window',
      bgFilter: 'filter-sealed',
      bgm: 'twilight_memory',
      sfx: 'heartbeat',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '緊閉的木格障子只透進一層暗淡的琥珀餘暉，塵埃在空氣裡幾乎靜止。琴理閉上眼睛將重量靠上我的右肩，呼吸平穩得像睡著了一樣。' },
        { speaker: 'kotori', text: '這樣就沒有任何人，能把我們分開了……對吧，悠真。' }
      ],
      next: 'sc_end_sealed_04'
    },

    sc_end_sealed_04: {
      id: 'sc_end_sealed_04',
      sceneTitle: '結局 A・繭中之夏',
      cg: 'cg_sealed_window',
      bgFilter: 'filter-sealed',
      sfx: 'cicada_ambience',
      ending: 'ending_sealed',
      lines: [
        { speaker: 'narrator', text: '我輕輕應了一聲。口袋裡，那半張從佛壇抽屜抽出來、已經被手汗揉皺的協議書正緊貼著掌心發熱，而誰都沒有再伸手去摸玄關的門把。' }
      ]
    },

    // =========================================================================
    // 【結局 B：ending_breeze — 風鈴與未竟的告別】（sc_end_breeze_01 ~ sc_end_breeze_04）
    // =========================================================================
    sc_end_breeze_01: {
      id: 'sc_end_breeze_01',
      sceneTitle: '結局 B・單程車票',
      bg: 'bg_oldhouse',
      bgFilter: 'filter-breeze',
      bgm: 'twilight_memory',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', outfit: 'white_sundress', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '早晨七點，我把填妥的轉校表折進書包夾層。琴理沒有跨下玄關的泥土地，只站在木階上替我把歪掉的書包背帶順平。' },
        { speaker: 'kotori', text: '去鎮上辦完手續之後……晚餐前會回來嗎？' },
        { speaker: 'yuma', text: '會。門鎖好，別去開陌生人的門。' }
      ],
      next: 'sc_end_breeze_02'
    },

    sc_end_breeze_02: {
      id: 'sc_end_breeze_02',
      sceneTitle: '結局 B・單程車票',
      bg: 'bg_embankment',
      bgFilter: 'filter-breeze',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '堤防站牌底下，夏實已經幫我買好早班車票，眼底浮著明顯熬夜後的青影，語氣卻像核對完最後一項清單般輕鬆。' },
        { speaker: 'natsumi', text: '琴理那邊你別擔心，下午沒課的時候我會繞去門廊放一點熱湯跟日用品。能先跨出第一步就已經很好了。' }
      ],
      next: 'sc_end_breeze_03'
    },

    sc_end_breeze_03: {
      id: 'sc_end_breeze_03',
      sceneTitle: '結局 B・風鈴與未竟的告別',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '遠處公車按了一聲短喇叭。夏實揮手催我上車時，指尖下意識將口袋裡某個厚實的方形信封又往深處按了按。' },
        { speaker: 'natsumi', text: '到了學校記得傳簡訊報平安喔，悠真！' }
      ],
      next: 'sc_end_breeze_04'
    },

    sc_end_breeze_04: {
      id: 'sc_end_breeze_04',
      sceneTitle: '結局 B・風鈴與未竟的告別',
      cg: 'cg_epilogue',
      bgFilter: 'filter-breeze',
      sfx: 'wind_chime',
      clearChars: true,
      ending: 'ending_breeze',
      lines: [
        { speaker: 'narrator', text: '車窗外，杉木林後的老宅屋頂一點一點縮進山霧裡。書包夾層裡留著夏實給的公車時刻表，而佛壇底層抽屜裡那半張沒找齊的協議書，還靜靜壓在線香盒下面。' }
      ]
    },

    // =========================================================================
    // 【結局 D：ending_cicada — 空殼與殘響】（sc_end_cicada_01 ~ sc_end_cicada_05）
    // =========================================================================
    sc_end_cicada_01: {
      id: 'sc_end_cicada_01',
      sceneTitle: '結局 D・三吋門縫',
      bg: 'bg_oldhouse',
      bgFilter: 'filter-cicada',
      bgm: 'tension_secret',
      sfx: 'door_slide',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '清晨六點醒來時，玄關紙門開著三吋寬的縫，冷風從縫隙灌進和室。對面那床被褥疊得方方正正，上頭整齊壓著兩件東西。' },
        { speaker: 'narrator', text: '一顆從手電筒拆下來的電池，以及那張被從中撕開的轉校與撫養權協議書——另一半不見了。' }
      ],
      next: 'sc_end_cicada_02'
    },

    sc_end_cicada_02: {
      id: 'sc_end_cicada_02',
      sceneTitle: '結局 D・三吋門縫',
      lines: [
        { speaker: 'narrator', text: '玄關木架少了一雙帆布鞋。桌角放著昨晚那杯已經長出細塵的冷麥茶，杯底壓著一張沒有署名的短箋：「你連自己為什麼回來都說不清楚。」' }
      ],
      next: 'sc_end_cicada_03'
    },

    sc_end_cicada_03: {
      id: 'sc_end_cicada_03',
      sceneTitle: '結局 D・空殼與殘響',
      bg: 'bg_embankment',
      bgFilter: 'filter-cicada',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'serious', pos: 'center' }],
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '我一路跑上河岸堤防，只聽見平交道警示鈴剛落下的「噹」一聲。夏實拎著沒送出去的早點袋站在石階底下，視線望向已經空蕩蕩的鐵道。' },
        { speaker: 'natsumi', text: '二十分鐘前她背著袋子經過鳥居前……我追上去問她要去哪，她只說東京那邊本來就有人願意收留她。' }
      ],
      next: 'sc_end_cicada_04'
    },

    sc_end_cicada_04: {
      id: 'sc_end_cicada_04',
      sceneTitle: '結局 D・空殼與殘響',
      chars: [{ id: 'natsumi', outfit: 'summer_casual', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'natsumi', text: '悠真，昨晚你最後到底跟她說了什麼？為什麼你們兩個……誰都沒有留下來？' },
        { speaker: 'narrator', text: '我張開嘴，掌心還攥著昨晚那顆冰冷的電池，喉嚨裡卻發不出半點聲音。' }
      ],
      next: 'sc_end_cicada_05'
    },

    sc_end_cicada_05: {
      id: 'sc_end_cicada_05',
      sceneTitle: '結局 D・空殼與殘響',
      cg: 'cg_epilogue',
      bgFilter: 'filter-cicada',
      bgm: 'twilight_memory',
      sfx: 'cicada_ambience',
      clearChars: true,
      ending: 'ending_cicada',
      lines: [
        { speaker: 'narrator', text: '回到老宅時，太陽已經爬過山脊。敞開的緣廊紗門邊掛著一具昨夜被風吹進來的透明蟬蛻，在晨風裡輕輕晃了兩下，落到木地板上。' }
      ]
    }
  };

  function resolveNodeLines(node, gameState) {
    if (!node || !Array.isArray(node.lines)) return [];
    return node.lines.map(function (entry) {
      if (typeof entry.condition === 'function') {
        return entry.condition(gameState) ? entry.truthy : entry.falsy;
      }
      return entry;
    });
  }

  function applyEffects(gameState, effects) {
    if (!effects) return 'none';
    let resonance = 'none';
    Object.keys(effects).forEach(function (key) {
      const val = effects[key];
      if (typeof val === 'number') {
        gameState[key] = Math.max(0, (gameState[key] || 0) + val);
        if (key === 'truth' && val > 0) {
          resonance = 'truth';
        } else if ((key === 'bond' || key === 'outsideBond') && val >= 2 && resonance === 'none') {
          resonance = 'outsideBond';
        } else if ((key === 'trust' || key === 'dependency') && val >= 2 && resonance === 'none') {
          resonance = 'dependency';
        }
      } else {
        gameState[key] = val;
        if (key === 'flag_knows_fire' || key === 'flag_admitted_weakness') {
          resonance = 'truth';
        } else if (key === 'flag_hid_papers' && val && resonance === 'none') {
          resonance = 'dependency';
        } else if (key === 'flag_final_choice') {
          if (val === 'open') resonance = 'truth';
          else if (val === 'leave') resonance = 'outsideBond';
          else if (val === 'seal') resonance = 'dependency';
        }
      }
    });
    return resonance;
  }

  global.VN_SCRIPT = {
    ASSETS: ASSETS,
    SPEAKER_NAMES: SPEAKER_NAMES,
    CG_META: CG_META,
    ENDINGS_META: ENDINGS_META,
    NODES: NODES,
    createInitialGameState: createInitialGameState,
    resolveNodeLines: resolveNodeLines,
    applyEffects: applyEffects
  };
})(window);
