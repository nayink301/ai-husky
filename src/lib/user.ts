// src/lib/user.ts
import { supabase } from "@/lib/supabase";
import { isDemoMode } from "@/lib/demoFlag";

/** Returns a friendly display name.
 *  - Demo: "stranger"
 *  - Normal: part before '@' in email (capitalized), else "friend"
 */
export async function getDisplayName(): Promise<string> {
  if (isDemoMode()) return "stranger";
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "";
  const base = email.split("@")[0] || "friend";
  return capitalize(base.replace(/[._-]+/g, " "));
}

export function extractNameFromEmail(email: string | null | undefined): string {
  if (!email) return "";
  const base = email.split("@")[0] || "";
  return capitalize(base.replace(/[._-]+/g, " "));
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}
