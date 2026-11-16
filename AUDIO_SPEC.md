# 《夏末蟬鳴的彼岸》（Beyond the Summer Cicadas）— 聲音設計與音訊規格書（AUDIO_SPEC v3.0）

> **文件定位**：本規格書定義《夏末蟬鳴的彼岸》之完整聲音美學、預渲染立體聲 MP3＋Web Audio 雙層備援架構、5 首循環背景音樂（BGM）曲目規格、6 組劇本音效（SFX）＋夏蟬環境音層、隨機音高微擾防疲勞機制，以及跨平台音訊安全與音量控制規範。  
> **實作原則（依 v1.4.0 `audio-director.md` 三級優先序）**：  
> - **Tier 1 實測結果**：已檢核使用者 `GEMINI_API_KEY` 並實測 Gemini Lyria API（`lyria-3-clip-preview` / `lyria-3.5`），回傳 Free Tier 配額限制（`HTTP 429: limit 0 requests per day on Free Tier`），依規範降級至穩定可靠的離線多軌母帶資源。  
> - **Tier 3 實裝架構**：於 `assets/audio/` 提供 5 首 44.1 kHz 立體聲 160 kbps MP3 預渲染循環母帶（`assets/audio/bgm_*.mp3`，60s–77.8s），並保留 100% Web Audio API 即時多聲部 Lookahead 合成器作為零依賴備援；劇本 SFX 與介面/打字機音效全面導入 **`±6%`～`±8%` 隨機音高微擾（Pitch Jitter）**，杜絕重複觸發的機械感。  
> **ID 對齊契約**：所有曲目與音效 ID 嚴格對齊 [`GAME_SPEC.md`](GAME_SPEC.md) §2.3 與 [`SCRIPT_SPEC.md`](SCRIPT_SPEC.md) §2.4。

---

## 1. 聲音美學與整體混音架構（Sonic Identity & Routing）

### 1.1 聽覺美學定調
- **作品致敬基調**：承襲《緣之空（Yosuga no Sora）》般的夏末鄉村空氣感與心理張力——清澈卻帶一絲遙遠悲傷的木質鋼琴、如微風掠過杉林的類比弦樂鋪底（Warm Pad）、不搶戲但具季節記憶點的遠處蟬鳴，以及象徵外界連結與記憶閃回的玻璃風鈴泛音。
- **空間感與溫暖度**：透過輕量化的**合成演算法殘響（Algorithmic Stereo Delay/Reverb Send）**與低通濾波塑造「木造舊宅與夏日晴空」的自然殘響，讓每個鋼琴單音與風鈴餘韻都能柔和融入空氣中。
- **動態餘裕（Headroom）**：所有聲部於匯流排經過柔和動態壓縮器（Soft Compressor），確保 BGM、蟬鳴、劇情音效與打字機節奏疊加時**永不破音或削波（Zero Clipping）**。

### 1.2 Web Audio 訊號路由圖（Signal Graph）

```text
  [BGM Scheduler Voices] ──► bgmPreGain ──► bgmFaderA / bgmFaderB (1000ms 交叉淡入淡出)
                                │                                    │
                                ├──────── (Send 22%) ────────────────┼──► [Reverb / Stereo Delay Bus]
                                ▼                                    │           │
                         masterBgmGain (使用者 BGM 音量) ◄────────────┘           │
                                │                                                │
  [Cicada Ambience] ──► ambienceGain ──► masterSfxGain ◄── [SFX & UI Voices] ◄───┘ (濕聲混回主匯流排)
                                               │
                                               ▼
                                    [DynamicsCompressorNode] (防削波保護)
                                               │
                                               ▼
                                      [masterMuteGain] (全域靜音 / 0.0 或 1.0)
                                               │
                                               ▼
                                    [audioCtx.destination]
```

### 1.3 核心匯流排與保護參數
| 節點名稱 | 類型 | 建議參數與職責 |
| :--- | :--- | :--- |
| `reverbSend` | Stereo Feedback Delay + Lowpass | 左延遲 `0.19s` / 右延遲 `0.27s`、Feedback `0.32`、Lowpass `2600 Hz`（柔和滾降高頻齒音），或以程式生成 `1.6s` 指數衰減粉紅噪音脈衝響應之 `ConvolverNode`（推薦使用 `ConvolverNode`，質感更接近真實木造空間）。 |
| `masterCompressor` | `DynamicsCompressorNode` | `threshold: -14 dB`、`knee: 18 dB`、`ratio: 4`、`attack: 0.005s`、`release: 0.16s` |
| `masterBgmGain` | `GainNode` | 預設倍率 `0.70`（對應設定滑桿 `0.0 ～ 1.0`，建議套用二次方音量曲線 `v * v` 符合人耳響度感知） |
| `masterSfxGain` | `GainNode` | 預設倍率 `0.80`（套用 `v * v` 響度曲線；同時控制劇本 SFX、UI 音效與蟬鳴層） |
| `masterMuteGain` | `GainNode` | 靜音時以 `25ms` 斜坡降至 `0.0`，解除時以 `40ms` 斜坡恢復 `1.0` |

### 1.4 排程器（Lookahead Scheduler）與無雜音包絡規範
1. **精準時序排程**：BGM 不依賴 `setTimeout` 直接觸發音源，而採用標準 Web Audio Lookahead 架構：
   - 排程定時器間隔：`30ms`
   - 前瞻視窗（Schedule Ahead Time）：`0.14s`
   - 即使瀏覽器因頁面切換或手機效能產生微幅掉幀，音符時間軸依然鎖定 `audioCtx.currentTime` 穩定流動。
2. **微人性化（Micro-Humanization）**：鋼琴與音樂盒音符加入極細微的隨機偏移（時間偏移 `±0.006s`、力度變化 `±8%`），消除機械感。
3. **零爆音包絡（Anti-Click Envelope）**：
   - 所有振盪器與噪音節點**嚴禁**在非零振幅時直接 `stop()` 或瞬間將 `gain.value` 設為 `0`。
   - 最短起音（Attack）`≥ 0.005s`；釋放（Release）結束後再延後 `0.02s` 呼叫 `.stop()` 並斷開節點參考以利 GC 回收。

