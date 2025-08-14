import type { Item } from "@/types/item";
import { isDemoMode } from "@/lib/demoFlag";

// DEMO provider
import * as demo from "./items.demo";

// SUPABASE provider (the one you already had)
import { supabase } from "@/lib/supabase";

export type NewItemInput = { name: string; description?: string | null };
export type UpdateItemInput = { name?: string; description?: string | null };
const TABLE = "items";

function normalize(row: any): Item {
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    name: row.name,
    description: row.description ?? null,
    created_at: row.created_at,
  };
}

export async function listItems(): Promise<Item[]> {
  if (isDemoMode()) return demo.listItems();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,user_id,name,description,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function listItemsPaged(page: number, pageSize: number) {
  if (isDemoMode()) return demo.listItemsPaged(page, pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from(TABLE)
    .select("id,user_id,name,description,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { items: (data ?? []).map(normalize), total: count ?? 0 };
}

export async function getItem(id: string): Promise<Item | null> {
  if (isDemoMode()) return demo.getItem(id);
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,user_id,name,description,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function createItem(input: NewItemInput): Promise<void> {
  if (isDemoMode()) return demo.createItem(input);
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from(TABLE).insert([{
    name: input.name,
    description: input.description ?? null,
    user_id: user?.user?.id ?? null,
  }]);
  if (error) throw error;
}

export async function updateItem(id: string, patch: UpdateItemInput): Promise<void> {
  if (isDemoMode()) return demo.updateItem(id, patch);
  const update = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.description !== undefined ? { description: patch.description ?? null } : {}),
  };
  const { error } = await supabase.from(TABLE).update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  if (isDemoMode()) return demo.deleteItem(id);
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

// Expose demo reset for a UI button
export async function resetDemoData(): Promise<void> {
  if (!isDemoMode()) return;
  await demo.resetDemoData();
}

