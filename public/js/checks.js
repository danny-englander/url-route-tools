// ── Default checks ──────────────────────────────────────────────────────────
export const defaults = [
  {
    label: "",
    selector: "",
    expected: "present",
    excludeWithin: "",
  },
];

export function addCheck(data = {}) {
  const id = Date.now();
  const list = document.getElementById("checksList");
  const card = document.createElement("div");
  card.className = "check-card grid gap-2 bg-zinc-800 p-3 pb-4";
  card.dataset.id = id;
  card.innerHTML = `
      <input class="w-full border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-100 outline-none transition focus:border-yellow-500" type="text" placeholder="Label (e.g. Has cookie banner)" value="${data.label || ""}" data-field="label" />
      <input class="w-full border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-100 outline-none transition focus:border-yellow-500" type="text" placeholder="Selector; top-level comma = OR (e.g. .a, #b)" value="${data.selector || ""}" data-field="selector" />
      <select class="w-full border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-100 outline-none transition focus:border-yellow-500" data-field="expected">
        <option value="present" ${
          data.expected === "present" ? "selected" : ""
        }>Present</option>
        <option value="absent"  ${
          data.expected === "absent" ? "selected" : ""
        }>Absent</option>
        <option value="custom"  ${
          data.expected &&
          data.expected !== "present" &&
          data.expected !== "absent"
            ? "selected"
            : ""
        }>Contains text…</option>
      </select>
      <input class="w-full border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-100 outline-none transition focus:border-yellow-500" type="text" placeholder="Exclude if inside (optional; comma = OR, e.g. #flyout, #modal, .drawer)" value="${data.excludeWithin || ""}" data-field="excludeWithin" />
      <input class="w-full border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-100 outline-none transition focus:border-yellow-500" type="text" placeholder='Text to find in element' data-field="textMatch" style="display:${
        data.expected &&
        data.expected !== "present" &&
        data.expected !== "absent"
          ? "block"
          : "none"
      }" value="${
        data.expected &&
        data.expected !== "present" &&
        data.expected !== "absent"
          ? data.expected
          : ""
      }" />
      <button type="button" data-action="remove-check" class="cursor-pointer self-start border border-yellow-500 bg-yellow-500/10 px-3 py-1 text-xs tracking-widest text-yellow-500 transition hover:bg-yellow-500/20">Remove</button>
    `;
  card
    .querySelector('[data-field="expected"]')
    .addEventListener("change", function () {
      card.querySelector('[data-field="textMatch"]').style.display =
        this.value === "custom" ? "block" : "none";
    });
  list.appendChild(card);
}

export function getChecks() {
  return [...document.querySelectorAll(".check-card")]
    .map((card) => {
      const label = card.querySelector('[data-field="label"]').value.trim();
      const selector = card
        .querySelector('[data-field="selector"]')
        .value.trim();
      const expSel = card.querySelector('[data-field="expected"]').value;
      const textMatch = card
        .querySelector('[data-field="textMatch"]')
        .value.trim();
      return {
        label: label || selector,
        selector,
        expected: expSel === "custom" ? textMatch : expSel,
        excludeWithin: card
          .querySelector('[data-field="excludeWithin"]')
          .value.trim(),
      };
    })
    .filter((c) => c.selector);
}

export function setupChecksUi() {
  document.getElementById("addCheckBtn").addEventListener("click", () => {
    addCheck();
  });
  document.getElementById("checksList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='remove-check']");
    if (!btn) return;
    btn.closest(".check-card")?.remove();
  });
}