---

## 2. 合成樂器音色庫設計（Shared Instrument Voices）

所有 5 首 BGM 共用以下 5 種精細調校的合成音色，並依曲目微調濾波截止頻率與空間濕度：

| 音色 ID | 樂器角色 | 合成結構（Oscillators + Filter + Envelope） | 聽覺質感目標 |
| :--- | :--- | :--- | :--- |
| `FeltPiano` | 柔音原聲鋼琴（主奏／分解和弦） | 主振盪器 `triangle`（音量 `0.75`）+ 次振盪器 `sine`（高八度泛音 `0.18`）+ 低八度微弱基音 `sine`（`0.12`）；經過隨力度連動之 `lowpass` 濾波（`cutoff = 1100 Hz + velocity * 1900 Hz`, `Q = 0.8`）；加入 `12ms` 極短帶通噪音槌擊聲（`bandpass 900 Hz`, gain `0.03`）。ADSR：`A=0.008s, D=0.35s, S=0.22, R=0.85s`。送入 Reverb `28%`。 | 接近毛氈鋼琴（Felt Piano）的溫潤木質共鳴，柔和不刺耳。 |
| `MusicBox` | 八音盒／水晶風鈴（追憶／高音點綴） | 基音 `sine`（`0.85`）+ 泛音 `sine` 於 `3.0 × freq`（`0.12`, 快速衰減 `0.18s`）+ 微量極高頻金屬泛音 `5.4 × freq`（`0.04`, 衰減 `0.09s`）。ADSR：`A=0.003s, D=1.2s, S=0.0, R=0.4s`。送入 Reverb `38%`。 | 清澈透亮、帶有夏日懷舊感的水晶顆粒音。 |
| `WarmRhodes` | 暖色電鋼琴（和弦墊底／日常律動） | 基音 `sine`（`0.85`）+ 微幅 FM 調變（調變率 `2.0 × freq`, index `0.35` 隨 `0.12s` 指數衰減呈現撞擊音叉感）+ `triangle`（`0.15` 經 `lowpass 1200 Hz`）。ADSR：`A=0.012s, D=0.6s, S=0.45, R=0.7s`。送入 Reverb `24%`。 | 如午後陽光灑落榻榻米的溫厚和弦襯底。 |
| `StringPad` | 類比弦樂群（情感鋪陳／暗湧張力） | 3 組微失諧振盪器（`sawtooth` `-7 cents`、`sawtooth` `+7 cents`、`triangle` `0 cents`）混合，經由 24dB 串聯 `lowpass` 濾波（基頻 `650 Hz ～ 1800 Hz`，由極慢 LFO `0.12 Hz` 輕微呼吸開合，`Q = 0.7`）。ADSR：`A=0.65s ～ 1.1s, D=0.4s, S=0.75, R=1.4s`。送入 Reverb `40%`。 | 絲滑流動的弦樂雲層，毫無尖銳鋸齒波毛邊。 |
| `SoftBass` | 暖低音（Root 支撐） | `sine`（`0.85`）+ `triangle`（`0.25` 經 `lowpass 280 Hz`）。ADSR：`A=0.03s, D=0.4s, S=0.6, R=0.5s`。乾聲為主（Reverb `5%`）。 | 穩定托住和聲重心，不與手機小喇叭產生渾濁共振。 |

---

## 3. 五首循環 BGM 完整編曲規格（BGM Tracks）

> **交叉淡入淡出規則**：
> - 當劇本觸發 `[BGM: target_id]`：
>   1. **同曲冪等檢查（Idempotency）**：若 `target_id === currentTrackId` 且正在播放，**絕不重新啟動曲目**，維持原相位無縫續播（例如 `sc_01` 與標題畫面皆使用 `title_breeze` 時可直接延續）。
>   2. **標準跨曲切換**：舊曲目在 **`1000ms`** 內平順淡出（Gain 降至 `0.0001` 後停止排程並釋放）；新曲目同步在 **`1000ms`** 內淡入至目標增益（採用 Equal-Power 曲線 `cos / sin` 或對稱 `linearRampToValueAtTime` 避免中間音量塌陷）。
>   3. **標題「從頭開始」特例**：依 [`GAME_SPEC.md`](GAME_SPEC.md) §2.3，若從標題進入開頭黑屏過場，可先以 **`800ms`** 淡出（若序章首節點同樣指定 `title_breeze` 則依劇本指令重新於 `sc_01` 優雅淡入或無縫銜接，實作上建議由 `sc_01` 的 `[BGM:]` 指令為準，點擊「從頭開始」時先做 `800ms` 淡出再讓 `sc_01` 進場）。

---

### 3.1 `title_breeze` — 微風序曲（Title Screen / Ending Gallery / 序幕初抵 / END_04 終幕）
- **情感意象**：盛夏尾聲穿過白色紗簾的微風、澄澈透明的天空與帶著淡淡惆悵的溫柔序章。
- **速度與拍號**：**76 BPM**｜`4/4` 拍｜1 小節 `3.158s`｜**8 小節循環（總長 `25.263s`）**
- **調性與音階**：**D 大調（D Major / B 小調平行調色彩）**，大量使用 `maj9` 與 `add9` 開放和弦營造空氣感。
- **和弦進行（每小節 1 個和弦）**：
  - Bar 1: `Dmaj9` (`D3, A3, E4, F#4, C#5`)
  - Bar 2: `A/C#` (`C#3, A3, E4, A4`)
  - Bar 3: `Bm7` (`B2, F#3, A3, D4, F#4`)
  - Bar 4: `Gmaj7` (`G2, D3, F#3, B3, D4`)
  - Bar 5: `Dmaj9/F#` (`F#2, D3, A3, E4`)
  - Bar 6: `Em7` (`E2, B2, D3, G3, B3`)
  - Bar 7: `Asus4` (`A2, E3, A3, D4, E4`)
  - Bar 8: `A7(add13)` (`A2, E3, G3, C#4, F#4`)
