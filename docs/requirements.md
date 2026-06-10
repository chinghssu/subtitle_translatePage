# 需求文件 (Requirements)

## 1. 專案目標

製作一個瀏覽器擴充套件，能即時讀取 [streamtranslate.live](https://streamtranslate.live) 串流語音轉文字（STT）所產生的**簡體中文字幕**，將其轉換為**繁體中文（台灣正體用詞）**，並以可自訂樣式的字幕疊層（overlay）即時顯示，供 **OBS** 透過視窗擷取（Window Capture）作為直播 / 錄影的字幕來源。

## 2. 使用情境 (Use Case)

1. 使用者在 Windows 上使用 Chrome / Edge 開啟 `streamtranslate.live`，進行串流語音轉文字。
2. 該站即時產生簡體中文字幕。
3. 本擴充套件偵測到字幕文字，即時轉成繁體中文並渲染於疊層。
4. OBS 以 Window Capture 擷取該瀏覽器視窗（或專屬疊層視窗），疊加到直播畫面上。

## 3. 功能需求 (Functional Requirements)

| 編號 | 需求 | 優先級 |
|------|------|--------|
| FR-1 | 自動偵測並讀取 streamtranslate.live 頁面上的字幕文字 | 必須 |
| FR-2 | 使用 OpenCC-JS 將簡體中文即時轉為繁體中文（預設 `s2twp`，含台灣慣用詞） | 必須 |
| FR-3 | 以疊層即時顯示轉換後的繁體字幕，延遲低於 300ms | 必須 |
| FR-4 | 提供設定面板：字體大小、字體顏色、外框/陰影、背景透明度、位置、最大行數 | 必須 |
| FR-5 | 字幕來源 DOM 選擇器可由使用者自訂（因應原站改版） | 必須 |
| FR-6 | 可切換轉換方案（s2t / s2tw / s2twp） | 應該 |
| FR-7 | 「OBS 模式」：全螢幕透明背景，僅顯示字幕文字，方便擷取 | 應該 |
| FR-8 | 設定持久化（chrome.storage.local） | 必須 |
| FR-9 | 一鍵開關擴充套件（暫停 / 啟用） | 應該 |

## 4. 非功能需求 (Non-Functional Requirements)

- **NFR-1 離線可用**：轉換引擎（OpenCC-JS 字典）打包在套件內，不依賴外部 API。
- **NFR-2 效能**：MutationObserver 需 debounce，避免高頻 DOM 變動造成卡頓。
- **NFR-3 隱私**：不蒐集、不外傳任何字幕內容。
- **NFR-4 平台**：Windows + Chrome / Edge（Chromium，Manifest V3）。
- **NFR-5 無伺服器**：純前端，本機開啟即可，OBS 以視窗擷取取得畫面。

## 5. 範圍外 (Out of Scope)

- 不負責語音轉文字本身（由 streamtranslate.live 提供）。
- 不做語意翻譯（僅簡轉繁字形 + 用詞轉換，非外語翻譯）。
- 不提供 OBS Browser Source 直連（該模式需本機伺服器推送，列為未來擴充）。

## 6. 假設與風險 (Assumptions & Risks)

- **風險 R-1**：streamtranslate.live 的字幕 DOM 結構未知且可能改版 → 以可設定的 CSS 選擇器 + 啟發式 fallback 降低衝擊（FR-5）。
- **風險 R-2**：OBS Browser Source 內嵌的 CEF 不會載入使用者安裝的擴充套件 → 故採用 Window Capture 擷取真實瀏覽器視窗。
- **假設 A-1**：字幕為 HTML 文字節點（非 canvas / 影像）。若為影像則需改走 OCR 方案（本專案不涵蓋）。
