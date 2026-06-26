import { state } from "./state.js";

export function formatSeconds(elapsedMs) {
  return (Math.max(0, elapsedMs) / 1000).toFixed(1);
}

export function hasHit(results) {
  return results.some((r) => r.status === "pass");
}

export function showInitialMessage(message) {
  const container = document.getElementById("hitsContainer");
  container.innerHTML = `
      <div class="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-zinc-400">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="6" width="32" height="36" rx="2" stroke="#e4e4e7" stroke-width="2" opacity="0.22"/>
          <path d="M16 16h16M16 22h16M16 28h10" stroke="#e4e4e7" stroke-width="2" stroke-linecap="round" opacity="0.22"/>
        </svg>
        <p class="text-sm leading-relaxed">${message}</p>
      </div>
    `;
}

export function setProgress(done, total) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  document.getElementById("progressFill").style.width = `${pct}%`;
  document.getElementById("progressCount").textContent = `${done} / ${total}`;
}

export function renderHitsTable(
  emptyMessage = "Scan complete.<br/>No hit URLs matched your checks.",
) {
  const container = document.getElementById("hitsContainer");
  container.innerHTML = "";

  if (!state.hitRows.length) {
    showInitialMessage(emptyMessage);
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "overflow-hidden border border-zinc-800 bg-zinc-900";
  const table = document.createElement("table");
  table.className = "w-full border-collapse text-xs";
  table.innerHTML = `
      <thead class="bg-zinc-800">
        <tr>
          <th class="border-b border-zinc-800 px-3 py-2.5 text-left text-xs font-normal uppercase tracking-widest text-zinc-400" style="width:56px">#</th>
          <th class="border-b border-zinc-800 px-3 py-2.5 text-left text-xs font-normal uppercase tracking-widest text-zinc-400">URL</th>
          <th class="border-b border-zinc-800 px-3 py-2.5 text-left text-xs font-normal uppercase tracking-widest text-zinc-400" style="width:180px">excludeWithin</th>
          <th class="border-b border-zinc-800 px-3 py-2.5 text-left text-xs font-normal uppercase tracking-widest text-zinc-400">detail</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

  const tbody = table.querySelector("tbody");
  state.hitRows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    if (idx % 2 === 1) tr.className = "bg-white/5";
    const excludeWithinHtml = row.passResults
      .map((r) => r.excludeWithin || "-")
      .join("<br/>");
    const detailHtml = row.passResults
      .map((r) => r.detail || "-")
      .join("<br/>");
    tr.innerHTML = `
        <td class="border-b border-zinc-800 px-3 py-2.5 text-zinc-100">${idx + 1}</td>
        <td class="border-b border-zinc-800 px-3 py-2.5 text-zinc-100"><a class="break-all text-yellow-500 hover:underline" href="${row.url}" target="_blank" rel="noopener noreferrer">${row.url}</a></td>
        <td class="border-b border-zinc-800 px-3 py-2.5 text-zinc-300">${excludeWithinHtml}</td>
        <td class="border-b border-zinc-800 px-3 py-2.5 text-zinc-300">${detailHtml}</td>
      `;
    tbody.appendChild(tr);
  });

  wrap.appendChild(table);
  container.appendChild(wrap);
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
