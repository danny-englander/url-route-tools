import { addCheck, defaults, setupChecksUi } from "./checks.js";
import { setupAppDialog } from "./dialog.js";
import { exportReport } from "./export.js";
import { setupStyleHmr } from "./hmr.js";
import { cancelScan, runScan } from "./scan.js";
import { setupUrlListUi } from "./url-list.js";

// ── Init ─────────────────────────────────────────────────────────────────────
if (new URLSearchParams(location.search).get("debug") === "1") {
  const dbgEl = document.getElementById("debugScan");
  if (dbgEl) dbgEl.checked = true;
}

document.getElementById("runBtn").addEventListener("click", runScan);
document.getElementById("cancelBtn").addEventListener("click", cancelScan);
document.getElementById("exportBtn").addEventListener("click", exportReport);

setupStyleHmr();
setupAppDialog();
setupUrlListUi();
setupChecksUi();
defaults.forEach(addCheck);
