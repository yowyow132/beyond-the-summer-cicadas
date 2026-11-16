/**
 * 《夏末蟬鳴的彼岸》（Beyond the Summer Cicadas）v2.0
 * 深度心理向視覺小說劇本：雙生共依存、心理邊界試探與十年前的河堤真相（全 71 個劇情節點，含 6 張事件 CG）
 */
(function (global) {
  'use strict';

  const ASSETS = {
    backgrounds: {
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
      chapter: 'CG 01・第二日驟雨午後',
      title: '夏雨與微溫的毛巾',
      quote: '要是這場雨永遠不停，別人就進不來這間屋子裡了。',
      caption: '暴雨在敞開的木格拉門外洗起霧藍水氣，小檯燈在榻榻米暈開一片暖光。面對面跪坐著按乾琴理微濕的銀白長髮時，她攥緊毛巾泛紅仰望的眼波，讓悠真察覺心底一絲晦暗的寬慰。',
      hint: '推進至第二日午後驟雨場景即可自動解鎖。'
    },
    {
      id: 'cg_night_embrace',
      chapter: 'CG 02・第三日深夜月光',
      title: '月光下的越界依偎',
      quote: '如果你哪天也覺得我們很奇怪，那明天就把所有的窗都鎖起來好不好？',
      caption: '凌晨兩點的月光穿過格子窗，將相鄰的被褥照得一片冷藍。琴理貼近肩頭的顫抖與眼淚，反覆拷問著「守護」與「束縛」之間的脆弱界線。',
      hint: '推進至第三日深夜臥室試探劇情即可自動解鎖。'
    },
    {
      id: 'cg_shrine_confront',
      chapter: 'CG 03・第四日暴雨河堤',
      title: '驟雨堤防與十年的告白',
      quote: '這封舊信跟木牌護符，是我整整十年都沒能還清的債。',
      caption: '傾盆夏雨沿著神社屋簷傾瀉而下，濕透的白襯衫底下心跳清晰。夏實含淚雙手捧住那封綴著紅印的舊信，對悠真撕開十年前盂蘭盆節落水意外、大人避諱的流言，以及自己的愧疚。',
      hint: '於第四日河堤選擇面對並追問十年前的真相。'
    },
    {
      id: 'cg_sealed_window',
      chapter: 'CG 04・ENDING A 專屬插畫',
      title: '永遠止步的八月房間',
      quote: '木門扣緊之後，再也沒有風聲能動搖我們的夏天。',
      caption: '緊閉上鎖的木門與暈著微暗餘暉的障子窗內，塵埃在空氣裡安靜沉浮。身穿和式作務衣的悠真任由琴理倚在肩頭安然閉眼，時間彷彿真的靜止在只有兩人的避風港。',
      hint: '達成結局 A《繭中之夏》即可解鎖。'
    },
    {
      id: 'cg_dawn_horizon',
      chapter: 'CG 05・ENDING C 專屬插畫',
      title: '推開木門後的微風',
      quote: '不是為了逃離誰才躲在門後，而是為了終有一天能各自站在陽光裡。',
      caption: '暴風雨散盡的夏末破曉，緣廊外群山染上粉金晨曦、玻璃風鈴輕輕晃響。銀白長髮在晨風中揚起的琴理含淚露出淺笑，迎向九月的真實陽光。',
      hint: '達成結局 C《夏末彼岸的微光（True End）》即可解鎖。'
    },
    {
      id: 'cg_epilogue',
      chapter: 'CG 06・彼岸風景',
      title: '夏末薄暮與九月遠方',
      quote: '無論門開或閉，八月的蟬鳴終究會停在身後的山林裡。',
      caption: '站在遠野村高處眺望鐵道與小鎮晨光，見證兄妹或前行、或錯身後的最後一面夏天。',
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
      quote: '蟬鳴終將停歇在八月的彼岸；而我們終於不必靠窒息的距離來確認彼此還活著。',
      summary: '在河堤暴雨裡得知十年前落水與父母連夜離村的真相後，悠真不再假裝自己只是無私的保護者，而是向琴理坦承了自己同樣害怕失去依靠的怯懦。當所有陰影攤開在晨光下，兄妹共同推開走廊木門，與夏實和解後並肩迎向九月。',
      keywords: ['十年前真相', '承認自身軟弱', '重塑健康界線'],
      hint: '追問夏實十年前的往事，向琴理誠實揭開自己的逃避與軟弱，並選擇推開木門。'
    },
    {
      id: 'ending_breeze',
      code: 'ENDING B',
      title: '風鈴與未竟的告別',
      badge: 'Normal End',
      cgId: 'cg_epilogue',
      filterClass: 'filter-breeze',
      quote: '你一個人先走進了九月的風裡，卻把一半說不出口的愧疚留在老屋門縫間。',
      summary: '悠真決定遞交轉學手續並響應夏實的善意，試圖獨自拉開與妹妹過度黏著的距離；然而未曾真正掀開的十年前舊傷讓琴理選擇退回門後守候，只剩神社風鈴替這場單方面的成長留下無聲歎息。',
      keywords: ['嘗試獨立', '夏實的陪伴', '未能共赴的傷痕'],
      hint: '傾向走入外界與鎮立高中，但未同時解開琴理心底的結或未查明十年前全貌。'
    },
    {
      id: 'ending_sealed',
      code: 'ENDING A',
      title: '繭中之夏',
      badge: 'Closed End',
      cgId: 'cg_sealed_window',
      filterClass: 'filter-sealed',
      quote: '門栓落下之後，外頭所有帶刺的眼光與流言，都再也碰不到我們了。',
      summary: '面對村落的流言、轉學通知的逼迫與內心深處「不想被分開」的恐懼，悠真親手將最後一扇雨戶關緊上鎖。兄妹把來電斷絕、將九月擋在屋簷之外，在昏暗而令人上癮的靜謐裡永遠依偎。',
      keywords: ['緊閉雨戶', '雙生共依存', '停止的時間'],
      hint: '多次配合琴理把外界善意與通知擋在門外，順從彼此共依存的安穩錯覺。'
    },
    {
      id: 'ending_cicada',
      code: 'ENDING D',
      title: '空殼與殘響',
      badge: 'Bitter End',
      cgId: 'cg_epilogue',
      filterClass: 'filter-cicada',
      quote: '半途而廢的溫柔與逃避追問的膽怯，最終只換來清晨窗縫裡一具透明的空殼。',
      summary: '既不敢徹底關上門與琴理一同墜入封閉，又在關鍵時刻避開了十年前的真相，反覆動搖的態度讓琴理讀出了悠真眼裡的遲疑。暴雨過後的清晨，和室只剩整齊疊好的被褥與不再回頭的遠去列車聲。',
      keywords: ['猶疑動搖', '迴避過去', '失落的黎明'],
      hint: '在守護妹妹與迎向外界之間反覆搖擺，且錯失或迴避追問十年前河堤真相。'
    }
  ];

  function createInitialGameState() {
    return {
      dependency: 1,
      outsideBond: 0,
      truth: 0,
      flag_opened_shutters: false,
      flag_met_shrine_d2: false,
      flag_hid_notice: false,
      flag_knows_truth: false,
      flag_confronted_kotori: false
    };
  }

  const NODES = {
    // =========================================================================
    // 【序章・第一日：歸返與密封的空氣】（sc_01 ~ sc_14）
    // =========================================================================
    sc_01: {
      id: 'sc_01',
      sceneTitle: '序幕・歸返與蟬聲',
      bg: 'bg_oldhouse',
      clearChars: true,
      bgm: 'title_breeze',
      sfx: 'cicada_ambience',
      lines: [
        { speaker: 'narrator', text: '八月下旬的遠野村，悶熱得像一張沒晾乾便貼在皮膚上的和紙。公車在村口石牌前捲起塵灰離去後，只剩我和琴理並肩站在外公留下的這棟木造老宅前。' },
        { speaker: 'narrator', text: '父母發生意外的那場深夜暴雨，算起來也不過才過了兩個月。懷裡紙箱還帶著東京公寓冷氣房的清潔劑味，推開門後迎面而來的，卻是幾年無人居住的榻榻米黴味與淡淡檀香。' },
        { speaker: 'narrator', text: '打從公車上開始，前排幾位提著菜籃的老婦人便頻頻回頭看我們——一對只穿著素淨無華的白色連身夏裙與簡樸襯衫、神情卻像還浸在喪期陰翳裡的雙胞胎兄妹。' }
      ],
      next: 'sc_02'
    },

    sc_02: {
      id: 'sc_02',
      sceneTitle: '序幕・歸返與蟬聲',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '生鏽的庭院竹門推開時發出一聲乾澀響動。雖然面向院落的木質緣廊還敞在午後晴空下，屋簷裡頭那整排和紙紙門卻仍緊閉著。琴理貼在我身後極近的位置踏上木廊，近到我一停腳步，她的額頭幾乎就會抵上我的肩胛骨。' },
        { speaker: 'kotori', text: '……好安靜啊，悠真。沒有鄰居在隔壁走動，也沒有電車經過的震動聲。' },
        { speaker: 'yuma', text: '畢竟外公走後空了快三年。妳先在陰涼的屋簷邊歇會兒，我去拉開裡面檢查水電還能用嗎。' },
        { speaker: 'narrator', text: '可琴理沒有動，只是反手攥緊白色洋裝腰側的布料，用一種像在丈量安全距離般的眼神盯著緊閉的內室紙門。' }
      ],
      next: 'sc_03'
    },

    sc_03: {
      id: 'sc_03',
      sceneTitle: '序幕・歸返與蟬聲',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '雖然庭院外頭蟬聲喧鬧、日頭白晃晃地照著杉林，但左側這排緊閉的和紙拉門把內室遮得密不透風。琴理垂下肩站在走廊陰影邊緣，彷彿一旦拉開裡面那幾扇窗門，連家裡都會失守。' },
        { speaker: 'kotori', text: '悠真……裡面起居室的木門跟窗板，先不要全推開好不好？剛才在巷口轉角，好像有人一直往我們院子這邊看。' },
        { speaker: 'narrator', text: '她的指尖微涼，輕輕勾住我衣袖。其實我也聽見了剛才圍籬外壓低的交談聲，胸口莫名浮起一種「只要裡屋不敞開，就沒人看得到我們有多狼狽」的念頭。' }
      ],
      choices: [
        {
          label: '「還是把內室門窗拉開兩扇透氣吧。屋裡悶太久，連榻榻米都會發潮。」',
          effects: { flag_opened_shutters: true, outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_04a'
        },
        {
          label: '「……好。內室就先維持關著吧，先把裡面小燈打開就好。」',
          effects: { flag_opened_shutters: false, dependency: 1 },
          resonance: 'dependency',
          next: 'sc_04b'
        }
      ]
    },

    sc_04a: {
      id: 'sc_04a',
      sceneTitle: '序幕・歸返與蟬聲',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我伸手拉開半幅和紙拉門，從外頭走廊斜射過去的白光頓時鋪進榻榻米一角，照出飛舞的塵埃。琴理像是被光燙到般縮起細瘦肩頭，往廊柱陰影裡側了半步。' },
        { speaker: 'kotori', text: '……裡面也亮起來了。連蟬的叫聲都變得好像貼在耳朵旁邊。' },
        { speaker: 'yuma', text: '只透一點光散氣味而已，覺得刺眼的話先去裡頭坐著吧。' }
      ],
      next: 'sc_05'
    },

    sc_04b: {
      id: 'sc_04b',
      sceneTitle: '序幕・歸返與蟬聲',
      chars: [{ id: 'kotori', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我順著她的意思維持內室木窗緊閉，只進去扭亮一盞暖黃色老式立燈。昏柔光線從紙門縫隙暈出來的一瞬，琴理極輕地呼出一口氣，彷彿終於把外面的窺視隔在了木牆之外。' },
        { speaker: 'kotori', text: '嗯……只要裡面暗暗的、門栓也扣著，不管是誰站在圍籬外面，都不可能看見我們。' }
      ],
      next: 'sc_05'
    },

    sc_05: {
      id: 'sc_05',
      sceneTitle: '第一日・黃昏堤防',
      bgm: 'summer_day',
      chars: [{ id: 'kotori', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '傍晚前，屋裡只剩下未拆封的碗盤紙箱和兩床散著樟腦丸氣味的舊被褥。我拿著零錢袋準備去村口雜貨店買米與電池，琴理卻盯著玄關那雙白色帆布鞋，遲遲沒有彎腰穿上。' },
        { speaker: 'kotori', text: '雜貨店……一定會遇到認識爸爸以前老家的人吧。我留在屋裡疊衣服就好。' },
        { speaker: 'kotori', text: '悠真，你快去快回喔。太陽下山之前一定要回來……別讓我一個人在這個房子裡等天黑。' },
        { speaker: 'narrator', text: '我看著她低頭理著我領口的模樣，竟沒辦法分辨，究竟是她離不開我，還是我心底正貪戀著「被這樣全心全意需要」的感覺。' }
      ],
      next: 'sc_06'
    },

    sc_06: {
      id: 'sc_06',
      sceneTitle: '第一日・黃昏堤防',
      bg: 'bg_embankment',
      clearChars: true,
      sfx: 'cicada_ambience',
      lines: [
        { speaker: 'narrator', text: '買完東西沿著河川堤防往回走時，西沉的太陽正把水閘下方濁重的河流染成暗銅色。長滿青苔的混凝土護岸邊，幾株提早抽穗的白芒草被熱風壓得低低的。' },
        { speaker: 'narrator', text: '我拎著塑膠袋在石階前停住腳步。眼前的水閘明明陌生得像別人的風景，耳膜卻突然毫無預兆地一陣發悶——彷彿十年前也曾有一個快下雨的黃昏，有誰的鞋就掉在這條石階上。' }
      ],
      next: 'sc_07'
    },

    sc_07: {
      id: 'sc_07',
      sceneTitle: '第一日・黃昏堤防',
      chars: [{ id: 'natsumi', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '石階上方傳來腳踏車手煞車輕巧咬合的聲音。一位綁著側馬尾、身上帶著淡雅梔子花洗衣精與淡淡神社線香味道的女生撐著地面停下，先是怔怔盯著我的輪廓看了好幾秒，隨即猛地睜圓了眼睛。' },
        { speaker: 'natsumi', text: '……等一下。這個眉眼……難道你是小鳥遊家的……悠真？' },
        { speaker: 'yuma', text: '……妳是宮代神社的，夏實？' }
      ],
      next: 'sc_08'
    },

    sc_08: {
      id: 'sc_08',
      sceneTitle: '第一日・黃昏堤防',
      chars: [{ id: 'natsumi', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'natsumi', text: '真的是你！前幾天村公所的人說外公老宅重新申請水電復表，我還以為只是遠房親戚來看屋……葬禮的事我也從外公那裡聽說了，你們兩個還好嗎？' },
        { speaker: 'narrator', text: '她的笑容像夏末午後沒被烏雲遮住的一塊晴空，可說話時目光卻不自覺越過我肩膀，朝後頭空蕩蕩的柏油路望去。' },
        { speaker: 'natsumi', text: '那……琴理呢？她沒跟你一起出來買東西嗎？' }
      ],
      choices: [
        {
          label: '「她還在適應這邊，不喜歡被人盯著看，所以先讓她待在屋裡。」',
          effects: { dependency: 1 },
          resonance: 'none',
          next: 'sc_09a'
        },
        {
          label: '「嗯，剛整理完行李讓她先休息。這段時間還請妳多照應了。」',
          effects: { outsideBond: 1 },
          resonance: 'none',
          next: 'sc_09b'
        }
      ]
    },

    sc_09a: {
      id: 'sc_09a',
      sceneTitle: '第一日・黃昏堤防',
      chars: [{ id: 'natsumi', expr: 'serious', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '「待在屋裡」四個字剛落，夏實眼底的亮光明顯暗了半拍。她垂下視線看向橋墩下湍急的水流，聲音輕得像怕被河風聽見。' },
        { speaker: 'natsumi', text: '這樣啊……過了這麼多年，她還是跟以前一樣，只肯待在伸手就碰得到你的地方嗎。' }
      ],
      next: 'sc_10'
    },

    sc_09b: {
      id: 'sc_09b',
      sceneTitle: '第一日・黃昏堤防',
      chars: [{ id: 'natsumi', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'natsumi', text: '別這麼生分啦，以前放學不也常常一起在這條堤防上分冰棒吃嗎。要是屋子裡悶得慌，隨時帶琴理上神社納涼吧。' },
        { speaker: 'narrator', text: '她語氣輕快，指節卻緊緊扣著車把，像是為了掩飾那句遲來十年的邀請背後說不出口的心虛。' }
      ],
      next: 'sc_10'
    },

    sc_10: {
      id: 'sc_10',
      sceneTitle: '第一日・黃昏堤防',
      bgm: 'twilight_memory',
      chars: [{ id: 'natsumi', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '夏實彎腰從車籃裡拿出一小袋冰涼的麥茶包塞進我手裡，指尖微微一頓後，又從深藍百褶裙側袋摸出一枚繫著褪色紅繩、背面寫著宮代神社舊編號的木牌護符，一併壓進我的掌心。' },,
        { speaker: 'narrator', text: '暮色把兩人的影子在斜坡上拉得老長。遠處兩名提著菜籃的村婦走過，視線在我拎著雜貨的手跟夏實車籃間來回掃了一圈，隨即壓低嗓音交談著走遠。' },
        { speaker: 'natsumi', text: '……遠野村很小，什麼流言都比公車還快。這幾天如果聽到什麼不好聽的話，千萬別往心裡去。' },
        { speaker: 'natsumi', text: '麥茶拿回去冰著喝，至於那塊舊木牌……就當作我先借給你們的平安護符。哪天想找個安靜地方透氣，就拿著它上宮代神社找我還吧。' }
      ],
      next: 'sc_11'
    },

    sc_11: {
      id: 'sc_11',
      sceneTitle: '第一日・夏夜和室',
      bg: 'bg_oldhouse',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '推開老宅木門時，門廳裡沒有開大燈，只亮著一盞孤零零的橘黃檯燈。琴理抱着膝蓋坐在玄關門檻內側，聽見門響便立刻抬頭，視線先落在我的臉上，再精準滑到左手提著的牛皮紙麥茶袋上。' },
        { speaker: 'kotori', text: '……慢了二十分鐘喔，悠真。你在堤防那邊，跟誰站在風裡說話了？' },
        { speaker: 'yuma', text: '遇到神社的宮代夏實。妳還記得她嗎？小時候常在石階邊遇見的那個女生，這是她拿給我們的麥茶。' },
        { speaker: 'narrator', text: '琴理默默接過麥茶袋放上流理台，湊近了我領口半寸輕輕嗅了一下，眼底沒有溫度地垂下來。' },
        { speaker: 'kotori', text: '……身上沾到別人家女孩那種很甜的洗衣精味道了。明天記得把這件襯衫脫下來洗掉。' }
      ],
      next: 'sc_12'
    },

    sc_12: {
      id: 'sc_12',
      sceneTitle: '第一日・夏夜和室',
      bg: 'bg_nightroom',
      bgm: 'twilight_memory',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '夜深之後，蟬聲退去，草叢裡換成秋蟲低低聒噪。我們在榻榻米鋪好兩床並排的被褥，中間只隔著伸長手指就能觸及的一道縫隙。' },
        { speaker: 'kotori', text: '傍晚我去院子收衣服的時候……圍籬外面那幾個阿姨停下來往裡頭看。她們說，「小鳥遊家那對雙胞胎怎麼又回來了，當年不是半夜悄悄搬走的嗎」。' },
        { speaker: 'narrator', text: '黑暗裡，她的聲音又輕又黏，像貼在耳廓邊散不開的夜霧。' }
      ],
      next: 'sc_13'
    },

    sc_13: {
      id: 'sc_13',
      sceneTitle: '第一日・夏夜和室',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'center' }],
      sfx: 'heartbeat',
      lines: [
        { speaker: 'kotori', text: '悠真……為什麼連我們只是站在自己家院子裡，別人都要用看什麼怪物一樣的眼神看我們？' },
        { speaker: 'kotori', text: '爸媽不在之後，我只要跟外人對上視線就覺得胃裡好噁心。是不是真的只有待在只有你的房間裡，我們才算安全……才算是正常的？' }
      ],
      choices: [
        {
          label: '「外人嘴裡的『正常』又算什麼。只要我們兩個人能撐下去就夠了。」',
          effects: { dependency: 1 },
          resonance: 'dependency',
          next: 'sc_14a'
        },
        {
          label: '「我們沒做錯任何事。別把自己關起來，明天一早我們一起出去走走。」',
          effects: { outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_14b'
        }
      ]
    },

    sc_14a: {
      id: 'sc_14a',
      sceneTitle: '第一日・夏夜和室',
      chars: [{ id: 'kotori', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '琴理在昏暗裡輕輕挪近被褥，額頭安靜地抵在我的手背旁，唇邊勾起一抹幾乎令人心疼的放鬆笑意。' },
        { speaker: 'kotori', text: '嗯……我也只想要悠真看著我就夠了。無論是大人的世界，還是那個夏實……誰都不要走進來。' }
      ],
      next: 'sc_15'
    },

    sc_14b: {
      id: 'sc_14b',
      sceneTitle: '第一日・夏夜和室',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '黑暗安靜了好幾秒。琴理沒有回嘴，只是慢慢翻過身背對著我，將棉被拉高遮過肩膀，聲音悶在枕頭裡傳來。' },
        { speaker: 'kotori', text: '……如果悠真真的想往外頭走，那不管走到哪裡，你都不許把我一個人留在背後喔。' }
      ],
      next: 'sc_15'
    },

    // =========================================================================
    // 【第二日：風鈴耳語與夏雨髮梢】（sc_15 ~ sc_27）
    // =========================================================================
    sc_15: {
      id: 'sc_15',
      sceneTitle: '第二日・風鈴與耳語',
      bg: 'bg_oldhouse',
      bgm: 'summer_day',
      sfx: 'cicada_ambience',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '第二天上午，暑氣比昨天更早爬上屋簷。我整理昨晚夏實給的麥茶袋時，再度看見擺在一旁桌角的那枚神社木牌護符——昨晚只顧著安撫琴理，差點忘了夏實刻意留下「拿回神社還我」這番話的用心。' },
        { speaker: 'narrator', text: '今天剛好得去村公所確認遷籍與高中轉學郵件，順道把木牌還回宮代神社也不算繞路。只是琴理已經換好出門穿的純白細肩帶夏裙、胸前細蝴蝶結也打得整整齊齊，一言不發地站在玄關等我。' }
      ],
      next: 'sc_16'
    },

    sc_16: {
      id: 'sc_16',
      sceneTitle: '第二日・風鈴與耳語',
      bg: 'bg_embankment',
      chars: [{ id: 'kotori', expr: 'idle', pos: 'left' }],
      lines: [
        {
          condition: (s) => s.flag_opened_shutters === true,
          truthy: { speaker: 'narrator', text: '早晨雖然沒有再攔我拉開內室拉門，走出院子後她卻仍下意識雙手抱在細瘦肩頭前，腳步始終緊貼在我左後方半步之內。' },
          falsy: { speaker: 'narrator', text: '昨天一整天待在閉緊木板的陰影裡，使她此刻在十點鐘的日光下顯得格外蒼白，細肩帶露出的雙肩在陽光下幾乎像要變得透明，才剛踏上柏油路便微微瞇起了眼睛。' }
        },
        { speaker: 'narrator', text: '經過路口公車站牌時，幾名撐著陽傘等車的婦人正好止住笑聲。她們的視線落在我與琴理緊挨著的手臂之間——「你看那對雙胞胎，聽說連去東京之後都沒分開過，門窗鎖得密不透風……」「該不會真像以前老一輩講的吧？」' }
      ],
      next: 'sc_17'
    },

    sc_17: {
      id: 'sc_17',
      sceneTitle: '第二日・風鈴與耳語',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'left' }],
      lines: [
        { speaker: 'narrator', text: '琴理的鞋尖猛地煞停在發燙的路面。她沒有回頭看那些人，卻把指關節死死扣進我的小指指縫，連指腹都在微弱發抖。' },
        { speaker: 'kotori', text: '……悠真，我們回去吧。這裡的風都是臭的，每個人看過來的眼神都好像在剝我的衣服一樣……我受不了了。' }
      ],
      next: 'sc_18'
    },

    sc_18: {
      id: 'sc_18',
      sceneTitle: '第二日・風鈴與耳語',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'left' }],
      lines: [
        { speaker: 'narrator', text: '右斜前方就是通往宮代神社的長石階，濃密杉林底下隱約傳來玻璃風鈴被風吹響的清脆餘韻。口袋裡的神社木牌護符隔著薄布料抵在掌心。' }
      ],
      choices: [
        {
          label: '「好，不去了。我現在就牽妳回家，這塊木牌改天再說。」',
          effects: { dependency: 1 },
          resonance: 'dependency',
          next: 'sc_19'
        },
        {
          label: '「妳在前面石椅陰涼處等我五分鐘，我去把木牌還給夏實立刻下來。」',
          effects: { flag_met_shrine_d2: true, outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_22'
        },
        {
          label: '「再走幾階就是神社樹蔭了，上面沒有外人又涼快，我們一起上去吧。」',
          effects: { flag_met_shrine_d2: true, outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_25'
        }
      ]
    },

    sc_19: {
      id: 'sc_19',
      sceneTitle: '第二日・緊閉室內',
      bg: 'bg_oldhouse',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我沒有再看神社那側，反手握緊琴理冰涼的手腕調頭往回走。拉上玄關木門的那一瞬，外面車聲、人聲與炙熱日光同時被木牆切斷。' }
      ],
      next: 'sc_20'
    },

    sc_20: {
      id: 'sc_20',
      sceneTitle: '第二日・緊閉室內',
      chars: [{ id: 'kotori', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '回到屋裡不到五分鐘，琴理急促的呼吸便漸漸平復。她安靜地把昨晚的冰麥茶倒進兩個帶著微細裂紋的玻璃杯裡，端到矮桌前。' },
        { speaker: 'kotori', text: '你看，外面的人根本不需要理解我們，只是喜歡找個對象說嘴而已。只有這裡……是真正不會受傷的地方。' }
      ],
      next: 'sc_21'
    },

    sc_21: {
      id: 'sc_21',
      sceneTitle: '第二日・緊閉室內',
      bgm: 'twilight_memory',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'yuma', text: '……嗯。是啊，誰也不需要進來。' },
        { speaker: 'narrator', text: '嘴上這麼答著，心底某個連我自己都不願承認的角落，竟然真的感到了久違的平靜。只是口袋裡那塊沒能還出去的木牌，仍舊沉甸甸地抵在腿側。' }
      ],
      next: 'sc_24_rain'
    },

    sc_22: {
      id: 'sc_22',
      sceneTitle: '第二日・神社初聞往事',
      bg: 'bg_shrine',
      sfx: 'wind_chime',
      chars: [{ id: 'natsumi', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '替琴理找到坡下不被路人看見的榕樹石椅坐好後，我快步爬上神社石階。境內樹蔭深處涼意襲人，屋簷下成排玻璃風鈴在風裡叮噹細響，夏實正握著竹掃帚清掃青苔上的落葉。' },
        { speaker: 'natsumi', text: '悠真？你怎麼……只有你一個人上來嗎？' },
        { speaker: 'yuma', text: '昨晚妳塞給我的那塊神社木牌，我想說今天剛好經過就順路拿上來還妳。' }
      ],
      next: 'sc_23'
    },

    sc_23: {
      id: 'sc_23',
      sceneTitle: '第二日・神社初聞往事',
      chars: [{ id: 'natsumi', expr: 'serious', pos: 'center' }],
      effects: { truth: 1 },
      resonance: 'truth',
      lines: [
        { speaker: 'narrator', text: '夏實接過木牌，指腹在邊緣被摩挲得幾乎發亮的舊字跡上停了一瞬，神色忽然緊繃起來。' },
        { speaker: 'natsumi', text: '……琴理在山下等你嗎？剛才我在郵局門口也看見那幾個長舌的阿姨了。其實十年前也是這樣……這座村子最擅長把小孩子之間的意外，扭曲成茶餘飯後的忌諱怪談。' },
        { speaker: 'yuma', text: '十年前？等等……我們小時候半夜搬去東京，不是因為爸爸調職嗎？' }
      ],
      next: 'sc_24'
    },

    sc_24: {
      id: 'sc_24',
      sceneTitle: '第二日・神社初聞往事',
      chars: [{ id: 'natsumi', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '夏實猛地咬住下唇，像意識到自己說漏了不該在這種倉促場合提起的秘密。遠處山脊忽然滾過一聲沉悶的夏雷。' },
        { speaker: 'natsumi', text: '……對不起，這件事不能在這裡兩三句糊弄過去。天快下大雷雨了——琴理一個人在坡下等太久會慌的，你先快去接她回家！' }
      ],
      next: 'sc_24_rain'
    },

    sc_25: {
      id: 'sc_25',
      sceneTitle: '第二日・風鈴閃回',
      bg: 'bg_shrine',
      sfx: 'wind_chime',
      chars: [
        { id: 'kotori', expr: 'tense', pos: 'left' },
        { id: 'natsumi', expr: 'idle', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '我握著琴理的手帶她踏上最後幾階石梯。穿過朱紅鳥居時，正仰頭調整風鈴位置的夏實聽見腳步聲回過頭，目光撞見我們緊扣著十指的姿態，整個人明顯僵在原地。' },
        { speaker: 'natsumi', text: '……琴理？好久不見了，妳……還記得我嗎？' }
      ],
      next: 'sc_26'
    },

    sc_26: {
      id: 'sc_26',
      sceneTitle: '第二日・風鈴閃回',
      sfx: 'memory_flash',
      chars: [
        { id: 'kotori', expr: 'sad', pos: 'left' },
        { id: 'natsumi', expr: 'smile', pos: 'right' }
      ],
      effects: { truth: 1 },
      resonance: 'truth',
      lines: [
        { speaker: 'narrator', text: '琴理沒有開口，反倒倏地縮進我背後，隔著我的肩膀盯著屋簷上方急促搖晃的藍白玻璃風鈴。屋後竹管引水倒進石缽的「咚」一聲回響剛落，她的指尖突然劇烈抽搐了一下。' },
        { speaker: 'kotori', text: '……水門。好冰……拉不到手。' },
        { speaker: 'yuma', text: '琴理？妳怎麼了？臉色突然這麼白——' }
      ],
      next: 'sc_27'
    },

    sc_27: {
      id: 'sc_27',
      sceneTitle: '第二日・風鈴閃回',
      chars: [
        { id: 'kotori', expr: 'tense', pos: 'left' },
        { id: 'natsumi', expr: 'serious', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '琴理像剛從冷水裡喘過氣般猛地抓緊我的袖口，把額頭死死抵在我的上臂。夏實原本伸手想把木牌和茶水遞過來的動作就那樣停在半空。' },
        { speaker: 'kotori', text: '悠真，帶我回家！這個人身上也有水邊的腥味……風鈴的聲音太吵了！' },
        { speaker: 'narrator', text: '我只能對夏實匆匆拋下一句抱歉，轉身扶著發抖的琴理快步下山。可就在走進院門前，夏末午後的豪雨毫不留情地砸了下來。' }
      ],
      next: 'sc_24_rain'
    },

    // =========================================================================
    // 【第二日午後・Event CG #1：夏雨與微溫的毛巾】（sc_24_rain ~ sc_27_after）
    // =========================================================================
    sc_24_rain: {
      id: 'sc_24_rain',
      sceneTitle: '第二日午後・雨與髮梢的界線',
      cg: 'cg_rain_hair',
      bgm: 'twilight_memory',
      sfx: 'door_slide',
      lines: [
        { speaker: 'narrator', text: '午後三點，積累了一整天的悶熱終於化作傾盆豪雨，在敞開的庭院廊門外拉起深藍色雨幕。低矮木桌上點起一盞暖黃方型小檯燈，光影正好灑在面對面跪坐在白坐墊上的兩人之間。' },
        { speaker: 'narrator', text: '琴理穿著純白細肩帶連身裙，銀白長髮鋪散在坐墊與肩頭，耳側髮梢還滴著剛才進門帶回來的涼意。她雙手輕輕捧住潔白棉毛巾的一端，我跪在身前替她將毛巾攏上臉頰邊的濕髮輕輕吸乾。' },
        { speaker: 'kotori', text: '……悠真的手好暖喔。毛巾靠在耳朵旁邊的時候，外頭打雷的聲音好像就變得好遠了。' },
        { speaker: 'narrator', text: '近到只隔著一塊軟棉毛巾的距離裡，能清楚看見她泛起薄紅的臉頰與微顫的紫灰瞳眸。她沒有低頭避開，反倒輕輕捏住毛巾另一邊仰望過來，無聲挽留著這分安靜。' }
      ],
      next: 'sc_25_rain'
    },

    sc_25_rain: {
      id: 'sc_25_rain',
      sceneTitle: '第二日午後・雨與髮梢的界線',
      cg: 'cg_rain_hair',
      sfx: 'heartbeat',
      lines: [
        { speaker: 'kotori', text: '如果這場雨能一直下到九月以後都不停就好了……那樣的話，轉學手續也好、神社那邊的誰也好，就全都沒辦法靠近這間屋子了。' },
        { speaker: 'kotori', text: '吶，悠真……我們明明只是像小時候一樣靠近彼此而已，為什麼外面那些大人，要把我們看成那麼髒、那麼奇怪的兩個人呢？' },
        { speaker: 'narrator', text: '望著她微紅臉頰上那雙帶著依賴與試探的淡紫灰眼眸，我的心口突然一緊——最令我自己感到可怕的是，在這座被大雨與紙門包圍的暖光小室裡，我的確有一瞬間希望外面的世界就此停擺。' }
      ],
      choices: [
        {
          label: '放輕動作替她擦拭髮尾，沉默地任由她拉著衣角靠在身邊。',
          effects: { dependency: 1 },
          resonance: 'dependency',
          next: 'sc_26_rain_a'
        },
        {
          label: '停下手稍微拉開半寸距離：「雨總會停的，琴理。我們不能把逃避當成習慣。」',
          effects: { outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_26_rain_b'
        }
      ]
    },

    sc_26_rain_a: {
      id: 'sc_26_rain_a',
      sceneTitle: '第二日午後・雨與髮梢的界線',
      cg: 'cg_rain_hair',
      lines: [
        { speaker: 'narrator', text: '我沒有抽回手，只是重新摺好毛巾，沿著她微涼的長髮慢條斯理地一下下吸乾水氣。琴理像得到某種默許似的輕輕吐息，攥著毛巾邊緣的指節放鬆了下來。' },
        { speaker: 'kotori', text: '嗯……只要悠真不推開我，別人怎麼看都無所謂了。' }
      ],
      next: 'sc_28'
    },

    sc_26_rain_b: {
      id: 'sc_26_rain_b',
      sceneTitle: '第二日午後・雨與髮梢的界線',
      cg: 'cg_rain_hair',
      lines: [
        { speaker: 'narrator', text: '我把毛巾交回她掌心，稍微往後坐開半個坐墊的空隙。琴理低頭看著收進懷裡的白毛巾，纖細的眉頭一點一點蹙起來。' },
        { speaker: 'kotori', text: '……悠真現在連替我擦完頭髮，都開始在意分寸了嗎？明明以前不是這樣的。' }
      ],
      next: 'sc_28'
    },

    // =========================================================================
    // 【第三日：通知單、暗湧與深夜越界試探】（sc_28 ~ sc_41）
    // =========================================================================
    sc_28: {
      id: 'sc_28',
      sceneTitle: '第三日・轉學催辦與陰影下的視線',
      bg: 'bg_oldhouse',
      bgm: 'summer_day',
      sfx: 'cicada_ambience',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '第三天清晨雨過天晴，日光刺眼得讓積水的石板路冒起白煙。我去鐵皮信箱取報紙時，在最裡層摸到了兩封紙袋——一封是鎮立高中寄來的轉學報到催辦單，另一封卻是夾在外公舊報堆底下的泛黃牛皮紙信封，收件欄寫著母親的名字，寄件處蓋著「宮代神社」。' },
        { speaker: 'narrator', text: '那封舊信封口早已受潮微張。我正要伸手打開，玄關紙門輕輕滑了一條縫——琴理赤著腳站在木走廊陰影裡，視線死死鎖在我左手那張學校公文信封上。' }
      ],
      next: 'sc_29'
    },

    sc_29: {
      id: 'sc_29',
      sceneTitle: '第三日・轉學催辦與陰影下的視線',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'kotori', text: '……還是寄來了啊。再過四天就是九月一日了。' },
        { speaker: 'kotori', text: '悠真，一旦去那間鎮立高中報到，我們就不能整天待在一起了。在教室裡的時候，那些見過我們背影的鎮上同學會怎麼問？「你妹妹為什麼不來上學」、「她是不是離不開哥哥」……光想就覺得胃在絞痛。' },
        { speaker: 'narrator', text: '她的語調沒有歇斯底里，反而冷靜得像早就在腦中演練了幾十遍。這份看似脆弱的請求裡，藏著一條幾乎令人窒息的牽引線。' }
      ],
      choices: [
        {
          label: '「……好。先把通知單鎖進抽屜吧，這幾天我不會強迫妳決定。」',
          effects: { flag_hid_notice: true, dependency: 1 },
          resonance: 'dependency',
          next: 'sc_30a'
        },
        {
          label: '「正因為拖著才可怕，琴理。這份手續我先帶著，下午要去鎮公所問清楚。」',
          effects: { flag_hid_notice: false, outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_30b'
        }
      ]
    },

    sc_30a: {
      id: 'sc_30a',
      sceneTitle: '第三日・轉學催辦與陰影下的視線',
      chars: [{ id: 'kotori', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '琴理仔細地把學校信封對摺兩次，鎖進客廳矮櫃最底層的小抽屜裡。金屬鑰匙「喀嗒」落鎖時，她露出了今天第一個安心的笑容。' },
        { speaker: 'kotori', text: '這樣就好了。只要沒人拆開，八月就永遠不會結束。' }
      ],
      next: 'sc_31_visit'
    },

    sc_30b: {
      id: 'sc_30b',
      sceneTitle: '第三日・轉學催辦與陰影下的視線',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '琴理原本伸過來想接過信封的手停在半空，一點一點蜷回身側。' },
        { speaker: 'kotori', text: '……悠真是不是已經開始覺得這棟屋子太小、覺得跟這樣沒用的我綁在一起很丟臉了？' }
      ],
      next: 'sc_31_visit'
    },

    sc_31_visit: {
      id: 'sc_31_visit',
      sceneTitle: '第三日・門縫內外的試探',
      bgm: 'twilight_memory',
      sfx: 'wind_chime',
      chars: [{ id: 'natsumi', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '午後兩點多，木柵門外突然傳來輕巧的叩門聲。夏實推著腳踏車站在熾烈日影裡，車籃放著幾顆剛井水冰鎮過的夏橘。' },
        { speaker: 'natsumi', text: '打擾了……我順路送些水果過來。那個，這棟老屋白天把木窗遮得這麼實，屋裡會不會太悶呀？' },
        { speaker: 'narrator', text: '站在玄關門階跟夏實說話時，我身後的紙門明明沒有人拉開，門縫裡卻有一雙始終沒移開的視線正靜靜貼著背脊看。夏實話沒說完，目光往暗處的玄關瞟了一眼，唇角那抹自然的笑忽然有些發苦。' },
        { speaker: 'natsumi', text: '……悠真，如果我有哪句話讓琴理不高興了，你可以直接跟我說。只是我總覺得，再這樣把窗板全關死，連你自己也會跟著窒息的。' }
      ],
      next: 'sc_32_visit'
    },

    sc_32_visit: {
      id: 'sc_32_visit',
      sceneTitle: '第三日・門縫內外的試探',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '送走夏實回到昏暗走廊，琴理已經站在廚房門口，手心捏著剛剛我沒收好的那幾顆夏橘，指尖幾乎把果皮壓出一層油光。' },
        { speaker: 'kotori', text: '……她明明什麼都沒做錯，笑容也很乾淨，可我站在走廊陰影裡看著她叫你名字的時候，卻突然覺得好噁心。' },
        { speaker: 'kotori', text: '因為只要她站在陽光下伸出手，悠真看起來就像隨時會跨過門檻去那一邊一樣。' }
      ],
      next: 'sc_35_night'
    },

    // =========================================================================
    // 【第三日深夜・Event CG #2：月光下的越界依偎】（sc_35_night ~ sc_38_night）
    // =========================================================================
    sc_35_night: {
      id: 'sc_35_night',
      sceneTitle: '第三日深夜・越界的邊緣',
      cg: 'cg_night_embrace',
      bgm: 'tension_secret',
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '凌晨兩點，山風拍打著外牆木板發出低沉的空響。醒來時，和室角落那盞高腳橘紋和紙燈籠還亮著暖光，而身後那扇圓形木格子窗透進來的清冷月色，把盤腿坐在榻榻米上的兩人照得輪廓分明。' },
        { speaker: 'narrator', text: '穿著純白細肩帶洋裝的琴理早已無聲地挨坐到我左肩旁，臉頰輕靠上我灰藍色居家棉T恤的肩頭，微涼的手指輕輕搭在我膝蓋上方，泛紅的紫灰色眼眸就這樣極近地仰望著我。' },
        { speaker: 'kotori', text: '……我聽得見你的心跳。每當夏實笑著跟你說話的時候，你沒有發現自己會偷偷鬆一口氣嗎？' }
      ],
      next: 'sc_36_night'
    },

    sc_36_night: {
      id: 'sc_36_night',
      sceneTitle: '第三日深夜・越界的邊緣',
      cg: 'cg_night_embrace',
      lines: [
        { speaker: 'narrator', text: '她的側臉貼在我的肩鎖骨旁，單薄的肩線微微打顫，搭在我膝上的手指卻收緊了力道不肯放開。' },
        { speaker: 'kotori', text: '悠真，你看著我的眼睛老實回答我……每天面對這樣一步都不肯踏出門外的我，你是不是其實早就覺得很累、覺得我是個綁住你人生的包袱了？' },
        { speaker: 'kotori', text: '如果你也跟外頭那些人一樣，覺得雙胞胎這個樣子很奇怪、連我們互相靠著取暖都算一種錯……那我們明天就乾脆把手機關掉、把雨戶從裡面全部釘起來，誰都不要再見了，好不好？' },
        { speaker: 'narrator', text: '她的呼吸帶著未乾的淚水濕氣拂過我肩側。在那一秒裡我徹底懂了——我們之間早已不再只是兄妹的互相照顧；一旦我點頭答應了「只要兩個人就好」，這座屋子就會變成兩具逃避全世界的溫柔牢籠。' }
      ],
      choices: [
        {
          label: '伸手覆住她停在膝上的微涼手背：「別怕……就算全世界都在指點我們，我也絕不放開妳。」',
          effects: { dependency: 2 },
          resonance: 'dependency',
          next: 'sc_37_night_a'
        },
        {
          label: '沒有躲開她靠過來的眼神，輕聲說：「我不會丟下妳，但愛護妳不該變成把兩個人一起埋進黑暗的理由。」',
          effects: { outsideBond: 2, truth: 1 },
          resonance: 'outsideBond',
          next: 'sc_37_night_b'
        }
      ]
    },

    sc_37_night_a: {
      id: 'sc_37_night_a',
      sceneTitle: '第三日深夜・越界的邊緣',
      cg: 'cg_night_embrace',
      lines: [
        { speaker: 'narrator', text: '我緊緊反握住她搭在膝上的手，任由她順勢將臉更緊地依偎在我的灰藍T恤肩頭。琴理像是終於抓住不會沉沒的錨點般，仰著臉在淚光裡露出一抹脆弱又安心的淺笑。' },
        { speaker: 'kotori', text: '……記住你今晚說的話喔，悠真。如果連你都答應緊握著我了，這輩子就再也沒有退路了。' }
      ],
      next: 'sc_40_d4'
    },

    sc_37_night_b: {
      id: 'sc_37_night_b',
      sceneTitle: '第三日深夜・越界的邊緣',
      cg: 'cg_night_embrace',
      lines: [
        { speaker: 'narrator', text: '琴理的瞳孔猛地縮了一下，指尖微微鬆開又死死咬住下唇。她的眼淚掉在手背上滾燙得嚇人。' },
        { speaker: 'kotori', text: '……可是，如果不待在這個距離裡，我已經忘記要怎麼一個人呼吸了呀……悠真真的覺得，我有辦法靠自己站起來嗎？' }
      ],
      next: 'sc_40_d4'
    },

    // =========================================================================
    // 【第四日：舊信、暴雨河堤與十年前的水閘真相】（sc_40_d4 ~ sc_51）
    // =========================================================================
    sc_40_d4: {
      id: 'sc_40_d4',
      sceneTitle: '第四日・沉沒的十年前',
      bg: 'bg_embankment',
      bgm: 'twilight_memory',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '第四天下午，深灰色的積雨雲壓在遠野村屋頂上空。我藉口出門領快遞，把昨天從舊報堆裡撿出來的那封「宮代神社」泛黃信封塞進襯衫口袋，冒著初起的小雨走上河岸堤防。' },
        { speaker: 'narrator', text: '信封裡只有半張褪色的便箋，上面是外公生前寫了一半的字句：「關於十年前水閘之事，神社這邊始終記掛著令嬡的心結……」越走近混凝土水閘，耳鳴就越像昨夜的風浪般撞擊胸腔。' }
      ],
      next: 'sc_41_d4'
    },

    sc_41_d4: {
      id: 'sc_41_d4',
      sceneTitle: '第四日・沉沒的十年前',
      chars: [{ id: 'natsumi', expr: 'serious', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '石階前方早已站著一個沒撐傘的身影。夏實身上微濕，看見我走近時沒有露出絲毫驚訝，反倒像把這十年的某場審判等了太久。' },,
        { speaker: 'natsumi', text: '……看樣子，你終究還是翻到那封我外公當年來不及交給伯母的舊信了，對吧？' }
      ],
      next: 'sc_42_d4'
    },

    sc_42_d4: {
      id: 'sc_42_d4',
      sceneTitle: '第四日・沉沒的十年前',
      bgm: 'tension_secret',
      sfx: 'memory_flash',
      chars: [{ id: 'natsumi', expr: 'sad', pos: 'center' }],
      lines: [
        {
          condition: (s) => s.flag_met_shrine_d2 === true,
          truthy: { speaker: 'natsumi', text: '那天在神社我就想說出口了。這兩天看著你眼底越來越深的黑眼圈，我怕我再保持沉默，你們兄妹真的會把這棟老屋變成一輩子出不來的殼。' },
          falsy: { speaker: 'natsumi', text: '你連昨天都沒上神社來……我看著那扇越關越緊的木門就知道，你跟琴理其實都不清楚十年前我們四個人之間到底發生過什麼，對不對？' }
        },
        { speaker: 'narrator', text: '雨點突然變急，砸在混凝土堤防上像一陣碎裂的掌聲。我看著夏實微微泛紅卻不肯躲開的視線，口袋裡那張舊信封與木牌護符同時變得滾燙。' }
      ],
      choices: [
        {
          label: '「全部告訴我吧，夏實。連同父母為什麼半夜帶我們逃走，我不想再靠裝傻保護任何人了。」',
          effects: { truth: 2, outsideBond: 1 },
          resonance: 'truth',
          next: 'sc_43_cg'
        },
        {
          label: '「……如果那是會把琴理好不容易穩住的情緒整個撕碎的事，那就別說了。」',
          effects: { dependency: 1 },
          resonance: 'dependency',
          next: 'sc_49_skip'
        }
      ]
    },

    sc_43_cg: {
      id: 'sc_43_cg',
      sceneTitle: '第四日・Event CG・驟雨堤防的十年前',
      cg: 'cg_shrine_confront',
      bgm: 'climax_choice',
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '傾盆豪雨瞬間砸上石階，兩人急步退進一旁神社側殿的木造屋簷底下。夏實身上米白蕾絲領夏衫與棕色側馬尾都被雨氣打濕，含淚的琥珀眼瞳望著我，雙手緊緊把那封蓋著紅印的白信封按在胸前。' },,
        { speaker: 'natsumi', text: '十年前盂蘭盆節前夜，也是下著像今天這樣的大雨。那年我們八歲……我因為嫉妒你每次去放水燈都只緊牽著琴理的手、連回頭看我一眼都不肯，就賭氣把琴理掉在階梯上的一隻草鞋，一腳踢進水閘邊的濕青苔裡。' }
      ],
      next: 'sc_44_cg'
    },

    sc_44_cg: {
      id: 'sc_44_cg',
      sceneTitle: '第四日・驟雨堤防與十年的告白',
      cg: 'cg_shrine_confront',
      sfx: 'memory_flash',
      lines: [
        { speaker: 'narrator', text: '腦海裡塵封的水聲「轟」地炸開——翻湧的黃濁水流、卡在鐵欄杆上的半隻白布草鞋、還有一雙伸出水面怎麼都抓不住的細小手腕。' },
        { speaker: 'natsumi', text: '我本來只是想讓她著急一下……誰知道琴理怕你生氣她弄丟東西，自己偷偷爬下青苔石階去撈，水閘剛好在那時候洩洪！她被捲進急流，而你連救生圈都沒拿就跳進水裡死死抱住她不放……' },
        { speaker: 'natsumi', text: '是我外公衝進急流把你們兩個硬拉起來的，他右腿從那天起再也沒直過。可真正把琴理逼壞的不是河水，而是你們出院以後——這個村子裡大人的嘴。' }
      ],
      next: 'sc_45_cg'
    },

    sc_45_cg: {
      id: 'sc_45_cg',
      sceneTitle: '第四日・驟雨堤防與十年的告白',
      cg: 'cg_shrine_confront',
      lines: [
        { speaker: 'natsumi', text: '琴理驚嚇過度連續好幾個禮拜說不出話，只要離開你的視線就會吐到喘不過氣。偏偏村裡那些長舌的長輩到處耳語，說雙胞胎「八字黏得過緊差點一起拖下水是水神忌諱」，還好幾次當面勸伯父伯母趁早把你們拆開送去不同親戚家分開養！' },
        { speaker: 'natsumi', text: '伯父氣得一句解釋都沒有，當天半夜就把行李搬上車帶你們逃回東京。臨走前，伯母瞞著他把寫給我的信交給我外公轉遞——她要我別一輩子怪自己，也要所有大人答應這輩子不准在你們長大後重提那天的事。' }
      ],
      next: 'sc_46_cg'
    },

    sc_46_cg: {
      id: 'sc_46_cg',
      sceneTitle: '第四日・驟雨堤防與十年的告白',
      cg: 'cg_shrine_confront',
      effects: { flag_knows_truth: true, truth: 1 },
      resonance: 'truth',
      lines: [
        { speaker: 'narrator', text: '雨線模糊了她的眼睛，夏實卻固執地沒有抬手去擦，就這麼仰頭直直望進我眼底。' },
        { speaker: 'natsumi', text: '這十年裡，每次我擦拭神社這塊當年替琴理求卻沒送出去的木牌，就一直都在發抖……因為我看見你把老家木門關緊的那刻我就懂了！' },
        { speaker: 'natsumi', text: '你們不是天性奇怪，你們是被十年前差點失去彼此的恐懼、還有大人那些骯髒的耳語給凍在原地！……可我也是個自私的人，悠真。我看著你只看著琴理，有時候心裡難受得幾乎想過，如果當時水裡那個人是我，現在站在你身邊的人會不會就不一樣？' },
        { speaker: 'narrator', text: '夏實顫抖著將手中捏皺的白信封連同那塊一直帶在身上的舊木牌遞到我面前。我低頭看著被雨霧沾濕的紙面，第一次聽見自己替自己粉飾太平的假象，在雨聲裡碎得一乾二淨。' }
      ],
      next: 'sc_52'
    },

    sc_49_skip: {
      id: 'sc_49_skip',
      sceneTitle: '第四日・被推開的過去',
      chars: [{ id: 'natsumi', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我沒有伸手去接夏實攥在胸口的舊信封，只是拉高領口轉身踩著積水背對逐漸升高的水聲。' },
        { speaker: 'natsumi', text: '……悠真！你以為你不聽、不看，十年前留下的恐懼就會自動消失嗎？你現在這樣緊抓著琴理不放，究竟是在保護她，還是因為你自己也害怕一個人面對外面的世界？！' },
        { speaker: 'narrator', text: '冰冷的雨水順著額前髮絲往下流，我沒有回頭回答。可她最後那句追問，卻像一根細針一樣卡進喉嚨深處。' }
      ],
      next: 'sc_52'
    },

    // =========================================================================
    // 【第五日：兄妹最後的對話與心理剝析】（sc_52 ~ sc_62 -> 結局分流）
    // =========================================================================
    sc_52: {
      id: 'sc_52',
      sceneTitle: '第五日・雨夜攤牌',
      bg: 'bg_nightroom',
      bgm: 'tension_secret',
      sfx: 'door_slide',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '回到老宅的時候，屋裡一片沒開燈的漆黑。我剛在玄關抹掉臉上的雨水，就看見琴理一個人坐在緊閉的門板前，膝上正攤開那張原本鎖在抽屜裡的學校催辦通知。' },
        { speaker: 'kotori', text: '你剛才冒雨跑去堤防見宮代夏實了，對不對？連傘都沒拿、T恤肩頭濕成這樣……' },
        {
          condition: (s) => s.flag_knows_truth === true,
          truthy: { speaker: 'kotori', text: '她把十年前的事……把村裡人為什麼叫我們怪物、為什麼爸爸半夜逃走的事，全都告訴你了，對不對？' },
          falsy: { speaker: 'kotori', text: '她是不是又勸你離開這棟老屋、勸你把我丟下自己去交轉學單了？' }
        }
      ],
      next: 'sc_53'
    },

    sc_53: {
      id: 'sc_53',
      sceneTitle: '第五日・雨夜攤牌',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '琴理的手指緊緊抓著紙邊，指節幾乎把公文撕出毛邊。我慢慢走過去在她對面蹲下來，平視著她那雙像極了我自己倒影的紫灰眼睛。' },
        {
          condition: (s) => s.flag_knows_truth === true,
          truthy: { speaker: 'yuma', text: '琴理……我終於想起來了。當年妳跳下去撿鞋子差點淹死，我們在醫院醒來卻只聽見大人說我們兄妹被綁在一起是「忌諱」。原來妳一直不是怕陌生人——妳怕的是只要鬆開我的手，下一次就會真的被誰拆散。' },
          falsy: { speaker: 'yuma', text: '夏實沒有要搶走什麼。我只是突然在想……這兩個月來，我們把自己關在這間屋子裡，真的有比在東京的時候快樂嗎？' }
        },
        { speaker: 'kotori', text: '那又怎樣？！沒有了爸媽以後，這世界早就沒有任何安全的地方了！悠真，不要離開我……求求你，除了你之外我什麼都沒有了。只要你說「我們明天哪也不去」，我就不會怕了……' }
      ],
      choices: [
        {
          label: '「其實我也很怕，琴理……不是因為妳脆弱才留下，是我自己也逃避著面對爸媽不在後的世界。」（坦白軟弱）',
          effects: { flag_confronted_kotori: true, truth: 1, outsideBond: 1 },
          resonance: 'truth',
          next: 'sc_54_truth'
        },
        {
          label: '「不用去管明天或九月了。把這張通知撕掉吧，從今晚起誰也別想打擾我們。」（共同封閉）',
          effects: { flag_confronted_kotori: true, dependency: 2 },
          resonance: 'dependency',
          next: 'sc_54_seal'
        },
        {
          label: '「對不起，琴理……明天一早我就會去交轉學單。如果妳還沒準備好，就先在屋裡等我回來吧。」（獨自踏出）',
          effects: { flag_confronted_kotori: false, outsideBond: 1 },
          resonance: 'outsideBond',
          next: 'sc_54_leave'
        }
      ]
    },

    sc_54_truth: {
      id: 'sc_54_truth',
      sceneTitle: '第五日・雨夜攤牌',
      chars: [{ id: 'kotori', expr: 'tense', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我沒有像以前一樣反手抱住她哄她安靜，而是微微發抖著攥住自己膝蓋，把埋在心底兩個月的自私一點一點剝給她看。' },
        { speaker: 'yuma', text: '搬回來之後每次妳怕黑、每次妳攔我推開雨戶，我都告訴自己是在保護妹妹——可其實是我自己沒勇氣走進沒有爸媽的九月！靠著「被妳絕對需要」，我才能假裝自己還是個有用的人！' },
        { speaker: 'kotori', text: '……悠真？原來你……也一直在發抖嗎？' },
        { speaker: 'narrator', text: '琴理愣愣地鬆開快被捏爛的通知單，抬手輕輕碰了碰我涼透的指尖。第一次，這對雙胞胎之間緊繃到快窒息的空氣出現了一道可以呼吸的細縫。' }
      ],
      next: 'node_router'
    },

    sc_54_seal: {
      id: 'sc_54_seal',
      sceneTitle: '第五日・雨夜攤牌',
      chars: [{ id: 'kotori', expr: 'smile', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我拿過她膝上的轉學通知，當著她的面一分為二撕開。清脆的撕紙聲在寂靜和室裡迴響，像替外頭的世界拉上了最後一道布幕。' },
        { speaker: 'kotori', text: '……好。門板我也替你插好木栓了。今晚之後，這棟老屋就只屬於我們兩個了喔，悠真。' }
      ],
      next: 'node_router'
    },

    sc_54_leave: {
      id: 'sc_54_leave',
      sceneTitle: '第五日・雨夜攤牌',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '我小心地抽出被她抓住的手指，將通知單放進書包。琴理沒有哭鬧，只是安靜地坐在陰影裡點點頭，平靜得令人脊椎發寒。' },
        { speaker: 'kotori', text: '嗯……既然悠真已經決定好了，那你就去吧。不管門外有多少人盯著看，那是你選的世界。' }
      ],
      next: 'node_router'
    },

    // =========================================================================
    // 【核心結算分流器】（自動導向 4 種明確結局）
    // =========================================================================
    node_router: {
      isRouter: true,
      route: function (s) {
        if (s.flag_knows_truth && s.flag_confronted_kotori && s.outsideBond >= s.dependency) {
          return 'sc_end_dawn_01';
        }
        if (s.dependency >= s.outsideBond + 2 || (s.dependency >= 4 && !s.flag_knows_truth && s.flag_hid_notice)) {
          return 'sc_end_sealed_01';
        }
        if (s.outsideBond >= s.dependency && !s.flag_knows_truth) {
          return 'sc_end_breeze_01';
        }
        if (s.outsideBond > s.dependency && s.flag_knows_truth) {
          return 'sc_end_dawn_01';
        }
        return 'sc_end_cicada_01';
      }
    },

    // =========================================================================
    // ENDING C：夏末彼岸的微光（True End — Event CG #5 `cg_dawn_horizon`）
    // =========================================================================
    sc_end_dawn_01: {
      id: 'sc_end_dawn_01',
      sceneTitle: '終章・彼岸的清晨',
      bg: 'bg_oldhouse',
      bgm: 'title_breeze',
      sfx: 'wind_chime',
      chars: [{ id: 'kotori', expr: 'idle', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '暴雨整整下了半宿，在天邊透出淡青色微光時終於停歇。屋簷上的水珠滴進庭院青苔裡，發出一聲清脆響動。' },
        { speaker: 'kotori', text: '……悠真，醒著嗎？今天好像沒有再聽見昨天那麼吵的雷聲了。' }
      ],
      next: 'sc_end_dawn_02'
    },

    sc_end_dawn_02: {
      id: 'sc_end_dawn_02',
      sceneTitle: '終章・彼岸的清晨',
      sfx: 'door_slide',
      cg: 'cg_dawn_horizon',
      lines: [
        { speaker: 'narrator', text: '我們並肩走到走廊木門前，兩個人同時伸手將最後幾扇障子門推到底——屋簷外是染成粉金色的夏末晨空與層疊青翠山巒，清風掠過屋角玻璃風鈴發出一串澄澈叮咚，吹起琴理一頭如雪銀髮。' },
        { speaker: 'narrator', text: '晨光照進她泛紅卻含著笑意的眼眶裡，那滴沒能忍住的淚水映著身後升起的朝陽，亮得幾乎讓人挪不開視線。' },
        { speaker: 'kotori', text: '還是會有點害怕……如果待會走到公車站牌，那些阿姨一定還是會偷偷看我們吧。' },
        { speaker: 'yuma', text: '也許吧。不過這一次，我不再替妳擋掉外頭所有光線——我要陪妳這樣堂堂正正地站在太陽底下。' }
      ],
      next: 'sc_end_dawn_03'
    },

    sc_end_dawn_03: {
      id: 'sc_end_dawn_03',
      sceneTitle: '終章・夏末彼岸的微光',
      bg: 'bg_shrine',
      sfx: 'wind_chime',
      chars: [
        { id: 'kotori', expr: 'smile', pos: 'left' },
        { id: 'natsumi', expr: 'smile', pos: 'right' }
      ],
      lines: [
        { speaker: 'narrator', text: '九點鐘前往鎮公所之前，我們先繞上還帶著露水的宮代神社石階。拿著竹掃帚站在鳥居旁的夏實看見並肩走近的兩個人影，手中掃帚差點滑落。' },
        { speaker: 'kotori', text: '……夏實，那雙小時候掉在河邊的涼鞋，我早就已經不痛了。還有……謝謝妳昨天把這些話告訴悠真。' },
        { speaker: 'natsumi', text: '琴理……嗯！歡迎回來，真的很高興再見到妳們兩個！' }
      ],
      next: 'sc_end_dawn_04'
    },

    sc_end_dawn_04: {
      id: 'sc_end_dawn_04',
      sceneTitle: '結局 C・夏末彼岸的微光',
      cg: 'cg_dawn_horizon',
      bgFilter: 'filter-dawn',
      ending: 'ending_dawn',
      lines: [
        { speaker: 'narrator', text: '十年前的水聲沒有帶走任何人的未來；九月的鐘聲，正從遠方明朗的山脊彼岸傳來。' },
        { speaker: 'narrator', text: '【ENDING C：夏末彼岸的微光 — True End】' }
      ]
    },

    // =========================================================================
    // ENDING A：繭中之夏（Closed End — Event CG #4 `cg_sealed_window`）
    // =========================================================================
    sc_end_sealed_01: {
      id: 'sc_end_sealed_01',
      sceneTitle: '結局 A・門栓之內',
      bg: 'bg_oldhouse',
      bgFilter: 'filter-sealed',
      bgm: 'tension_secret',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '隔天早上九點，玄關外傳來了幾次由輕轉重的敲門聲。夏實站在竹籬笆外喊了兩聲悠真的名字，門板後卻沒有任何人回應。' },
        { speaker: 'narrator', text: '我拔掉了玄關走廊的電門鈴線，把所有還透光的木製雨戶都檢查過一遍，插上最裡層的黃銅門栓。手機早就在昨晚電量耗盡後擺在桌角沒有充電。' }
      ],
      next: 'sc_end_sealed_02'
    },

    sc_end_sealed_02: {
      id: 'sc_end_sealed_02',
      sceneTitle: '結局 A・繭中之夏',
      cg: 'cg_sealed_window',
      bgFilter: 'filter-sealed',
      bgm: 'twilight_memory',
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '緊閉的深色木牆與和紙障子門外，只透進一層薄薄的琥珀餘暉，照亮空氣裡緩慢沉浮的微塵。換上深青和式作務衣的我靜靜盤腿坐著，琴理便安穩地倚靠在我右肩頭閉起雙眼。' },
        { speaker: 'kotori', text: '聽見了嗎，悠真……連夏實的腳步聲都走遠了。外頭的蟬叫聲，隔著這排關死的障子門聽起來好像變成了海浪一樣。' },
        { speaker: 'yuma', text: '嗯。在這裡沒有九月，也沒有任何人能再評判我們。' },
        { speaker: 'narrator', text: '明明空氣悶熱得幾乎停滯，胸口卻感受到一種極其扭曲、卻又無比安心的甘甜——我們聯手親手織成了這枚沒有出口的夏末之繭。' }
      ],
      next: 'sc_end_sealed_03'
    },

    sc_end_sealed_03: {
      id: 'sc_end_sealed_03',
      sceneTitle: '結局 A・繭中之夏',
      cg: 'cg_sealed_window',
      bgFilter: 'filter-sealed',
      ending: 'ending_sealed',
      lines: [
        { speaker: 'narrator', text: '【ENDING A：繭中之夏 — Closed End】 — 門栓扣緊之後，再也沒有外人能傷害你們；同時，也再也沒有明天能夠走進來。' }
      ]
    },

    // =========================================================================
    // ENDING B：風鈴與未竟的告別（Normal End — `cg_epilogue`）
    // =========================================================================
    sc_end_breeze_01: {
      id: 'sc_end_breeze_01',
      sceneTitle: '結局 B・未竟的告別',
      bg: 'bg_oldhouse',
      bgFilter: 'filter-breeze',
      bgm: 'twilight_memory',
      chars: [{ id: 'kotori', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '九月開學那天清晨，我穿起熨平的白襯衫把書包背上肩。琴理站在陰影裡的廊柱邊，幫我把歪了半寸的領子順平，指尖卻始終冷冰冰的。' },
        { speaker: 'kotori', text: '……悠真先去學校吧。等你下課回來之後，記得把外頭的世界一點一點說給我聽。' }
      ],
      next: 'sc_end_breeze_02'
    },

    sc_end_breeze_02: {
      id: 'sc_end_breeze_02',
      sceneTitle: '結局 B・風鈴與未竟的告別',
      bg: 'bg_embankment',
      bgFilter: 'filter-breeze',
      chars: [{ id: 'natsumi', expr: 'sad', pos: 'center' }],
      lines: [
        { speaker: 'narrator', text: '在堤防公車站牌前，穿著那襲乾淨白襯衫與深藍百褶裙、早早背好書包等候的夏實默默走過來並肩。遠方傳來公車低沉的引擎聲，她看了一眼我身後空無一人的斜坡，眼神藏著沒說破的心疼。' },,
        { speaker: 'natsumi', text: '……她最後還是沒出來嗎？沒關係，我跟神職人員那邊約好了，放學後陪你再試著敲敲看那扇門。' }
      ],
      next: 'sc_end_breeze_03'
    },

    sc_end_breeze_03: {
      id: 'sc_end_breeze_03',
      sceneTitle: '結局 B・風鈴與未竟的告別',
      cg: 'cg_epilogue',
      bgFilter: 'filter-breeze',
      sfx: 'wind_chime',
      ending: 'ending_breeze',
      lines: [
        { speaker: 'narrator', text: '【ENDING B：風鈴與未竟的告別 — Normal End】 — 你一個人走向了有風吹過的九月，卻把半顆心與未解的往事，留在了那扇半掩的木門之後。' }
      ]
    },

    // =========================================================================
    // ENDING D：空殼與殘響（Bitter End — `cg_epilogue`）
    // =========================================================================
    sc_end_cicada_01: {
      id: 'sc_end_cicada_01',
      sceneTitle: '結局 D・空殼與殘響',
      bg: 'bg_nightroom',
      bgFilter: 'filter-cicada',
      bgm: 'tension_secret',
      clearChars: true,
      lines: [
        { speaker: 'narrator', text: '暴雨過後的清晨，和室裡吹進一股陌生的冷風。我睜開眼時，對面那張總是緊緊貼近著的被褥空著——被子被疊成方正冰涼的一塊，上頭放著那枚神社舊木牌護符，以及那張從中撕開兩半的轉學通知單。' },
        { speaker: 'narrator', text: '玄關只剩她平時穿的白帆布鞋不見了。窗框縫隙卡著一具被風乾的透明蟬蛻，在朝陽裡安靜得刺眼。' }
      ],
      next: 'sc_end_cicada_02'
    },

    sc_end_cicada_02: {
      id: 'sc_end_cicada_02',
      sceneTitle: '結局 D・空殼與殘響',
      bg: 'bg_embankment',
      bgFilter: 'filter-cicada',
      chars: [{ id: 'natsumi', expr: 'sad', pos: 'center' }],
      sfx: 'heartbeat',
      lines: [
        { speaker: 'narrator', text: '我發瘋似的跑上堤防，卻只在遠處平交道響起的噹噹聲中看見首班早班電車緩緩駛出遠野村。站在石階底下的夏實望著我，眼底第一次浮起了幾分真正的失望與疲倦。' },
        { speaker: 'natsumi', text: '她剛才扛著旅行袋經過鳥居前時，只淡淡說了一句——「連他自己都在害怕，那就別再互相綁死了」。悠真……你到最後，到底還是誰都沒有好好握住啊。' }
      ],
      next: 'sc_end_cicada_03'
    },

    sc_end_cicada_03: {
      id: 'sc_end_cicada_03',
      sceneTitle: '結局 D・空殼與殘響',
      cg: 'cg_epilogue',
      bgFilter: 'filter-cicada',
      bgm: 'twilight_memory',
      sfx: 'cicada_ambience',
      ending: 'ending_cicada',
      lines: [
        { speaker: 'narrator', text: '【ENDING D：空殼與殘響 — Bitter End】 — 半途而廢的溫柔與逃避真相的懦弱，在八月結束的清晨裡，只留下了再也追不上的鐵道殘響。' }
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
      if (typeof val === 'boolean') {
        gameState[key] = val;
        if (key === 'flag_knows_truth' || key === 'flag_confronted_kotori') {
          resonance = 'truth';
        } else if ((key === 'flag_opened_shutters' && val) || (key === 'flag_met_shrine_d2' && val)) {
          if (resonance === 'none') resonance = 'outsideBond';
        } else if (key === 'flag_hid_notice' && val) {
          if (resonance === 'none') resonance = 'dependency';
        }
      } else if (typeof val === 'number') {
        gameState[key] = (gameState[key] || 0) + val;
        if (key === 'truth') {
          resonance = 'truth';
        } else if (key === 'outsideBond' && val >= 2 && resonance === 'none') {
          resonance = 'outsideBond';
        } else if (key === 'dependency' && val >= 2 && resonance === 'none') {
          resonance = 'dependency';
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