- **聲部編排**：
  - **FeltPiano（稀疏高音琶音與旋律）**：以四分音符與八分音符留白為主（`velocity 0.48–0.65`）：
    - Bar 1: Beat `1.0` `F#5`(1.5拍), `2.5` `A5`(0.5), `3.0` `E5`(1.5)
    - Bar 2: Beat `1.0` `C#5`(2.0), `3.0` `E5`(1.0), `4.0` `A4`(1.0)
    - Bar 3: Beat `1.0` `D5`(1.5), `2.5` `F#5`(0.5), `3.0` `A4`(2.0)
    - Bar 4: Beat `1.0` `B4`(1.5), `2.5` `D5`(1.5), `4.0` `F#5`(1.0)
    - Bar 5: Beat `1.0` `E5`(1.5), `2.5` `D5`(0.5), `3.0` `A4`(2.0)
    - Bar 6: Beat `1.0` `G4`(1.0), `2.0` `B4`(1.0), `3.0` `D5`(1.5), `4.5` `E5`(0.5)
    - Bar 7: Beat `1.0` `D5`(2.0), `3.0` `C#5`(1.0), `4.0` `A4`(1.0)
    - Bar 8: Beat `1.0` `E5`(2.5), `3.5` `F#5`(0.5), `4.0` `A5`(1.0)（高八度餘韻引導回 Bar 1）
  - **MusicBox（玻璃風鈴般的高音點綴）**：僅於每 2 小節第 `3.5` 或 `4.0` 拍輕點 1–2 個結晶高音（如 `A6`、`F#6`、`E6`，`velocity 0.25`）。
  - **StringPad（極輕空氣鋪底）**：跟隨和弦根音與五音＋九音（`A3, E4, F#4` 等中音域），增益極低（`0.16`），像遠方熱氣流動。

---

### 3.2 `summer_day` — 盛夏日常（老宅玄關、午後日常與村落微光）
- **情感意象**：木造走廊上的斑駁日影、微甜麥茶、既令人安心又略顯靜止的時間感。
- **速度與拍號**：**88 BPM**｜`4/4` 拍｜1 小節 `2.727s`｜**8 小節循環（總長 `21.818s`）**
- **調性與音階**：**G 大調（G Major / G 五聲音階親和旋律）**
- **和弦進行（每小節 1 個和弦）**：
  - Bar 1: `Gmaj7` (`G2, D3, F#3, B3`)
  - Bar 2: `D/F#` (`F#2, D3, A3, D4`)
  - Bar 3: `Em7` (`E2, B2, D3, G3`)
  - Bar 4: `Bm7` (`B2, F#3, A3, D4`)
  - Bar 5: `Cmaj7` (`C3, G3, B3, E4`)
  - Bar 6: `G/B` (`B2, G3, D4`)
  - Bar 7: `Am7` (`A2, E3, G3, C4`)
  - Bar 8: `D7sus4 -> D7` (Beat 1–2 `D3, G3, A3, C4`, Beat 3–4 `D3, F#3, A3, C4`)
- **聲部編排**：
  - **WarmRhodes（午後律動柱式／滾奏和弦）**：每小節 Beat `1.0` 輕柔滾奏主和弦、Beat `3.5` 輕補一次三音＋七音（`velocity 0.38`），營造慵懶搖曳的午後呼吸。
  - **FeltPiano（溫柔歌唱性主旋律）**：
    - Bar 1: `B4`(1.0), `D5`(0.5), `G5`(1.5), `F#5`(1.0)
    - Bar 2: `D5`(2.0), `A4`(1.0), `B4`(1.0)
    - Bar 3: `G4`(1.5), `B4`(0.5), `E5`(1.0), `D5`(1.0)
    - Bar 4: `B4`(2.5), `A4`(1.5)
    - Bar 5: `G4`(1.0), `A4`(0.5), `B4`(1.5), `E5`(1.0)
    - Bar 6: `D5`(2.0), `B4`(1.0), `G4`(1.0)
    - Bar 7: `C5`(1.5), `B4`(0.5), `A4`(1.0), `G4`(1.0)
    - Bar 8: `A4`(2.5), `B4`(0.5), `D5`(1.0)
  - **SoftBass**：每小節 Beat `1.0` 穩重踏下根音（延音 `2.2` 拍），第 4 與第 8 小節 Beat `3.5` 補一個經過低音（`velocity 0.42`）。

---

### 3.3 `twilight_memory` — 暮色追憶（河岸堤防、夏實重逢、情感流動與苦澀餘韻）
- **情感意象**：夕陽把河堤與水面染成橘紅，十年前舊宅火災的記憶與說不出口的愧疚順著晚風浮現。
- **速度與拍號**：**68 BPM**｜`3/4` 拍（優雅略帶孤寂感的華爾滋搖曳拍）｜1 小節 `2.647s`｜**8 小節循環（總長 `21.176s`）**
- **調性與音階**：**E 小調（E Natural Minor / Dorian 轉折）**
- **和弦進行（每小節 1 個和弦）**：
  - Bar 1: `Em9` (`E2, B2, F#3, G3, D4`)
  - Bar 2: `Cmaj7` (`C3, G3, B3, E4`)
  - Bar 3: `Am7` (`A2, E3, G3, C4`)
  - Bar 4: `B7sus4 -> B7` (Beat 1–2 `B2, F#3, A3, E4`, Beat 3 `B2, F#3, A3, D#4`)
  - Bar 5: `Em7` (`E2, B2, D3, G3`)
  - Bar 6: `D6` (`D3, A3, B3, F#4`)
  - Bar 7: `Cmaj7` (`C3, G3, B3, E4`)
  - Bar 8: `Bsus4 -> B7` (Beat 1–2 `B2, E3, F#3`, Beat 3 `B2, D#3, A3`)
