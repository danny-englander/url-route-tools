export function setupStyleHmr() {
  const tailwindLink = document.getElementById("tailwindStyles");
  if (!tailwindLink || !window.EventSource) return;

  const hmr = new EventSource("/hmr");
  hmr.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      if (payload.type === "tailwind_update" && tailwindLink) {
        const baseHref = "/dist.css";
        tailwindLink.setAttribute("href", `${baseHref}?v=${Date.now()}`);
      }
    } catch {
      // Ignore malformed HMR payloads.
    }
  };
}
