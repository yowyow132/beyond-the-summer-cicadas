# 《夏末蟬鳴的彼岸》（Beyond the Summer Cicadas）— 美術與視覺設計規格書（ART_SPEC）

> **文件定位**：本規格書定義《夏末蟬鳴的彼岸》之視覺風格、嚴格 5 色 UI 色票、繁體中文排版系統、日式障子木格對話框與選擇肢規範、Desktop (`1280×800`) 與 Mobile (`390×844`) 視覺佈局，以及 `assets/` 內所有視覺素材的實作與驗收狀態。

---

## 1. 核心美術風格（Visual Identity）

- **視覺定位**：**Soft Luminous Japanese Cel-Shaded Anime Galgame Art（柔光系日系賽璐珞動畫視覺小說美術）**
- **氛圍參照**：致敬《緣之空（Yosuga no Sora）》般的八月末日本鄉村懷舊感——通透澄澈的夏末藍天、被日光曬暖的陳舊杉木緣廊、屋簷下透光的玻璃風鈴、林間濾出的柔焦光斑（Gentle Bloom）與纖細乾淨的日系動畫線稿（Delicate Clean Linework）。
- **質感禁忌**：嚴禁暗紫色／霓虹青科技風卡片、厚重塑膠光澤、寫實油畫筆觸或過度高飽和的 AI 預設發光濾鏡。

---

## 2. 嚴格 5 色 UI 色票系統（Strict 5-Color Palette）

全遊戲 UI（標題畫面、對話框、選擇肢、控制列、存檔／結局圖鑑彈窗）僅使用以下 **5 個核心 Hex 色碼**及其透明度變體，確保色彩完全收斂並融入夏末木宅與晴空背景：

| 角色（Token） | 名稱 | Hex 色碼 | 應用規範與透明度衍生 |
| :--- | :--- | :--- | :--- |
| **Background** | 深杉墨影（Deep Cedar Shadow） | `#1F1A16` | 舞台外圍留白底色、模態視窗背景遮罩（`rgba(31, 26, 22, 0.58)`）、立繪未發聲暗角襯底、標題畫面底部柔光暗影漸層。 |
| **Surface** | 障子暖宣（Sunlit Shoji Cream） | `#FAF4E8` | 和紙／障子半透明對話框底面（`rgba(250, 244, 232, 0.90)` + `backdrop-filter: blur(10px)`）、選擇肢按鈕底面（`rgba(250, 244, 232, 0.92)`）、上方膠囊控制列與系統彈窗本體（`0.96`）；在深色遮罩上亦可作為反白字色使用。 |
| **Primary** | 夏末澄空藍（Late-Summer Sky Blue） | `#5A8AB5` | 主要互動強調色：標題頁「從頭開始」主按鈕、選擇肢 Hover／Focus 外框光暈、自動播放（Auto）／快進（Skip）啟用指示燈、`outsideBond` 心境微光。 |
| **Accent** | 蟬金琥珀（Cicada Amber Gold） | `#C79A4B` | 精緻金宣細框線（`rgba(199, 154, 75, 0.55)`）、說話者名牌左側裝飾豎線、打字機結尾跳動菱形指示器 `▼`、「✦ 心境產生了波動」0.6s 框緣微光（Shimmer）、已解鎖結局徽章。 |
| **Text** | 松煙墨褐（Sumi Cedar Ink） | `#2B231D` | 全站繁體中文主內文、章節標題、選項文字與提示語（於 `#FAF4E8` 暖宣底面上對比度達 `12.6:1`，久讀不刺眼）；次要輔助說明文字採用 `rgba(43, 35, 29, 0.68)`。 |

---

## 3. 繁體中文排版系統（Typography）

透過 Google Fonts 載入繁體中文襯線與黑體雙字型，區隔文學敘事氛圍與清晰閱讀介面：