- **聲部編排**：
  - **FeltPiano（左手 3/4 分解琶音＋右手深情旋律）**：
    - 左手固定六連八分音符流動（Beat `1.0`, `1.5`, `2.0`, `2.5`, `3.0`, `3.5`：`Root - 5th - 9th/3rd - 7th - 5th - 3rd`，`velocity 0.34` 柔如流水）。
    - 右手主旋律（`velocity 0.52–0.68`）：
      - Bar 1: `B4`(2.0), `G4`(1.0)
      - Bar 2: `E5`(1.5), `D5`(0.5), `B4`(1.0)
      - Bar 3: `C5`(2.0), `B4`(1.0)
      - Bar 4: `A4`(2.0), `F#4`(1.0)
      - Bar 5: `G4`(1.5), `A4`(0.5), `B4`(1.0)
      - Bar 6: `F#5`(1.5), `E5`(0.5), `D5`(1.0)
      - Bar 7: `E5`(2.0), `B4`(1.0)
      - Bar 8: `B4`(2.0), `D#5`(1.0)（導回 `Em9` 的 `E5`/`B4` 產生強烈的宿命回環感）
  - **MusicBox**：於第 3、4、7、8 小節複奏高八度主音（`velocity 0.22`），象徵兒時記憶閃回。
  - **StringPad**：長音延展內聲部五度音（`B3`, `G3`, `F#3`），於 Bar 4 與 Bar 8 漸強至 `0.24` 後回落。

---

### 3.4 `tension_secret` — 暗湧秘密（流言發酵、深夜和室、壓抑與禁忌對峙）
- **情感意象**：關緊木雨戶後的窒息靜謐、村人的竊竊私語、不敢觸碰卻就在枕邊的真相。
- **速度與拍號**：**62 BPM**｜`4/4` 拍｜1 小節 `3.871s`｜**8 小節循環（總長 `30.968s`）**
- **調性與音階**：**C# 小調（C# Minor / Phrygian 微暗色彩，含 `D4` 減二度張力音）**
- **和弦進行（每小節極簡和聲張力）**：
  - Bar 1: `C#m(add9)` (`C#2, G#2, D#3, E3`)
  - Bar 2: `C#m/B` (`B1, G#2, E3`)
  - Bar 3: `A(add#11)` (`A1, E2, C#3, D#3`)
  - Bar 4: `G#sus4 -> G#7` (`G#1, D#2, C#3` -> `B#2/C3`)
  - Bar 5: `C#m` (`C#2, G#2, E3`)
  - Bar 6: `Dmaj7/C#` (`C#2, A2, D3, F#3` — *Phrygian 壓迫感*)
  - Bar 7: `F#m7` (`F#2, C#3, E3, A3`)
  - Bar 8: `G#7(b9)` (`G#1, D#2, F#2, A2, C3`)
- **聲部編排**：
  - **StringPad（低頻顫動深層鋪底）**：`lowpass` 截止頻率壓低於 `420 Hz ～ 780 Hz` 之間緩慢擺動，搭配極微幅振幅震顫（Tremolo LFO `3.8 Hz`, depth `0.08`），製造不安的空間壓迫感。
  - **FeltPiano（稀疏孤立的高冷單音）**：刻意留出大量靜默，僅在特定拍點落下帶有長殘響的單音或小二度／減五度雙音（`velocity 0.36–0.50`）：
    - Bar 1: Beat `1.5` `G#4`, Beat `3.5` `D#5`
    - Bar 2: Beat `2.0` `E5`, Beat `4.0` `C#5`
    - Bar 3: Beat `1.0` `D#5`, Beat `3.0` `C#5`
    - Bar 4: Beat `2.5` `B#4 (C5)`（不穩定停頓）
    - Bar 5: Beat `1.5` `E4`, Beat `3.0` `G#4`
    - Bar 6: Beat `1.0` `A4`, Beat `3.5` `D5`（極具緊張感的降二代音）
    - Bar 7: Beat `2.0` `C#5`, Beat `4.0` `A4`
    - Bar 8: Beat `1.0` `G#4`, Beat `3.5` `A4` -> 懸空歸於寂靜
  - **Subtle Tension Pulse（隱約心跳低頻脈衝）**：極柔和的正弦低音脈衝（`65 Hz -> 44 Hz`, gain 僅 `0.12`，經 `lowpass 110 Hz`），僅於每小節 Beat `1.0` 與 Beat `1.35`（模擬遙遠心跳間隔）輕敲一次，點到為止、不喧賓奪主。

---

### 3.5 `climax_choice` — 終夜抉擇（終盤直面真相、情感潰堤與最終選擇）
- **情感意象**：暴風雨般的告白與積壓十年的淚水決堤，所有線索與羈絆在此刻匯流成無可迴避的命運。
- **速度與拍號**：**84 BPM**｜`4/4` 拍｜1 小節 `2.857s`｜**8 小節循環（總長 `22.857s`）**
- **調性與音階**：**F# 小調 → A 大調澎湃昇華（F# Minor to A Major Epic Resolution）**
- **和弦進行（每小節飽滿進行）**：
  - Bar 1: `Dmaj7` (`D2, A2, F#3, C#4`)
  - Bar 2: `E6` (`E2, B2, G#3, C#4`)
  - Bar 3: `C#m7` (`C#2, G#2, E3, B3`)
  - Bar 4: `F#m9` (`F#2, C#3, G#3, A3`)
  - Bar 5: `Bm7` (`B2, F#3, A3, D4`)
  - Bar 6: `E7sus4 -> E7` (`E2, B2, A3, D4` -> `G#3, D4`)
  - Bar 7: `Amaj7` (`A2, E3, G#3, C#4` — *情感豁然開朗的光亮轉折*)
  - Bar 8: `C#7/G#` (`G#2, F3(E#3), B3, C#4` — *強烈拉回下一次輪迴張力*)
