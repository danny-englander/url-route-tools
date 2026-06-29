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
const checkFieldNames = [
  "label",
  "selector",
  "expected",
  "excludeWithin",
  "textMatch",
];

function isCustomExpected(expected) {
  return expected && expected !== "present" && expected !== "absent";
}

function wireCheckCardFields(card, id) {
  for (const field of checkFieldNames) {
    const control = card.querySelector(`[data-field="${field}"]`);
    const fieldId = `check-${id}-${field}`;
    control.id = fieldId;

    const label = card.querySelector(`[data-label-for="${field}"]`);
    if (label) label.htmlFor = fieldId;
  }
}

function setTextMatchVisible(card, visible) {
  card
    .querySelector('[data-field-group="textMatch"]')
    ?.classList.toggle("hidden", !visible);
}

export function addCheck(data = {}) {
  const id = Date.now();
  const card = checkCardTemplate.content.cloneNode(true).firstElementChild;
  card.dataset.id = id;
  wireCheckCardFields(card, id);

  card.querySelector('[data-field="label"]').value = data.label || "";
  card.querySelector('[data-field="selector"]').value = data.selector || "";
  card.querySelector('[data-field="excludeWithin"]').value =
    data.excludeWithin || "";

  const expectedSelect = card.querySelector('[data-field="expected"]');
  const textMatch = card.querySelector('[data-field="textMatch"]');

  if (isCustomExpected(data.expected)) {
    expectedSelect.value = "custom";
    textMatch.value = data.expected;
    setTextMatchVisible(card, true);
  } else {
    expectedSelect.value = data.expected || "present";
    setTextMatchVisible(card, false);
  }

  expectedSelect.addEventListener("change", function () {
    setTextMatchVisible(card, this.value === "custom");
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
