import { state } from "./state.js";
import { hasHit } from "./results.js";

// ── Export ───────────────────────────────────────────────────────────────────
export function exportReport() {
  const hitsOnly = state.reportData
    .filter((entry) => hasHit(entry.results))
    .map((entry) => ({
      url: entry.url,
      results: entry.results.filter((r) => r.status === "pass"),
    }));
  const blob = new Blob([JSON.stringify(hitsOnly, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.download = `sitemap-hits-${timestamp}.json`;
  a.click();
}