| 用途分類 | 字型家族（Font Family） | 字重與字距 | Desktop (`1280×800`) | Mobile (`390×844`) |
| :--- | :--- | :--- | :--- | :--- |
| **遊戲主標題／章節題名／結局名稱** | `'Noto Serif TC', serif` | `600`–`700`、`letter-spacing: 0.12em` | 主標題 `42px`；章節卡 `28px` | 主標題 `28px`；章節卡 `22px` |
| **說話者名牌（Nameplate）** | `'Noto Serif TC', serif` | `700`、`letter-spacing: 0.08em` | `17px` | `15px` |
| **對話本文與內心獨白** | `'Noto Sans TC', sans-serif` | `400`–`500`、`line-height: 1.7` | `19px`（單行至多 ~34 字） | `16.5px`（3 行內不溢出） |
| **選擇肢選項文字** | `'Noto Sans TC', sans-serif` | `500`、`line-height: 1.5` | `17px` | `16px` |
| **控制列／時間戳記／提示微字** | `'Noto Sans TC', sans-serif` | `500`、`letter-spacing: 0.04em` | `13px` | `12px` |

---

## 4. 日式木格障子介面組件規範（UI Surface & Frame Rules）

### 4.1 對話框（Dialogue Box）
- **外觀結構**：模擬日式和室障子紙與細杉木框——採用 `Surface (#FAF4E8)` `90%` 透明度搭配 `backdrop-filter: blur(10px)`，外層為 `1.5px solid rgba(199, 154, 75, 0.55)`（`Accent` 淡金細框），內縮 `4px` 再以 `1px solid rgba(43, 35, 29, 0.12)` 勾勒極細木格內框線，呈現柔和溫潤的經典日系 Galgame 紙質通透感。
- **說話者名牌**：懸浮於對話框左上緣（`translateY(-50%)`），白宣高濃度底色（`rgba(250, 244, 232, 0.97)`）配左側 `3px` `Accent (#C79A4B)` 豎條；旁白（無說話者）時名牌自動隱藏。
- **推進指示器**：文字完整顯示後，右下角出現緩慢上下浮動的金色菱形／夏蟬微符 `▼`（`#C79A4B`）。
- **心境波動微反饋（Shimmer）**：觸發關鍵選擇時，對話框頂緣金色細線在 `600ms` 內掃過一道淡金光暈，右上角浮現微字 `✦ 心境產生了波動`（1.8 秒後淡出）。

### 4.2 選擇肢按鈕（Choice Frames）
- **常態**：`Surface (#FAF4E8)` `92%` 透明度、圓角 `4px`（保留和紙書籤的俐落折角感）、雙側微金線邊框、左緣附一枚小型空心菱形 `◇`。
- **懸停／聚焦（Hover / Focus）**：邊框轉為 `Primary (#5A8AB5)` 並帶柔和微光（`box-shadow: 0 4px 18px rgba(90, 138, 181, 0.22)`），菱形轉實心 `◆` 並向右微移 `4px`（`transition: 180ms ease`）。
- **觸控安全規範**：Mobile 版高度強制 **`≥ 52px`**、按鈕垂直間距 **`14px`**，且選擇肢顯示期間鎖定背景點擊推進。

### 4.3 立繪與舞台演出規範（Stage & Sprites）
- **進退場與切換**：`250ms` 平滑交叉淡入淡出（Opacity + 輕微水平位移）。
- **雙人同場焦點區分**：
  - **當前說話者**：`filter: brightness(1.0)`、`transform: translateY(-2px)`、`z-index: 3`。
  - **非說話者（傾聽中）**：`filter: brightness(0.75) saturate(0.92)`、`transform: translateY(0)`、`z-index: 2`。
- **結局圖鑑 / `cg_epilogue` 四結局調色濾鏡（CSS Filter Variants）**：
  - `END_04《彼岸的晴空》`：原色澄澈通透（`brightness(1.04) saturate(1.05)`）。
  - `END_03《褪色的蟬殼》`：微褪色懷舊冷調（`saturate(0.72) contrast(0.96) sepia(0.14)`）。
  - `END_02《神社風鈴的約定》`：柔暖午後金色微光（`sepia(0.18) brightness(1.02) saturate(1.08)`）。
  - `END_01《永無止境的八月》`：封閉黃昏暗角低對比（`brightness(0.84) contrast(1.06) sepia(0.24)` + 邊緣內陰影暗角）。

---

## 5. 雙平台響應式版面規格（Desktop `1280×800` & Mobile `390×844`）