- **聲部編排**：
  - **FeltPiano（八分音符急流分解伴奏＋高張力八度主旋律）**：
    - 左手全八分音符推進伴奏（Beat `1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5`：`Root - 5th - 8th - 5th` 上下翻湧，`velocity 0.50`）。
    - 右手主旋律以高情感張力歌唱（`velocity 0.68–0.82`，重點拍點加低八度疊音）：
      - Bar 1: `C#5`(1.5), `D5`(0.5), `E5`(1.0), `F#5`(1.0)
      - Bar 2: `E5`(2.0), `B4`(1.0), `C#5`(1.0)
      - Bar 3: `G#5`(1.5), `F#5`(0.5), `E5`(1.0), `C#5`(1.0)
      - Bar 4: `A5`(2.5), `G#5`(0.5), `F#5`(1.0)
      - Bar 5: `F#5`(1.5), `E5`(0.5), `D5`(1.0), `C#5`(1.0)
      - Bar 6: `E5`(2.0), `D5`(1.0), `B4`(1.0)
      - Bar 7: `A5`(1.5), `G#5`(0.5), `E5`(1.5), `C#5`(0.5)
      - Bar 8: `G#5`(2.0), `F#5`(1.0), `E#5 (F5)`(1.0)
  - **StringPad（情感湧浪弦樂）**：濾波截止頻率隨小節推進逐漸敞開（Bar 1 `800 Hz` → Bar 4 `1600 Hz` → Bar 7 `2200 Hz`），增益同步從 `0.22` 抬升至 `0.38`，塑造直擊心臟的高潮飽滿感。
  - **SoftBass**：於 Beat `1.0` 與 `3.0` 強有力支撐根音（`velocity 0.60`）。

---

## 4. 劇本音效（`[SFX: ...]`）與夏蟬環境層規格

以下 6 組 ID 嚴格對應 [`SCRIPT_SPEC.md`](SCRIPT_SPEC.md) §2.3。所有 SFX 皆設計為**即時程式合成**且共用 `masterSfxGain` 保護機制。

### 4.1 `cicada_ambience` — 夏末蟬鳴環境音層（可切換之懷舊背景音床）
> **核心規範（務必遵守，防止聽覺疲勞）**：《夏末蟬鳴的彼岸》全作多次觸發 `[SFX: cicada_ambience]`，若設計為尖銳持續高頻嘶鳴將極度折磨玩家！必須實作為**溫暖、遠景、非堆疊式（Single-Instance）的懷舊夏蟬合唱波浪**。

- **觸發與生命週期管理**：
  - **單一實例防重複**：同一時間僅允許一個 `cicada_ambience` 實例存在。若已在播放中再次收到 `[SFX: cicada_ambience]`，僅輕微重振一次 `8s` 呼吸波峰（不疊加音軌）。
  - **兩種情境模式（配合劇本節奏）**：
    - **日間環境駐留（Sustain Mode）**：在 `summer_day`、`twilight_memory`、`title_breeze` 期間觸發後，維持極輕微的背景蟬鳴（最大增益上限 **`-22 dBFS` / linear `0.075`**），並每 `10s～14s` 自然淡起又退遠（模擬遠處樹林蟬聲隨熱風陣陣飄來）。
    - **自動淡出時機**：當場景切換至 `tension_secret`、`climax_choice`、`bg_nightroom` 或讀檔／回到標題時，除非該節點同時明確下達 `[SFX: cicada_ambience]`（如 `END_01` 結局對比），否則在 **`1200ms`** 內平滑淡出。
- **合成配方（營造 *ツクツクボウシ / ミンミンゼミ* 的遠方立體合唱）**：
  1. 基底音源：長度 `4.0s` 循環緩衝區之 **Pink Noise**（粉紅噪音，天然高頻滾降比白噪音柔和許多）。
  2. 雙層濾波塑形：
     - 層 A（中遠景鳴叫主體）：`bandpass` 中心頻率 `3450 Hz` (`Q = 2.8`) + 串聯 `lowpass 5800 Hz`（**嚴格切除 6kHz 以上刺耳嘶音！**）。
     - 層 B（近林微弱共振）：`bandpass` 中心頻率 `2150 Hz` (`Q = 2.2`)，聲像微偏右 `pan = +0.25`。
  3. 雙重振幅調變（Dual AM Modulation）：
     - **振翅脈動 LFO 1**：`14.5 Hz` 正弦波調變層 A 增益（深度 `0.45`），重現夏蟬特色的規律振翅起伏（*shaa-shaa-shaa*）。
     - **遠近呼吸 LFO 2**：`0.11 Hz`（約 `9 秒` 一循環）極緩慢調變總體輸出在 `0.025 ～ 0.075` 之間起伏，讓蟬聲像遠方熱浪時近時遠。

### 4.2 `wind_chime` — 神社玻璃風鈴（`furin`）
- **使用時機**：神社鳥居（`bg_shrine`）、夏實登場、微風拂過、以及結局溫暖餘韻。
- **合成配方**：
  1. **氣流觸發（Wind Breath）**：`0.28s` 高通粉紅噪音（`highpass 1800 Hz` -> `bandpass 2800 Hz`），包絡快速淡入 `0.06s`、淡出 `0.22s`（gain `0.03`），模擬微風吹動短冊紙籤的氣息。
  2. **玻璃泛音群（Inharmonic Glass Cluster）**：4 組獨立 `sine` 振盪器於起音後 `0.03s` 依序相隔 `18ms～35ms` 輕敲（模擬玻璃舌撞擊內壁與輕微餘擺雙擊）：
     - Partial 1: `1760 Hz` (`A6`), gain `0.16`, decay `1.9s`
     - Partial 2: `2637 Hz` (`E7`), gain `0.11`, decay `1.6s`
     - Partial 3: `3595 Hz`（微偏離整數倍的真實玻璃泛音）, gain `0.07`, decay `1.3s`
     - Partial 4: `4890 Hz` (`D#8`), gain `0.035`, decay `0.9s`
  3. **可選雙擊餘韻**：延後 `0.28s` 再補一組極輕微的 `0.45×` 音量撞擊，送入 Reverb `55%`，營造空靈神社迴音。

