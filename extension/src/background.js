// background.js — service worker：初始化預設設定
// 設定一律透過 chrome.storage.local 共享；content.js 以 storage.onChanged 即時套用。

const DEFAULTS = {
  enabled: true,
  obsMode: false,
  conversion: "twp", // "t" | "tw" | "twp"
  subtitleSelector: "", // 空 = 用內建預設 + 啟發式
  style: {
    fontSize: 48,
    color: "#ffffff",
    fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
    textStroke: 2,
    strokeColor: "#000000",
    bgColor: "#00b140", // chroma 綠底，供後製去背
    bgOpacity: 1,
    position: "bottom", // "top" | "center" | "bottom"
    maxLines: 2,
    opacity: 1
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(null);
  // 僅補上缺少的鍵，保留使用者既有設定
  const merged = { ...DEFAULTS, ...cur, style: { ...DEFAULTS.style, ...(cur.style || {}) } };
  await chrome.storage.local.set(merged);
});