| 視覺區域 | Desktop (`1280×800`) 佈局規格 | Mobile Web (`390×844`) 佈局規格 |
| :--- | :--- | :--- |
| **遊戲舞台容器** | 置中 `16:10` / `16:9` 滿版畫布（最大 `1280×800`，背景 `object-fit: cover`） | 滿版直向視窗 `100vw × 100dvh`，背景 `object-fit: cover; object-position: center` |
| **角色立繪定位** | 單人：`center` (`left: 50%`)；雙人：`left` (`28%`) 與 `right` (`72%`)；高度佔舞台 `78%`（貼底對齊） | 上半身對焦裁切，高度佔舞台 `68%`，垂直基準對齊至對話框頂緣上方，確保臉部不被頂部控制列或底部對話框遮蔽 |
| **上方控制列** | 右上角半透明膠囊列（`top: 16px; right: 20px`），滑鼠閒置 `3.5s` 後降至 `0.45` 透明度 | 置頂安全區單排精簡列（`padding-top: env(safe-area-inset-top)`），所有按鈕最小觸控區域 **`44×44 px`** |
| **對話框** | 底部置中，寬度 `82%`（`max-width: 960px`），高度 `182px`，距底 `22px` | 貼近底部安全區，寬度 `94%`，高度約 `27%`（`min-height: 196px`），內距寬裕確保 3 行內文字不溢出 |
| **選擇肢群組** | 垂直置中於舞台中央（`width: 540px`），垂直間距 `14px` | 位於舞台中下拇指舒適區（`bottom: 31%`），寬度 `88%`，高度 `≥ 52px` |

---

## 6. 視覺素材清單與製作狀態（Assets Manifest — v3.0 1-to-1 對齊 `SCRIPT_SPEC.md`）

> **✅ 全數素材完稿與角色統一標準**：  
> 1. 所有背景／CG／立繪均由本地 `StabilityMatrix`（`Stable Diffusion WebUI Forge - Neo` + `novaAnimeXL_ilV180.safetensors` + `4x-AnimeSharp` 超採樣至 `1600×900`）在同一套日系動畫賽璐璐（Cel-shaded）畫風下完稿。  
> 2. 琴理（`kotori`）與夏實（`natsumi`）之立繪與關鍵 CG（`cg_rain_hair`、`cg_night_embrace`、`cg_shrine_confront`、`cg_dawn_horizon`）均已通過 `ADetailer` + `unify_appearance.py` 瞳色與髮色鎖定，維持跨場景瞳色與服裝細節 100% 一致。

### 6.1 背景與事件／結局 CG 素材（11 張，1600×900 16:9 RGB PNG，無 UI 文字）

| 檔案路徑 | 對應 ID | 實測尺寸 | 狀態 | 實測規格／視覺設計說明 |
| :--- | :--- | :--- | :--- | :--- |
| `assets/bg_nightroom_blackout.png` | `bg_nightroom_blackout` | `1600×900` | ✅ 新增完稿 | **RGB PNG（Act 0 / Act III 停電夜專用）**。暴雨停電深夜的和室一角，和紙檯燈完全熄滅、窗外濃重暴雨夜色、木造佛壇底層抽屜半開且榻榻米散落紙角，僅一道微弱暖黃手電筒光束斜照抽屜邊緣。 |
| `assets/bg_oldhouse.png` | `bg_oldhouse` | `1600×900` | ✅ 已完成 | **RGB PNG**。夏末午後日光斜照的日本鄉間木造舊宅緣廊、屋簷下透光玻璃風鈴、庭院杉林與晴空。 |
| `assets/bg_embankment.png` | `bg_embankment` | `1600×900` | ✅ 已完成 | **RGB PNG**。鄉間河川青草堤防與舊混凝土水閘、黃昏積雨雲映照水面、隨風搖曳的銀白芒草。 |
| `assets/bg_shrine.png` | `bg_shrine` | `1600×900` | ✅ 已完成 | **RGB PNG**。林蔭斑駁光影中的鄉間神社石階、未上漆的風化杉木鳥居、社殿屋簷下玻璃風鈴。 |
| `assets/bg_nightroom.png` | `bg_nightroom` | `1600×900` | ✅ 已完成 | **RGB PNG**。常態深夜舊宅和室，暖黃和紙檯燈微光、清冷月光透過木格障子窗灑入榻榻米。 |
| `assets/cg_rain_hair.png` | `cg_rain_hair` | `1600×900` | ✅ 已完成 | **RGB PNG（CG 01）**。Act I `sc_09`–`sc_11b`：第二日驟雨午後，在室內以白毛巾替琴理拭乾濕髮的近距心理試探。 |
| `assets/cg_night_embrace.png` | `cg_night_embrace` | `1600×900` | ✅ 已完成 | **RGB PNG（CG 02）**。Act I `sc_14`–`sc_15b`：第三日深夜圓窗月光下，揭穿彼此私心與逃避的近距依偎。 |
| `assets/cg_shrine_confront.png` | `cg_shrine_confront` | `1600×900` | ✅ 已完成 | **RGB PNG（CG 03）**。Act II `sc_20`–`sc_24`：暴雨神社屋簷下，夏實捧著綴有紅蠟印的十年前舊賠償信坦白火災內情。 |
| `assets/cg_sealed_window.png` | `cg_sealed_window` | `1600×900` | ✅ 已完成 | **RGB PNG（CG 04）**。Ending A `ending_sealed`：雨戶門栓緊閉後只透出微暗琥珀餘暉的和室封閉結局。 |
| `assets/cg_dawn_horizon.png` | `cg_dawn_horizon` | `1600×900` | ✅ 已完成 | **RGB PNG（CG 05）**。Ending C `ending_dawn`（True End）：破曉打開雨戶後迎向晨曦與玻璃風鈴微風的清醒結局。 |
| `assets/cg_epilogue.png` | `cg_epilogue` | `1600×900` | ✅ 已完成 | **RGB PNG（CG 06）**。Ending B / Ending D 共用遠景插畫：清晨敞開緣廊望向霧氣山脊與村口遠方的留白終幕。 |

