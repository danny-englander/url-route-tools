import { SERVER, state } from "./state.js";
import { getChecks } from "./checks.js";
import { showAppDialog } from "./dialog.js";
import {
  formatSeconds,
  hasHit,
  renderHitsTable,
  setLoginVerified,
  setProgress,
  setStatus,
  showInitialMessage,
  updateStats,
} from "./results.js";
import {
  getUrlSourceMode,
  parseUrlListText,
  updateUrlListStatus,
} from "./url-list.js";

function setScanningState(scanning) {
  state.isScanning = scanning;
  const runBtn = document.getElementById("runBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  runBtn.textContent = scanning ? "SCANNING…" : "SCAN";
  runBtn.disabled = scanning;
  runBtn.className = scanning
    ? "font-display w-full cursor-not-allowed border border-yellow-500 bg-zinc-800 px-4 py-3 text-2xl tracking-widest text-yellow-500 animate-pulse opacity-80"
    : "font-display w-full cursor-pointer bg-yellow-500 px-4 py-3 text-2xl tracking-widest text-zinc-950 transition hover:-translate-y-px hover:opacity-90";

  cancelBtn.classList.toggle("hidden", !scanning);
  cancelBtn.disabled = false;
}

// ── SSE event handler ───────────────────────────────────────────────────────
function handleEvent(ev) {
  if (state.clientScanDebug) console.log("[scan SSE]", ev.type, ev);
  if (ev.type === "status") setStatus(ev.message);
  if (ev.type === "login_verified") setLoginVerified(true);
  if (ev.type === "urls_found") {
    state.scanProgress.total = ev.count;
    document.getElementById("progressLabel").textContent = "Scanning URLs…";
    setProgress(state.scanProgress.done, state.scanProgress.total);
    setStatus(`Found ${ev.count} URLs — scanning…`);
  }

  if (ev.type === "page_done") {
    state.reportData.push({ url: ev.url, results: ev.results });
    ev.results.forEach((r) => {
      if (r.status === "pass") state.stats.pass++;
      if (r.status === "fail") state.stats.fail++;
      if (r.status === "error") state.stats.error++;
    });
    state.scanProgress.done++;
    setProgress(state.scanProgress.done, state.scanProgress.total);
    updateStats();

    if (hasHit(ev.results)) {
      const passResults = ev.results.filter((r) => r.status === "pass");
      state.hitRows.push({ url: ev.url, passResults });
    }
  }

  if (ev.type === "complete") {
    const elapsedSeconds =
      state.scanStartedAtMs == null
        ? null
        : formatSeconds(Date.now() - state.scanStartedAtMs);
    document.getElementById("progressLabel").textContent = "Scan complete";
    setStatus(
      elapsedSeconds == null
        ? `Scan complete — ${state.reportData.length} pages checked, ${state.hitRows.length} hit URL${
            state.hitRows.length === 1 ? "" : "s"
          }`
        : `The scan finished in ${elapsedSeconds} seconds — ${state.reportData.length} pages checked, ${state.hitRows.length} hit URL${
            state.hitRows.length === 1 ? "" : "s"
          }`,
    );
    renderHitsTable();
  }
  if (ev.type === "error") setStatus(`⚠ Error: ${ev.message}`);
}

// ── Scan ────────────────────────────────────────────────────────────────────
export async function runScan() {
  if (state.isScanning) return;
  const siteUrl = document
    .getElementById("siteUrl")
    .value.trim()
    .replace(/\/$/, "");
  const checks = getChecks();

  if (!siteUrl) {
    showAppDialog("Please enter a DDEV site URL.", "Site URL required");
    return;
  }
  if (!checks.length) {
    showAppDialog(
      "Please add at least one check with a selector.",
      "Checks required",
    );
    return;
  }

  let scanUrls = null;
  if (getUrlSourceMode() === "urlList") {
    const parsed = parseUrlListText(
      document.getElementById("urlListJson").value,
    );
    if (!parsed.ok) {
      showAppDialog(parsed.message, "URL list invalid");
      updateUrlListStatus();
      return;
    }
    scanUrls = parsed.urls;
    updateUrlListStatus();
  }

  // Reset state
  state.reportData = [];
  state.hitRows = [];
  state.stats = {
    pass: 0,
    fail: 0,
    error: 0,
  };
  state.scanProgress = {
    total: 0,
    done: 0,
  };
  updateStats();
  document.getElementById("exportBtn").disabled = true;
  document.getElementById("progressPanel").classList.remove("hidden");
  document.getElementById("progressLabel").textContent = "Preparing scan…";
  setProgress(0, 0);
  showInitialMessage(
    "Scanning in progress…<br/>Results table will appear when complete.",
  );
  state.currentScanController = new AbortController();
  state.scanStartedAtMs = Date.now();

  setScanningState(true);
  setLoginVerified(false);

  setStatus("Connecting to local server…");

  state.clientScanDebug =
    document.getElementById("debugScan")?.checked === true;
  const loginWithDrushUli =
    document.getElementById("loginWithDrushUli")?.checked === true;
  if (state.clientScanDebug)
    console.log("[scan] POST /scan", {
      siteUrl,
      checks: checks.length,
      urls: scanUrls?.length ?? "sitemap",
      loginWithDrushUli,
    });

  const scanBody = {
    siteUrl,
    checks,
    debug: state.clientScanDebug,
    loginWithDrushUli,
  };
  if (scanUrls) scanBody.urls = scanUrls;

  try {
    const response = await fetch(`${SERVER}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scanBody),
      signal: state.currentScanController.signal,
    });

    if (!response.ok) {
      const hint =
        response.status === 413
          ? "URL list is too large. Restart the server after raising SITEMAP_SCAN_BODY_LIMIT_MB (default 25)."
          : `HTTP ${response.status}`;
      setStatus(`⚠ Scan request failed — ${hint}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          handleEvent(JSON.parse(line.slice(6)));
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") {
      document.getElementById("progressLabel").textContent = "Scan cancelled";
      setStatus(
        `Scan cancelled — ${state.reportData.length} page${
          state.reportData.length === 1 ? "" : "s"
        } checked`,
      );
      renderHitsTable(
        "Scan cancelled.<br/>No hit URLs found before cancellation.",
      );
    } else {
      setStatus(
        `⚠ Could not reach local server at ${SERVER}. Is it running?`,
      );
    }
  } finally {
    state.currentScanController = null;
    setScanningState(false);
    document.getElementById("exportBtn").disabled = state.hitRows.length === 0;
  }
}

export function cancelScan() {
  if (!state.isScanning || !state.currentScanController) return;
  document.getElementById("cancelBtn").disabled = true;
  setStatus("Cancelling scan…");
  state.currentScanController.abort();
}
