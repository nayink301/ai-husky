// src/routes/dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { listItems, deleteItem, updateItem } from "@/services/items";
import type { Item } from "@/types/item";

import Welcome from "@/components/welcome";
import ExpandableText from "@/components/expandable-text";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

import { Plus, Pencil, Trash2, PawPrint } from "lucide-react";
import { classifySentiment } from "@/lib/aiHusky";

/* ---------- mini calendar for compact date cell ---------- */
function MiniCalendar({ iso }: { iso: string }) {
  const d = new Date(iso);
  const month = d.toLocaleString(undefined, { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  return (
    <div
      className="flex flex-col items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-md border bg-gray-50 shadow-sm"
      title={d.toLocaleString()}
    >
      <span className="text-[9px] sm:text-[10px] uppercase text-gray-500 leading-none">{month}</span>
      <span className="text-[12px] sm:text-base font-semibold leading-none">{day}</span>
      <span className="text-[8px] sm:text-[10px] text-gray-400 leading-none">{year}</span>
    </div>
  );
}

type Sentiment = "positive" | "negative" | "neutral";
type ItemWithSentiment = Item & { _sentiment: Sentiment };

const colorFor = (s: Sentiment) =>
  s === "positive" ? "text-emerald-600" : s === "negative" ? "text-red-600" : "text-amber-600";

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // sentiment filter (tap a paw to filter; tap again to clear)
  const [selected, setSelected] = useState<Sentiment | null>(null);

  // edit dialog state
  const [editItem, setEditItem] = useState<ItemWithSentiment | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const load = async () => {
    try {
      const data = await listItems();
      setItems(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const withSentiment: ItemWithSentiment[] = useMemo(() => {
    return items.map((it) => {
      const text = (it.description ?? "").trim();
      const s = (text ? classifySentiment(text).sentiment : "neutral") as Sentiment;
      return { ...it, _sentiment: s };
    });
  }, [items]);

  const filtered = useMemo(
    () => (selected ? withSentiment.filter((x) => x._sentiment === selected) : withSentiment),
    [withSentiment, selected]
  );

  const toggleFilter = (s: Sentiment) => setSelected((cur) => (cur === s ? null : s));

  const openEdit = (it: ItemWithSentiment) => {
    setEditItem(it);
    setEditName(it.name ?? "");
    setEditDesc((it.description ?? "").toString());
  };

  const saveEdit = async () => {
    if (!editItem) return;
    const newName = editName.trim();
    const newDesc = editDesc.trim();
    if (!newName) return toast.error("Name cannot be empty");

    const prev = items;
    setItems((xs) =>
      xs.map((x) => (x.id === editItem.id ? { ...x, name: newName, description: newDesc || null } : x))
    );

    try {
      await updateItem(editItem.id, { name: newName, description: newDesc || null });
      toast.success("Item updated");
      setEditItem(null);
    } catch (e) {
      setItems(prev);
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== id));
    try {
      await deleteItem(id);
      toast.success("Item deleted");
    } catch (e) {
      setItems(prev);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-3 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-semibold"></h1>
          <Welcome className="mt-1" />
        </div>
        <div className="flex gap-2">
          <Link to="/new">
          </Link>
        </div>
      </div>

      <div className="mt-3 sm:mt-6 rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="text-[12px] sm:text-sm">
                <TableHead className="px-2 py-2 w-[28%] sm:w-[28%]">Name</TableHead>

                <TableHead className="px-2 py-2 w-[46%] sm:w-[44%]">
                  <div className="flex items-center gap-1">
                    <span>Description</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        type="button"
                        className={`p-0.5 rounded ${selected === "negative" ? "bg-red-50" : ""}`}
                        onClick={() => toggleFilter("negative")}
                        title="Negative"
                        aria-pressed={selected === "negative"}
                      >
                        <PawPrint className={`h-3.5 w-3.5 ${colorFor("negative")}`} />
                      </button>
                      <button
                        type="button"
                        className={`p-0.5 rounded ${selected === "neutral" ? "bg-amber-50" : ""}`}
                        onClick={() => toggleFilter("neutral")}
                        title="Neutral"
                        aria-pressed={selected === "neutral"}
                      >
                        <PawPrint className={`h-3.5 w-3.5 ${colorFor("neutral")}`} />
                      </button>
                      <button
                        type="button"
                        className={`p-0.5 rounded ${selected === "positive" ? "bg-emerald-50" : ""}`}
                        onClick={() => toggleFilter("positive")}
                        title="Positive"
                        aria-pressed={selected === "positive"}
                      >
                        <PawPrint className={`h-3.5 w-3.5 ${colorFor("positive")}`} />
                      </button>
                    </div>
                  </div>
                </TableHead>

                <TableHead className="px-2 py-2 w-[16%] sm:w-[16%]">Created</TableHead>
                <TableHead className="px-2 py-2 w-[10%] sm:w-[12%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-2 py-4 text-center text-sm text-gray-500">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-2 py-6 text-center text-sm text-gray-600">
                    No items match.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((it) => (
                  <TableRow key={it.id} className="align-middle">
                    {/* Name (truncate one line) */}
                    <TableCell className="px-2 py-2">
                      <div className="truncate text-[13px] sm:text-sm font-medium">{it.name}</div>
                    </TableCell>

                    {/* Description: compact (1 line) -> expands inline on click */}
                    <TableCell className="px-2 py-2 align-middle">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <PawPrint className={`h-4 w-4 flex-none ${colorFor((it as any)._sentiment)}`} />
                        <div className="min-w-0 w-full text-[12px] sm:text-sm text-gray-700">
                          <ExpandableText text={it.description} clamp={1} />
                        </div>
                      </div>
                    </TableCell>

                    {/* Created */}
                    <TableCell className="px-2 py-2">
                      <div className="flex justify-start">
                        <MiniCalendar iso={it.created_at} />
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-1 py-2">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEdit(it as ItemWithSentiment)}
                          aria-label={`Edit ${it.name}`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onDelete(it.id)}
                          aria-label={`Delete ${it.name}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ---------- Edit Dialog (bold Name label) ---------- */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              <span className="font-semibold">Edit: {editItem?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="block text-[13px] sm:text-sm font-semibold mb-1">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[13px] sm:text-sm font-medium mb-1">Description</label>
              <Textarea rows={5} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