### 6.2 角色多表情去背立繪（8 張，透明 RGBA PNG，含 `OUTFIT` 對齊）

所有角色立繪均鎖定統一基準構圖與瞳色，經邊界連通域去背＋非綠封閉區防誤挖保護＋邊緣 Despill 處理，零綠邊／零破洞：

1. **Heroine 1：`kotori` — 小鳥遊 琴理**（`OUTFIT: white_sundress`，齊腰銀白淡灰長直髮＋黑色髮夾、白色細肩帶純白夏季連身洋裝、淡紫靛藍灰瞳色）— 統一輸出 **`545×900` RGBA PNG**
   - `assets/char_kotori_idle.png`（基準圖，安靜淡然凝視）— ✅ 已完成（`545×900`）
   - `assets/char_kotori_smile.png`（柔和放鬆淺笑，臉型服裝像素對齊）— ✅ 已完成（`545×900`）
   - `assets/char_kotori_sad.png`（垂眸脆弱哀傷，臉型服裝像素對齊）— ✅ 已完成（`545×900`）
   - `assets/char_kotori_tense.png`（緊繃戒備微紅雙頰，臉型服裝像素對齊）— ✅ 已完成（`545×900`）
2. **Heroine 2：`natsumi` — 宮代 夏實**（`OUTFIT: summer_casual`，暖棕栗色側馬尾長髮、琥珀暖棕瞳色、米白夏裝襯衫配深藍百褶裙）— 統一輸出 **`494×900` RGBA PNG**
   - `assets/char_natsumi_idle.png`（基準圖，溫和沉穩）— ✅ 已完成（`494×900`）
   - `assets/char_natsumi_smile.png`（開朗溫暖夏日微笑，臉型服裝像素對齊）— ✅ 已完成（`494×900`）
   - `assets/char_natsumi_sad.png`（苦澀失落欲言又止，臉型服裝像素對齊）— ✅ 已完成（`494×900`）
   - `assets/char_natsumi_serious.png`（眼神堅定凝重直視，臉型服裝像素對齊）— ✅ 已完成（`494×900`）

---

## 7. 完稿驗證標準

1. 全數 **19 張** `assets/*.png`（5 背景 + 6 CG + 8 立繪）與 `SCRIPT_SPEC.md` §2 `Required Assets Checklist` **1-to-1 完全覆蓋**，並於實機深色舞台與跨視口（`1280×800`、`390×844`）驗證通過，無透明破洞或綠邊暈染。
2. 同一角色之 4 款表情差分鎖定完全一致之像素寬高、瞳色、髮色與定位（`kotori` `545×900`、`natsumi` `494×900`），切換表情零偏移。