### 4.3 `choice_confirm` — 選項確認輕響 &「心境波動」變體
- **使用時機**：玩家點擊一般選項時（或於選擇肢出現／確認時由系統自動觸發，對齊 [`SCRIPT_SPEC.md`](SCRIPT_SPEC.md) §109 與 [`GAME_SPEC.md`](GAME_SPEC.md) §5.1）。
- **標準版（`choice_confirm` / 預設）**：
  - 柔和水滴／豎琴泛音雙音：`D5 (587.33 Hz)` + `A5 (880.00 Hz)`（間隔 `22ms` 滾奏），使用 `MusicBox` 音色，gain `0.18`，decay `0.65s`，Reverb `35%`。清澈而不打斷思緒。
- **「心境波動」變體（Pivotal Choice Feedback — 依據選項影響之隱藏數值自動挑選細微音色，對齊 `GAME_SPEC.md` §5.1）**：
  - 當選項顯著改變數值（`±2`）或翻轉布林旗標時，系統除閃過 `✦ 心境產生了波動` 視覺微光外，於標準確認音後疊加極輕柔（`0.12` gain）之不劇透聽覺暗示：
    1. **`outsideBond` 上升（外界連結／夏實）**：疊加一聲極高遠的 `wind_chime` 單音泛音（`3520 Hz`, decay `1.2s`）。
    2. **`dependency` 上升（兄妹封閉／內縮）**：疊加一聲極低沉溫潤的木地板／大提琴撥弦共鳴（`D3 146.8 Hz` 經 `lowpass 380 Hz`, decay `0.8s`）。
    3. **`truth` 推進或 `confronted_past`（直面過去）**：疊加一聲清脆翻頁氣息（`bandpass 1600 Hz` `90ms` 短噪音）＋微弱高音水晶鈴（`E6 1318.5 Hz`, decay `0.9s`）。

### 4.4 `heartbeat` — 緊繃心跳（`lub-dub`）
- **使用時機**：面對關鍵質問、十年前真相刺痛內心、深夜和室緊張時刻。
- **合成配方（真實胸腔雙重低頻震動）**：
  - **第一拍（Lub，較重）**於 `t = 0.00s`：
    - `sine` 振盪器：頻率 `88 Hz` 於 `0.08s` 內快速指數下滑至 `42 Hz`
    - Gain 包絡：`A = 0.012s` 升至 `0.38` → `0.16s` 衰減至 `0.0001`
    - 串聯 `lowpass 140 Hz` (`Q = 1.2`) 增加悶實胸腔感
  - **第二拍（Dub，略短微輕）**於 `t = 0.19s`：
    - `sine` 振盪器：頻率 `76 Hz` 於 `0.07s` 內下滑至 `38 Hz`
    - Gain 包絡：`A = 0.010s` 升至 `0.26` → `0.13s` 衰減至 `0.0001`
  - **可選 BGM 微閃避（Subtle Ducking）**：觸發瞬間讓 `bgmPreGain` 於 `0.12s` 輕微下潛至 `0.78` 後於 `0.55s` 回復 `1.0`，突出窒息停頓感。

### 4.5 `door_slide` — 和室木拉門／雨戶推拉聲
- **使用時機**：進出舊宅玄關、推開木拉門、拉開或關緊防風雨戶（`flag_opened_shutters`）。
- **合成配方（摩擦滑動軌道＋木框輕叩收尾）**：
  1. **木軌滑動摩擦聲（`0.00s ～ 0.42s`）**：
     - 粉紅噪音經 `bandpass` 濾波，中心頻率隨曲線掃動：`420 Hz (0.0s) → 880 Hz (0.18s) → 360 Hz (0.42s)`（`Q = 2.4`）。
     - 疊加一個 `22 Hz` 三角波輕微調變增益（深度 `0.25`），模擬木門滑過老舊木槽溝時細微的顆粒振動感。
     - Gain 包絡：`A = 0.04s` 至 `0.16` → `0.34s` 緩落 → `0.42s` 歸零。
  2. **門框撞擊停頓（`0.39s ～ 0.54s`）**：
     - 低沉木頭叩擊聲：`triangle` 振盪器 `135 Hz → 58 Hz`（`0.06s` 下滑），搭配極短 `bandpass 320 Hz` 噪音（`0.03s`），gain `0.22`，decay `0.14s`。

### 4.6 `memory_flash` — 十年前記憶閃回
- **使用時機**：腦海閃過十年前河岸意外畫面、打開塵封舊箱、強烈情感衝擊瞬間。
- **合成配方（反向吸氣光暈 → 刺耳又惆悵的遙遠鐘鳴）**：
  1. **前導倒放感氣流掃頻（Reverse-Style Shimmer Swell, `0.00s ～ 0.45s`）**：
     - 過濾噪音（`bandpass` 從 `400 Hz` 指數上揚至 `3600 Hz`, `Q = 3.5`）搭配漸強和聲霧氣（`F#5 + C#6` 靜音漸強），於 `0.45s` 達到峰值 `0.24` 後瞬間截斷進入靜止點（`15ms` 淡出）。
  2. **記憶衝擊鐘鳴（Bell Resonance Impact, `0.45s ～ 2.20s`）**：
     - 高音結晶鐘聲雙音：`E6 (1318.5 Hz)` + `B6 (1975.5 Hz)` + 些微失諧泛音 `1324 Hz`（製造懷舊老電影／眩暈的拍頻震顫感），gain `0.22`，自然長衰減 `1.75s`，重度送入 Reverb（`65%`）。
     - 同步伴隨極短暫的 BGM 濾波暗化或音量下潛（`0.45s` 降至 `0.65`，於 `1.4s` 平滑恢復），強化「時間抽離感」。

---

## 5. 打字機逐字音效與 UI 微互動規格（Typewriter & UI Polish）

Galgame 的長篇閱讀是否舒適，**80% 取決於打字機音效不刺耳且不機械**。嚴禁使用粗糙的 `square` / `sawtooth` 嗶聲！

