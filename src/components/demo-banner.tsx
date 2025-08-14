import { isDemoMode, disableDemoMode, hardNavigate } from "@/lib/demoFlag";
import { resetDemoData } from "@/services/items";
import { useState } from "react";

export default function DemoBanner() {
  const [busy, setBusy] = useState(false);
  if (!isDemoMode()) return null;

  const onReset = async () => {
    setBusy(true);
    try { await resetDemoData(); hardNavigate(window.location.pathname); }
    finally { setBusy(false); }
  };

  const onExit = async () => {
    // If you had a real session at some point, sign out just in case:
    try { const { supabase } = await import("@/lib/supabase"); await supabase.auth.signOut(); } catch {}
    disableDemoMode();
    hardNavigate("/login"); // <= always lands on login, resets state
  };

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="max-w-5xl mx-auto px-3 py-2 text-sm flex items-center gap-3">
        <strong>Demo mode:</strong> data is mocked (local only).
        <button
          onClick={onReset}
          disabled={busy}
          className="ml-auto border border-amber-300 rounded px-2 py-1 hover:bg-amber-100 disabled:opacity-60"
        >
          {busy ? "Resetting…" : "Reset demo data"}
        </button>
        <button
          onClick={onExit}
          className="border border-amber-300 rounded px-2 py-1 hover:bg-amber-100"
        >
          Exit demo
        </button>
      </div>
    </div>
  );
}

