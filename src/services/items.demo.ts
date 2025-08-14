import type { Item } from "@/types/item";

const LS_KEY = "demo_items_v1";

function uuid() {
  // tiny UUID-ish for demo
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0; const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function load(): Item[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function save(items: Item[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export async function ensureSeed(): Promise<void> {
  const existing = load();
  if (existing.length) return;
  try {
    const res = await fetch("/mock/items.json", { cache: "no-store" });
    const data = (await res.json()) as Item[];
    save(data);
  } catch {
    // fallback to empty if fetch fails
    save([]);
  }
}

export async function resetDemoData(): Promise<void> {
  localStorage.removeItem(LS_KEY);
  await ensureSeed();
}

export async function listItems(): Promise<Item[]> {
  await ensureSeed();
  return load().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function listItemsPaged(page: number, pageSize: number) {
  const all = await listItems();
  const total = all.length;
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), total };
}

export async function getItem(id: string): Promise<Item | null> {
  const all = await listItems();
  return all.find(x => x.id === id) ?? null;
}

export async function createItem(input: { name: string; description?: string | null }): Promise<void> {
  const all = await listItems();
  const now = new Date().toISOString();
  all.unshift({
    id: uuid(),
    user_id: null,
    name: input.name,
    description: input.description ?? null,
    created_at: now,
  });
  save(all);
}

export async function updateItem(id: string, patch: { name?: string; description?: string | null }): Promise<void> {
  const all = await listItems();
  const idx = all.findIndex(x => x.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.description !== undefined ? { description: patch.description ?? null } : {}),
  };
  save(all);
}

export async function deleteItem(id: string): Promise<void> {
  const all = await listItems();
  save(all.filter(x => x.id !== id));
}
