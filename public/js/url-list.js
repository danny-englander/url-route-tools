import { state } from "./state.js";

const URL_LIST_SAMPLE = `[
  "https://example.ddev.site/page-one",
  "https://example.ddev.site/page-two"
]`;

export function getUrlSourceMode() {
  return state.urlSourceMode;
}

export function parseUrlListText(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      ok: false,
      message: "Paste a JSON array of URLs or choose a file.",
    };
  }
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch (e) {
    return { ok: false, message: `Invalid JSON: ${e.message}` };
  }
  if (!Array.isArray(data)) {
    return {
      ok: false,
      message: "JSON must be an array of URL strings.",
    };
  }
  const urls = [];
  const seen = new Set();
  let validCount = 0;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (typeof item !== "string") {
      return {
        ok: false,
        message: `Entry ${i + 1} must be a string.`,
      };
    }
    const s = item.trim();
    if (!s) continue;
    validCount++;
    try {
      const href = new URL(s).href;
      if (!seen.has(href)) {
        seen.add(href);
        urls.push(href);
      }
    } catch {
      return {
        ok: false,
        message: `Invalid URL at entry ${i + 1}: ${s}`,
      };
    }
  }
  if (!urls.length) {
    return { ok: false, message: "No valid URLs in the list." };
  }
  return { ok: true, urls, validCount };
}

export function updateUrlListStatus() {
  const statusEl = document.getElementById("urlListStatus");
  const text = document.getElementById("urlListJson")?.value ?? "";
  if (!text.trim()) {
    state.parsedUrlList = null;
    statusEl.textContent = "";
    statusEl.className = "min-h-[1.25rem] text-xs text-zinc-100";
    return;
  }
  const result = parseUrlListText(text);
  if (result.ok) {
    state.parsedUrlList = result.urls;
    const dupNote =
      result.validCount > result.urls.length ? " (duplicates removed)" : "";
    statusEl.textContent = `${result.urls.length} URL${result.urls.length === 1 ? "" : "s"} loaded${dupNote}`;
    statusEl.className = "min-h-[1.25rem] text-xs text-emerald-400/90";
  } else {
    state.parsedUrlList = null;
    statusEl.textContent = result.message;
    statusEl.className = "min-h-[1.25rem] text-xs text-rose-400/90";
  }
}

function scheduleUrlListParse() {
  clearTimeout(state.urlListParseTimer);
  state.urlListParseTimer = setTimeout(updateUrlListStatus, 200);
}

function setUrlSourceMode(mode) {
  state.urlSourceMode = mode;
  const sitemapBtn = document.getElementById("urlSourceSitemap");
  const listBtn = document.getElementById("urlSourceList");
  const panel = document.getElementById("urlListPanel");
  const hint = document.getElementById("sitemapHint");
  const active =
    "url-source-tab cursor-pointer bg-yellow-500/15 px-2 py-2 text-xs tracking-widest text-yellow-500";
  const inactive =
    "url-source-tab cursor-pointer bg-zinc-950 px-2 py-2 text-xs tracking-widest text-zinc-100 transition hover:text-zinc-200";

  if (mode === "sitemap") {
    sitemapBtn.className = `${active} border-r border-zinc-800`;
    listBtn.className = inactive;
    panel.classList.add("hidden");
    panel.classList.remove("flex");
    hint.classList.remove("hidden");
  } else {
    sitemapBtn.className = `${inactive} border-r border-zinc-800`;
    listBtn.className = active;
    panel.classList.remove("hidden");
    panel.classList.add("flex");
    hint.classList.add("hidden");
    scheduleUrlListParse();
  }
}

export function setupUrlListUi() {
  document
    .getElementById("urlSourceSitemap")
    .addEventListener("click", () => setUrlSourceMode("sitemap"));
  document
    .getElementById("urlSourceList")
    .addEventListener("click", () => setUrlSourceMode("urlList"));

  const textarea = document.getElementById("urlListJson");
  textarea.addEventListener("input", scheduleUrlListParse);
  textarea.addEventListener("blur", updateUrlListStatus);

  document.getElementById("urlListSampleBtn").addEventListener("click", () => {
    textarea.value = URL_LIST_SAMPLE;
    scheduleUrlListParse();
    textarea.focus();
  });

  document.getElementById("urlListFile").addEventListener("change", (evt) => {
    const file = evt.target.files?.[0];
    const nameEl = document.getElementById("urlListFileName");
    if (!file) {
      nameEl.textContent = "";
      nameEl.classList.add("hidden");
      return;
    }
    nameEl.textContent = file.name;
    nameEl.classList.remove("hidden");
    const reader = new FileReader();
    reader.onload = () => {
      textarea.value = String(reader.result ?? "");
      scheduleUrlListParse();
    };
    reader.onerror = () => {
      state.parsedUrlList = null;
      const statusEl = document.getElementById("urlListStatus");
      statusEl.textContent = `Could not read file: ${file.name}`;
      statusEl.className = "min-h-[1.25rem] text-xs text-rose-400/90";
    };
    reader.readAsText(file);
  });
}