### 5.1 溫柔不疲勞的逐字音（Typewriter Tick）
- **合成結構（Damped Felt-Wood Tap）**：
  - 核心振盪器：單一 `sine` 振盪器（極少量 `triangle` `0.15` 增添木質溫潤感）。
  - 音色濾波：`lowpass 1400 Hz`（柔和切除一切高頻點擊尖刺）。
  - 超短包絡：`Attack = 0.003s` → `Decay = 0.024s` 降至 `0.0001`（總長僅約 `28ms`）。
- **角色專屬聲線調音（依說話者自動切換）**：

| 說話者 ID | 基礎基頻（Base Freq） | 音量增益（Linear Gain） | 聽覺形象 |
| :--- | :--- | :--- | :--- |
| `kotori`（小鳥遊 琴理） | `520 Hz` | `0.048`（約 `-26 dB`） | 輕柔、纖細、如指尖輕觸毛氈鋼琴鍵盤 |
| `natsumi`（宮代 夏實） | `430 Hz` | `0.058`（約 `-24.5 dB`） | 溫暖、清朗、如同木質馬林巴琴的親切感 |
| `yuma` / 旁白（無名牌） | `355 Hz` | `0.042`（約 `-27.5 dB`） | 沉靜克制、像鋼筆筆尖輕劃紙面的微響 |

- **防疲勞與防削波三大守則**：
  1. **音高隨機微調（Pitch Variance）**：每次發聲皆乘以 `0.92 ～ 1.08` 隨機倍率（**`±8%`**），避免連續同音高造成腦袋嗡嗡作響。
  2. **節流冷卻（Throttling）**：設定嚴格最小發聲間隔 **`52ms`**（約每秒最多 18 聲）。即使玩家調整極快文字速度、或一幀內輸出多個中文字，多餘觸發會被直接略過，絕不重疊爆音。
  3. **標點與模式靜音（Smart Skipping）**：
     - 遇到空白、換行及標點符號（`，。、…！？「」『』—・：；`）時**不發聲**，創造自然的說話呼吸頓點。
     - 當玩家點擊「立即完成整句」或處於 **`Skip`（已讀快進 `80ms/句`）** 模式時，**完全禁止**觸發打字機音效。

### 5.2 介面操作微音效（UI Navigation SFX）
所有 UI 音效一律精簡短促、維持低音量（`-22 dB ～ -28 dB`），不搶奪 BGM 風采：

| UI 動作 | 音效設計 | 合成參數摘要 |
| :--- | :--- | :--- |
| **對話推進（`ui_advance`）** | 輕微翻頁／高音氣息點綴（僅在句末按點擊推進時觸發，完成打字瞬間不重複發聲） | 極輕高通粉紅噪音 `2200 Hz`（`45ms`, gain `0.03`）+ 微弱 `MusicBox` `A5`（`0.05s`, gain `0.035`） |
| **選項懸停（`ui_hover`）** | Desktop 滑鼠懸停選擇肢（防連觸冷卻 `65ms`） | `sine` `680 Hz → 740 Hz`（`25ms`, gain `0.035`, `lowpass 1500 Hz`） |
| **存檔成功（`ui_save`）** | 溫馨上行三音確認（書籤夾入書頁的安心感） | `WarmRhodes` 快速琶音 `G4 (392 Hz)` → `B4 (493.9 Hz)` → `D5 (587.3 Hz)`，每音間隔 `65ms`，gain `0.13`，Reverb `30%` |
| **讀檔成功（`ui_load`）** | 柔和記憶喚醒（下行接續主音） | `WarmRhodes` `D5` → `A4 (440 Hz)` → `G4`，每音間隔 `70ms`，gain `0.13`，搭配新場景 BGM `1000ms` 淡入 |
| **開啟／關閉選單（`ui_modal`）** | 柔霧切換感（Log / Save / Settings / Gallery） | 開啟：`sine 320→480 Hz` (`60ms`, gain `0.05`)；關閉：`sine 440→280 Hz` (`55ms`, gain `0.04`) |
| **錯誤／無效操作（`ui_blocked`）** | 嘗試讀取空存檔槽或不可執行動作 | 柔和高音悶敲兩下 `220 Hz` 經 `lowpass 500 Hz`（`40ms × 2`, gain `0.06`），不刺耳 |

---

## 6. 瀏覽器相容性、UX 安全與設定持久化規範

### 6.1 首次互動解鎖機制（AudioContext Unlock Policy）
現代桌面與行動端瀏覽器（Chrome、Safari、iOS WebKit）皆禁止在未經使用者手勢前播放聲音，系統必須實作以下零失敗解鎖流程：
1. **惰性建立與狀態檢查**：初始化時可建立 `AudioContext`（若為 `suspended` 狀態不報錯），並記錄 `pendingBgmId = 'title_breeze'`。
2. **全域一次性解鎖監聽**：於 `window` 註冊 `{ capture: true, passive: true }` 監聽 `pointerdown`、`keydown`、`touchstart`：
   - 觸發時立即呼叫 `await audioCtx.resume()`。
   - 若為 iOS Safari 嚴格限制，同步播放一個 `1-sample` 靜音 `AudioBuffer` 以確保硬體通道徹底解鎖。
   - 解鎖完成後移除監聽器，並立即將排隊中的 `pendingBgmId`（標題畫面之 `title_breeze`）以 **`600ms` 柔和淡入**啟動，避免突然炸音。
3. **分頁切換恢復**：監聽 `document.visibilitychange`，當玩家從背景切回分頁（`visible`）且未手動靜音時，若 `audioCtx.state === 'suspended'` 或 `'interrupted'`（iOS 常見），於下一次觸控或自動嘗試 `audioCtx.resume()` 恢復背景音樂。

### 6.2 HUD 靜音鍵與系統設定介面（UI Controls）
1. **HUD 常駐靜音按鈕（Quick Mute Toggle）**：
   - 置於遊戲上方控制列（Desktop 右上膠囊列／Mobile 頂部安全區，觸控尺寸 **`≥ 44×44 px`**），並確保點擊時 `event.stopPropagation()`，絕不誤觸發下一句對話。
   - 清晰顯示兩種狀態圖示（🔊 音效開啟 / 🔇 已靜音），點擊瞬間於 `25ms` 內平滑切換 `masterMuteGain`，同時同步儲存設定。
