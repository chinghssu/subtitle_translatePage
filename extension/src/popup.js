// popup.js — 讀寫 chrome.storage.local；變更即時生效（content.js 以 onChanged 套用）。

const DEFAULTS = {
  enabled: true,
  obsMode: false,
  conversion: "twp",
  subtitleSelector: "",
  style: {
    fontSize: 48, color: "#ffffff",
    fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
    textStroke: 2, strokeColor: "#000000",
    bgColor: "#000000", bgOpacity: 0,
    position: "bottom", maxLines: 2, opacity: 1
  }
};

const $ = (id) => document.getElementById(id);
const STYLE_KEYS = ["fontSize", "color", "textStroke", "strokeColor", "bgColor", "bgOpacity", "position", "maxLines"];
const TOP_KEYS = ["enabled", "obsMode", "conversion", "subtitleSelector"];

let state = null;

function fillForm() {
  $("enabled").checked = state.enabled;
  $("obsMode").checked = state.obsMode;
  $("conversion").value = state.conversion;
  $("subtitleSelector").value = state.subtitleSelector || "";
  const s = state.style;
  $("fontSize").value = s.fontSize;          $("fontSizeVal").textContent = s.fontSize;
  $("color").value = s.color;
  $("textStroke").value = s.textStroke;      $("textStrokeVal").textContent = s.textStroke;
  $("strokeColor").value = s.strokeColor;
  $("bgColor").value = s.bgColor;
  $("bgOpacity").value = Math.round(s.bgOpacity * 100); $("bgOpacityVal").textContent = Math.round(s.bgOpacity * 100) + "%";
  $("position").value = s.position;
  $("maxLines").value = s.maxLines;          $("maxLinesVal").textContent = s.maxLines;
}

async function save() {
  await chrome.storage.local.set(state);
}

function bindTop(id, transform = (v) => v) {
  const el = $(id);
  const evt = el.type === "checkbox" ? "change" : "input";
  el.addEventListener(evt, () => {
    state[id] = el.type === "checkbox" ? el.checked : transform(el.value);
    save();
  });
}

function bindStyle(id, valId, transform = (v) => v) {
  const el = $(id);
  el.addEventListener("input", () => {
    state.style[id] = transform(el.value);
    if (valId) {
      if (id === "bgOpacity") $(valId).textContent = Math.round(state.style.bgOpacity * 100) + "%";
      else $(valId).textContent = el.value;
    }
    save();
  });
}

async function load() {
  const stored = await chrome.storage.local.get(null);
  state = { ...DEFAULTS, ...stored, style: { ...DEFAULTS.style, ...(stored.style || {}) } };
  fillForm();
  await save(); // 確保補齊缺項
}

document.addEventListener("DOMContentLoaded", async () => {
  await load();

  bindTop("enabled");
  bindTop("obsMode");
  bindTop("conversion");
  bindTop("subtitleSelector", (v) => v.trim());

  bindStyle("fontSize", "fontSizeVal", Number);
  bindStyle("color");
  bindStyle("textStroke", "textStrokeVal", Number);
  bindStyle("strokeColor");
  bindStyle("bgColor");
  bindStyle("bgOpacity", "bgOpacityVal", (v) => Number(v) / 100);
  bindStyle("position");
  bindStyle("maxLines", "maxLinesVal", Number);

  $("reset").addEventListener("click", async () => {
    state = JSON.parse(JSON.stringify(DEFAULTS));
    await save();
    fillForm();
  });
});
