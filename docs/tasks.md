# 任務文件 (Tasks)

## 里程碑 M1：專案骨架與文件
- [x] T1.1 撰寫需求 / 設計 / 任務文件
- [x] T1.2 建立 git、推送 GitHub repo
- [x] T1.3 建立目錄結構與 `.gitignore`、README

## 里程碑 M2：擴充套件骨架
- [x] T2.1 撰寫 `manifest.json`（MV3，content script 比對 streamtranslate.live）
- [x] T2.2 整合 opencc-js bundle（cn2t.js）至 `vendor/`
- [x] T2.3 `background.js`：初始化預設設定
- [x] T2.4 建立基本 icons

## 里程碑 M3：核心功能
- [x] T3.1 `content.js`：載入 OpenCC、建立 Converter 並快取
- [x] T3.2 字幕擷取：選擇器讀取 + MutationObserver + debounce + 去重
- [x] T3.3 啟發式 fallback：自動尋找候選字幕節點
- [x] T3.4 渲染 overlay：建立容器、套樣式、顯示最新 N 行
- [x] T3.5 套用 storage 設定 + onChanged 即時更新

## 里程碑 M4：設定面板
- [x] T4.1 `popup.html` 版面（樣式 / 轉換方案 / 選擇器 / 開關 / OBS 模式）
- [x] T4.2 `popup.js`：讀寫 storage、即時廣播
- [x] T4.3 overlay.css 樣式變數化

## 里程碑 M5：測試與文件
- [ ] T5.1 在 streamtranslate.live 實測字幕擷取與轉換（需使用者於 Windows + Chrome 實測）
- [ ] T5.2 校正預設字幕選擇器（依實測 DOM 調整 FALLBACK_SELECTORS / 預設選擇器）
- [x] T5.3 README：安裝步驟、OBS 接法、選擇器設定教學
- [x] T5.4 提交並推送

## 已驗證
- [x] OpenCC `s2twp` 轉換正確（軟件→軟體、内存→記憶體、程序→程式、鼠标→滑鼠）
- [x] manifest / 各 JS 語法檢查通過

## 待確認 / 風險追蹤
- [ ] Q1 streamtranslate.live 實際字幕 DOM 選擇器（需登入站點實測；目前以啟發式 + 可設定選擇器因應）
- [ ] Q2 字幕是否為純文字節點（非 canvas / 影像）
