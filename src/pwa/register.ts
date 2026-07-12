import { registerSW } from "virtual:pwa-register";

function applyStandaloneClass() {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  document.documentElement.classList.toggle("pwa-standalone", standalone);
  document.documentElement.dataset.displayMode = standalone ? "standalone" : "browser";
}

export function initPwa() {
  applyStandaloneClass();

  window.matchMedia("(display-mode: standalone)").addEventListener("change", applyStandaloneClass);

  if (import.meta.env.PROD) {
    registerSW({
      immediate: true,
      onOfflineReady() {
        document.documentElement.dataset.offlineReady = "true";
      },
    });
  }
}
