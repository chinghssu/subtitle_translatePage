# subtitle_translatePage

即時將 [streamtranslate.live](https://streamtranslate.live) 串流語音轉文字的**簡體中文字幕**轉成**繁體中文（台灣正體用詞）**的瀏覽器擴充套件，並以可自訂樣式的字幕疊層顯示，供 **OBS** 透過視窗擷取作為直播字幕來源。

## 特色

- 🈯 OpenCC `s2twp` 簡轉繁，含台灣慣用詞（例：軟件 → 軟體）
- ⚡ MutationObserver 即時偵測字幕，低延遲
- 🎨 字體大小 / 顏色 / 外框 / 背景透明度 / 位置可自訂
- 📺 OBS 模式：透明背景，方便 Window Capture 疊加
- 🔌 純前端、離線可用、不外傳任何字幕內容

## 安裝（開發者模式）

1. 下載 / clone 本專案。
2. Chrome / Edge 開啟 `chrome://extensions`。
3. 開啟右上角「開發人員模式」。
4. 點「載入未封裝項目」，選擇本專案的 `extension/` 資料夾。

## 使用

1. 開啟 `https://streamtranslate.live` 並開始語音轉文字。
2. 點擴充套件圖示開啟設定面板，按「啟用」。
3. 若字幕沒出現，於面板「字幕選擇器」貼上正確的 CSS 選擇器（見下）。
4. 調整字體 / 顏色 / 位置，開啟「OBS 模式」。

## OBS 接法

1. OBS 新增來源 →「視窗擷取」→ 選擇瀏覽器視窗。
2. 視需要套用裁切 / 色鍵，把繁體字幕疊到直播畫面。

## 找出字幕選擇器

若預設無法擷取字幕：
1. 在 streamtranslate.live 字幕上按右鍵 →「檢查」。
2. 找到包住字幕文字的元素，複製其 class / id。
3. 在面板「字幕選擇器」填入，例如 `.subtitle-text` 或 `#caption`。

## 開發文件

- [需求文件](docs/requirements.md)
- [設計文件](docs/design.md)
- [任務文件](docs/tasks.md)

## 授權

MIT
