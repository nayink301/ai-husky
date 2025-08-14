// src/lib/demoFlag.ts
const LS_KEY = "DEMO_MODE"; // "true" | "false"

export function isDemoMode(): boolean {
  const url = new URL(window.location.href);
  const demoParam = url.searchParams.get("demo");
  if (demoParam === "1") localStorage.setItem(LS_KEY, "true");
  else if (demoParam === "0") localStorage.setItem(LS_KEY, "false");

  const rt = localStorage.getItem(LS_KEY);
  if (rt === "true") return true;
  if (rt === "false") return false;

  return String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true";
}

export function enableDemoMode(): void {
  localStorage.setItem(LS_KEY, "true");
}

export function disableDemoMode(): void {
  localStorage.setItem(LS_KEY, "false");
}

/** Hard navigate to a path (clears SPA state reliably) */
export function hardNavigate(path: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  url.pathname = path;
  window.location.href = url.toString();
}



