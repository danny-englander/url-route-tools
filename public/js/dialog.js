export function showAppDialog(message, title = "Notice") {
  document.getElementById("appDialogTitle").textContent = title;
  document.getElementById("appDialogMessage").textContent = message;
  const dialog = document.getElementById("appDialog");
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    window.alert(`${title}\n\n${message}`);
  }
}

export function setupAppDialog() {
  const dialog = document.getElementById("appDialog");
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
}