2. **系統設定視窗（System / Settings Modal）音量控制**：
   - **主靜音開關（Mute All）**：與 HUD 靜音按鈕雙向同步。
   - **BGM 音量滑桿（`0% ～ 100%`）**：預設 **`70%`**（`0.70`），拖曳時即時更新 `masterBgmGain`（不需按確認鍵即刻有感）。
   - **SFX 音量滑桿（`0% ～ 100%`）**：預設 **`80%`**（`0.80`），拖曳放開（`pointerup` / `change`）時可自動播放一聲輕柔的 `choice_confirm` 供玩家即時試聽音量。
   - **夏蟬環境音開關（Cicada Ambience Toggle）**：預設 **`ON`**；供對環境蟲鳴敏感的玩家隨時單獨關閉 `cicada_ambience`，而不影響其他劇情音效。

### 6.3 持久化儲存結構（對齊 `cicada_vn_meta_v1`）
依據 [`GAME_SPEC.md`](GAME_SPEC.md) §5.3，音訊偏好設定統一寫入 `localStorage` 鍵值 `cicada_vn_meta_v1` 內的 `audioSettings` 欄位（更新時應保留同物件內的 `unlockedEndings` 與 `readNodes`）：

```json
{
  "audioSettings": {
    "muted": false,
    "bgmVolume": 0.7,
    "sfxVolume": 0.8,
    "cicadaEnabled": true
  }
}
```

### 6.4 讀檔與章節跳轉音訊同步規則
- **讀取存檔（Load Slot）**：還原該存檔節點最後生效的 `activeBgm`（執行 `1000ms` 交叉淡入）與 `cicadaActive` 狀態；同時立即中斷進行中的打字機餘音與一次性 SFX。
- **返回標題（Return to Title）**：依 [`GAME_SPEC.md`](GAME_SPEC.md) §6.3 確認後，以 `800ms` 淡出當前場景 BGM 與蟬鳴層，進入標題畫面時平順淡入 `title_breeze`。

---

## 7. 開發者公開 API 契約建議（AudioEngine Interface）

建議於前端模組（如 `src/audio/AudioEngine.js`）封裝為單例類別，提供以下精簡且易於和腳本引擎串接的介面：

| 方法簽名 | 職責與預期行為 |
| :--- | :--- |
| `audioEngine.unlock()` | 解鎖 `AudioContext`、讀取 `cicada_vn_meta_v1` 音量設定，並淡入待機中的 BGM。 |
| `audioEngine.playBGM(trackId, fadeMs = 1000)` | 切換至指定 BGM（`title_breeze` \| `summer_day` \| `twilight_memory` \| `tension_secret` \| `climax_choice`）。若與現行曲目相同則直接忽略；若情境切換至深夜且未特別指定，自動淡出駐留蟬鳴。 |
| `audioEngine.stopBGM(fadeMs = 800)` | 平滑淡出所有 BGM（用於「從頭開始」過場黑屏或結局靜默餘韻）。 |
| `audioEngine.playSFX(sfxId, options?)` | 觸發劇本指定 SFX（`cicada_ambience` \| `wind_chime` \| `choice_confirm` \| `heartbeat` \| `door_slide` \| `memory_flash`）。其中 `choice_confirm` 可傳入 `{ resonance: 'none' \| 'outsideBond' \| 'dependency' \| 'truth' }` 以自動疊加「心境波動」細微泛音。 |
| `audioEngine.stopAmbience(fadeMs = 1200)` | 平滑淡出駐留中的 `cicada_ambience`。 |
| `audioEngine.playTypeTick(speakerId, char)` | 依說話者（`kotori` \| `natsumi` \| `yuma`）與字元決定是否播放柔和打字機音效；自動執行標點略過、`52ms` 節流與 `±8%` 音高微調。 |
| `audioEngine.playUI(uiId)` | 播放介面微音效（`advance` \| `hover` \| `save` \| `load` \| `modal_open` \| `modal_close` \| `blocked`）。 |
| `audioEngine.setAudioSettings({ muted, bgmVolume, sfxVolume, cicadaEnabled })` | 即時調整各匯流排增益並同步更新 `localStorage` 中的 `cicada_vn_meta_v1`。 |

---

## 8. 音效與音樂驗收清單（Audio QA Checklist）

- [ ] **零報錯自動解鎖**：初次載入頁面無瀏覽器 Console AudioContext 報錯；首次點擊畫面任何處（包含「從頭開始」或背景）後 `title_breeze` 柔和淡入且無爆音。
- [ ] **5 首曲目辨識度與無縫循環**：`title_breeze`、`summer_day`、`twilight_memory`、`tension_secret`、`climax_choice` 各自呈現明確的情緒差異與節奏推進，且 8 小節首尾循環點完全無卡頓或振幅斷層。
- [ ] **1000ms 平滑交叉淡換 & 同曲冪等**：切換 `[BGM:]` 時呈現柔順交叉淡化；連續節點若為同一首曲目不會重頭再播；點擊「從頭開始」可正確執行 `800ms` 淡出。
- [ ] **夏蟬環境音不刺耳、不疊加**：`cicada_ambience` 音量克制且呈現遠近呼吸起伏；連續多次觸發不會音軌疊加破音；切換至深夜場景或開啟設定關閉蟬鳴時能平滑淡出。
- [ ] **打字機與心境波動反饋**：`kotori`、`natsumi`、旁白各自擁有溫柔不疲勞的木質／毛氈輕擊聲；開啟 `Skip` 快進時完全靜音不卡頓；關鍵選擇觸發「心境波動」時能聽見含蓄的差異化泛音暗示。
- [ ] **HUD 與設定持久化**：HUD 靜音鍵及系統選單之 BGM/SFX 滑桿調整即時生效（且不誤觸推進對話），重整瀏覽器（F5）後保留音量與靜音狀態。
