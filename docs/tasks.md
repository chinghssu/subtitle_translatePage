# 任務文件 (Tasks)

## 里程碑 M1：專案骨架與文件
- [x] T1.1 撰寫需求 / 設計 / 任務文件
- [x] T1.2 建立 git、推送 GitHub repo
- [ ] T1.3 建立目錄結構與 `.gitignore`、README

## 里程碑 M2：擴充套件骨架
- [ ] T2.1 撰寫 `manifest.json`（MV3，content script 比對 streamtranslate.live）
- [ ] T2.2 整合 opencc-js bundle 與字典至 `vendor/`，設定 `web_accessible_resources`
- [ ] T2.3 `background.js`：初始化預設設定、訊息中繼
- [ ] T2.4 建立基本 icons

## 里程碑 M3：核心功能
- [ ] T3.1 `content.js`：載入 OpenCC、建立 Converter 並快取
- [ ] T3.2 字幕擷取：選擇器讀取 + MutationObserver + debounce + 去重
- [ ] T3.3 啟發式 fallback：自動尋找候選字幕節點
- [ ] T3.4 渲染 overlay：建立容器、套樣式、顯示最新 N 行
- [ ] T3.5 套用 storage 設定 + onChanged 即時更新

## 里程碑 M4：設定面板
- [ ] T4.1 `popup.html` 版面（樣式 / 轉換方案 / 選擇器 / 開關 / OBS 模式）
- [ ] T4.2 `popup.js`：讀寫 storage、即時廣播
- [ ] T4.3 overlay.css 樣式變數化

## 里程碑 M5：測試與文件
- [ ] T5.1 在 streamtranslate.live 實測字幕擷取與轉換
- [ ] T5.2 校正預設字幕選擇器
- [ ] T5.3 README：安裝步驟、OBS 接法、選擇器設定教學
- [ ] T5.4 提交並推送

## 待確認 / 風險追蹤
- [ ] Q1 streamtranslate.live 實際字幕 DOM 選擇器（需登入站點實測）
- [ ] Q2 字幕是否為純文字節點（非 canvas / 影像）
