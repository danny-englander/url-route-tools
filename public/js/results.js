import { state } from "./state.js";

const hitRowTemplate = document.getElementById("hitRowTemplate");

export function formatSeconds(elapsedMs) {
  return (Math.max(0, elapsedMs) / 1000).toFixed(1);
}

export function hasHit(results) {
  return results.some((r) => r.status === "pass");
}

export function showInitialMessage(message) {
  document.getElementById("hitsEmptyMessage").innerHTML = message;
  document.getElementById("hitsEmpty").classList.remove("hidden");
  document.getElementById("hitsTableWrap").classList.add("hidden");
}

export function setProgress(done, total) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  document.getElementById("progressFill").style.width = `${pct}%`;
  document.getElementById("progressCount").textContent = `${done} / ${total}`;
}

export function renderHitsTable(
  emptyMessage = "Scan complete.<br/>No hit URLs matched your checks.",
) {
  if (!state.hitRows.length) {
    showInitialMessage(emptyMessage);
    return;
  }

  document.getElementById("hitsEmpty").classList.add("hidden");
  document.getElementById("hitsTableWrap").classList.remove("hidden");

  const tbody = document.getElementById("hitsTableBody");
  tbody.replaceChildren();

  state.hitRows.forEach((row, idx) => {
    const tr = hitRowTemplate.content.cloneNode(true).firstElementChild;
    if (idx % 2 === 1) tr.classList.add("bg-white/5");

    tr.querySelector('[data-field="index"]').textContent = String(idx + 1);

    const link = tr.querySelector('[data-field="url"]');
    link.href = row.url;
    link.textContent = row.url;

    tr.querySelector('[data-field="excludeWithin"]').innerHTML = row.passResults
      .map((r) => r.excludeWithin || "-")
      .join("<br/>");
    tr.querySelector('[data-field="detail"]').innerHTML = row.passResults
      .map((r) => r.detail || "-")
      .join("<br/>");

    tbody.appendChild(tr);
  });
}

export function setStatus(msg) {
  document.getElementById("statusMsg").textContent = msg;
}

export function setLoginVerified(verified) {
  const badge = document.getElementById("loginVerifiedBadge");
  if (!badge) return;
  if (verified) {
    badge.classList.remove("hidden");
    badge.classList.add("flex");
  } else {
    badge.classList.add("hidden");
    badge.classList.remove("flex");
  }
}

export function updateStats() {
  document.getElementById("countPass").textContent = state.stats.pass;
  document.getElementById("countFail").textContent = state.stats.fail;
  document.getElementById("countError").textContent = state.stats.error;
}
