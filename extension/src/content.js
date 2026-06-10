// content.js — 在 streamtranslate.live 擷取簡體字幕、OpenCC 轉繁體、渲染 overlay。
// 依賴：vendor/opencc/cn2t.js 先載入，提供全域 OpenCC。

(() => {
  "use strict";

  const OVERLAY_ID = "stt-tw-overlay";
  const CJK_RE = /[一-鿿㐀-䶿]/;

  // 找不到自訂選擇器時，依序嘗試的常見字幕容器
  const FALLBACK_SELECTORS = [
    "[class*='subtitle']",
    "[class*='caption']",
    "[class*='transcript']",
    "[id*='subtitle']",
    "[id*='caption']",
    "[class*='result']"
  ];

  let settings = null;
  let converter = (s) => s; // 預設 identity，待 OpenCC 就緒後覆寫
  let observer = null;
  let lastSource = "";
  let debounceTimer = null;

  // ---------- OpenCC ----------
  function buildConverter(conversion) {
    try {
      if (typeof OpenCC === "undefined" || !OpenCC.Converter) {
        console.warn("[STT-TW] OpenCC 未載入，使用原文。");
        return (s) => s;
      }
      const to = ["t", "tw", "twp"].includes(conversion) ? conversion : "twp";
      return OpenCC.Converter({ from: "cn", to });
    } catch (e) {
      console.error("[STT-TW] 建立轉換器失敗：", e);
      return (s) => s;
    }
  }

  // ---------- overlay ----------
  function ensureOverlay() {
    let el = document.getElementById(OVERLAY_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = OVERLAY_ID;
      const box = document.createElement("div");
      box.className = "stt-tw-box";
      const text = document.createElement("p");
      text.className = "stt-tw-text";
      box.appendChild(text);
      el.appendChild(box);
      document.documentElement.appendChild(el);
    }
    return el;
  }

  function rgba(hex, opacity) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#000000");
    if (!m) return `rgba(0,0,0,${opacity})`;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  function applyStyle() {
    if (!settings) return;
    const el = ensureOverlay();
    const s = settings.style;
    el.dataset.position = s.position;
    el.style.opacity = String(s.opacity);
    el.style.setProperty("--stt-font-size", `${s.fontSize}px`);
    el.style.setProperty("--stt-color", s.color);
    el.style.setProperty("--stt-font-family", s.fontFamily);
    el.style.setProperty("--stt-stroke-width", `${s.textStroke}px`);
    el.style.setProperty("--stt-stroke-color", s.strokeColor);
    // OBS 模式強制背景全透明，方便視窗擷取乾淨疊加
    el.style.setProperty("--stt-bg", settings.obsMode ? "rgba(0,0,0,0)" : rgba(s.bgColor, s.bgOpacity));
    el.classList.toggle("stt-hidden", !settings.enabled);
  }

  function render(text) {
    const el = ensureOverlay();
    const lines = text.split(/\n+/).filter(Boolean);
    const maxLines = settings?.style?.maxLines || 2;
    el.querySelector(".stt-tw-text").textContent = lines.slice(-maxLines).join("\n");
  }

  // ---------- 字幕擷取 ----------
  function pickTargets() {
    if (settings?.subtitleSelector) {
      const nodes = document.querySelectorAll(settings.subtitleSelector);
      if (nodes.length) return Array.from(nodes);
      console.warn("[STT-TW] 自訂選擇器找不到元素：", settings.subtitleSelector);
    }
    for (const sel of FALLBACK_SELECTORS) {
      const nodes = document.querySelectorAll(sel);
      const visible = Array.from(nodes).filter(isVisibleCJK);
      if (visible.length) return visible;
    }
    return null; // 走全頁啟發式
  }

  function isVisibleCJK(node) {
    if (!node || !node.textContent || !CJK_RE.test(node.textContent)) return false;
    const r = node.getBoundingClientRect?.();
    return r && r.width > 0 && r.height > 0;
  }

  // 全頁啟發式：挑字級最大、含 CJK 的可見葉節點
  function heuristicSource() {
    let best = null, bestScore = -1;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.children.length > 0) continue; // 只看葉節點
      if (!isVisibleCJK(n)) continue;
      const fs = parseFloat(getComputedStyle(n).fontSize) || 0;
      const score = fs + n.textContent.trim().length * 0.1;
      if (score > bestScore) { bestScore = score; best = n; }
    }
    return best ? best.textContent.trim() : "";
  }

  function collectSource() {
    const targets = pickTargets();
    if (targets) {
      return targets.map((t) => t.textContent.trim()).filter(Boolean).join("\n");
    }
    return heuristicSource();
  }

  function process() {
    if (!settings?.enabled) return;
    const src = collectSource();
    if (!src || src === lastSource) return;
    lastSource = src;
    try {
      render(converter(src));
    } catch (e) {
      console.error("[STT-TW] 轉換失敗：", e);
      render(src);
    }
  }

  function scheduleProcess() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(process, 120);
  }

  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(scheduleProcess);
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
    scheduleProcess();
  }

  // ---------- 設定載入 / 監看 ----------
  async function init() {
    settings = await chrome.storage.local.get(null);
    if (!settings || Object.keys(settings).length === 0) {
      // background 尚未寫入預設時的保底
      settings = { enabled: true, conversion: "twp", subtitleSelector: "",
        style: { fontSize: 48, color: "#ffffff",
          fontFamily: "'Noto Sans TC','Microsoft JhengHei',sans-serif",
          textStroke: 2, strokeColor: "#000000", bgColor: "#000000",
          bgOpacity: 0, position: "bottom", maxLines: 2, opacity: 1 } };
    }
    converter = buildConverter(settings.conversion);
    applyStyle();
    startObserver();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    let convChanged = false, selChanged = false;
    for (const [k, v] of Object.entries(changes)) {
      if (k === "style") settings.style = v.newValue;
      else settings[k] = v.newValue;
      if (k === "conversion") convChanged = true;
      if (k === "subtitleSelector") selChanged = true;
    }
    if (convChanged) converter = buildConverter(settings.conversion);
    applyStyle();
    if (selChanged || convChanged) { lastSource = ""; scheduleProcess(); }
  });

  if (document.body) init();
  else window.addEventListener("DOMContentLoaded", init, { once: true });
})();
