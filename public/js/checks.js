// ── Default checks ──────────────────────────────────────────────────────────
export const defaults = [
  {
    label: "",
    selector: "",
    expected: "present",
    excludeWithin: "",
  },
];

const checkCardTemplate = document.getElementById("checkCardTemplate");

function isCustomExpected(expected) {
  return expected && expected !== "present" && expected !== "absent";
}

export function addCheck(data = {}) {
  const card = checkCardTemplate.content.cloneNode(true).firstElementChild;

  card.querySelector('[data-field="label"]').value = data.label || "";
  card.querySelector('[data-field="selector"]').value = data.selector || "";
  card.querySelector('[data-field="excludeWithin"]').value =
    data.excludeWithin || "";

  const expectedSelect = card.querySelector('[data-field="expected"]');
  const textMatch = card.querySelector('[data-field="textMatch"]');

  if (isCustomExpected(data.expected)) {
    expectedSelect.value = "custom";
    textMatch.value = data.expected;
    textMatch.classList.remove("hidden");
  } else {
    expectedSelect.value = data.expected || "present";
    textMatch.classList.add("hidden");
  }

  expectedSelect.addEventListener("change", function () {
    textMatch.classList.toggle("hidden", this.value !== "custom");
  });

  document.getElementById("checksList").appendChild(card);
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
