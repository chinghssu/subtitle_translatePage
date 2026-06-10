# 設計文件 (Design)

## 1. 架構總覽

```
┌─────────────────────────────────────────────────────────────┐
│  Chrome / Edge 真實瀏覽器視窗 (OBS Window Capture 擷取此視窗)   │
│                                                               │
│   streamtranslate.live 分頁                                    │
│   ┌─────────────────────────────────────────────┐            │
│   │  原站字幕 DOM (簡體)                            │            │
│   │        │ MutationObserver 監看                  │            │
│   │        ▼                                        │            │
│   │  content.js ── 擷取原始文字 ──► OpenCC s2twp     │            │
│   │        │                          │             │            │
│   │        │                          ▼             │            │
│   │        │                   繁體文字               │            │
│   │        ▼                          │             │            │
│   │  注入式疊層 overlay (#stt-tw-overlay) ◄──────────┘            │
│   │  (透明背景 / 可自訂樣式，顯示繁體字幕)              │            │
│   └─────────────────────────────────────────────┘            │
│                                                               │
│   background.js (service worker)：設定存取、訊息中繼            │
│   popup.html：設定面板                                          │
└─────────────────────────────────────────────────────────────┘
```

## 2. 技術選型

| 項目 | 選擇 | 理由 |
|------|------|------|
| 平台 | Manifest V3 擴充套件 | Chrome / Edge 現行標準 |
| 簡轉繁 | [opencc-js](https://github.com/nk2028/opencc-js) | 純前端、離線、支援 `s2twp`（台灣慣用詞） |
| 字幕監看 | MutationObserver + debounce | 即時、低耗能 |
| 設定儲存 | chrome.storage.local | 持久化、跨分頁同步 |
| 顯示 | 注入式 DOM overlay | 零伺服器，OBS Window Capture 直接擷取 |

## 3. 模組設計

### 3.1 content.js（核心）
- 注入時機：`document_idle`，比對網域 `streamtranslate.live`。
- **字幕擷取**：
  - 讀取設定中的 `subtitleSelector`（預設值 + 可由 popup 覆寫）。
  - 對目標節點掛 `MutationObserver`（`childList` + `characterData` + `subtree`）。
  - 變動時取 `textContent`，與上次比對；有變化才轉換（避免重工）。
  - 啟發式 fallback：若選擇器找不到節點，掃描頁面找最近更新、含 CJK 文字、字級最大的元素作為候選，並在 console 提示。
- **轉換**：呼叫 `OpenCC.Converter({ from:'cn', to:'twp' })`，instance 快取重用。
- **渲染**：維護單一 overlay 容器 `#stt-tw-overlay`，套用使用者樣式，顯示最新 N 行。

### 3.2 opencc 整合
- 將 `opencc-js` 的 UMD bundle 與字典以 `web_accessible_resources` 方式打包，於 content script 載入，確保離線可用、不發外部請求。

### 3.3 overlay 樣式（OBS 友善）
- 固定定位、`pointer-events: none`、高 `z-index`。
- 可調：`fontSize`、`color`、`fontFamily`、`textStroke`（外框）、`textShadow`、`bgColor` + `bgOpacity`、`position`（top/center/bottom）、`maxLines`、整體 `opacity`。
- OBS 模式：背景全透明，OBS 端以 Window Capture + 色鍵/裁切即可乾淨疊加。

### 3.4 background.js（service worker）
- 初始化預設設定（首次安裝）。
- 中繼 popup ↔ content 的設定更新訊息（`chrome.runtime.onMessage`）。

### 3.5 popup.html / popup.js（設定面板）
- 表單即時調整上述樣式與轉換方案、字幕選擇器。
- 「暫停 / 啟用」「OBS 模式」切換。
- 變更即時寫入 `chrome.storage.local` 並廣播到 content。

## 4. 資料流

```
原站字幕變動 → MutationObserver → 取 textContent
  → 去重比對 → OpenCC 轉換 → 更新 overlay DOM
popup 變更設定 → chrome.storage.local → onChanged → content 套用新樣式
```

## 5. 設定資料結構 (chrome.storage.local)

```jsonc
{
  "enabled": true,
  "obsMode": false,
  "conversion": "twp",          // "t" | "tw" | "twp"
  "subtitleSelector": "",        // 空字串 = 用內建預設/啟發式
  "style": {
    "fontSize": 48,
    "color": "#ffffff",
    "fontFamily": "'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
    "textStroke": 2,
    "strokeColor": "#000000",
    "bgColor": "#000000",
    "bgOpacity": 0,
    "position": "bottom",       // "top" | "center" | "bottom"
    "maxLines": 2,
    "opacity": 1
  }
}
```

## 6. 檔案結構

```
subtitle_translatePage/
├─ docs/
│  ├─ requirements.md
│  ├─ design.md
│  └─ tasks.md
├─ extension/
│  ├─ manifest.json
│  ├─ src/
│  │  ├─ content.js
│  │  ├─ background.js
│  │  ├─ overlay.css
│  │  ├─ popup.html
│  │  └─ popup.js
│  ├─ vendor/
│  │  └─ opencc/            # opencc-js bundle + 字典
│  └─ icons/
├─ README.md
└─ .gitignore
```

## 7. OBS 接法

1. 在 Chrome / Edge 安裝本擴充套件（開發者模式載入 `extension/`）。
2. 開啟 streamtranslate.live，於 popup 啟用並切到「OBS 模式」。
3. OBS 新增「視窗擷取」來源，選該瀏覽器視窗。
4. 視需要套色鍵 / 裁切，把繁體字幕疊到直播畫面。

## 8. 未來擴充

- 本機 WebSocket 伺服器 + 獨立 overlay.html，支援 OBS Browser Source 直連。
- 影像字幕 OCR 模式。
- 自訂詞庫（人名、專有名詞修正）。
