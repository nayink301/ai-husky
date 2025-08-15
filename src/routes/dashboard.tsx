// src/routes/dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { listItems, deleteItem, updateItem } from "@/services/items";
import type { Item } from "@/types/item";
import Welcome from "@/components/welcome";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, PawPrint } from "lucide-react";
import { classifySentiment } from "@/lib/aiHusky";

type Sentiment = "positive" | "negative" | "neutral";

function colorFor(sent: Sentiment) {
  switch (sent) {
    case "positive": return "text-emerald-600";
    case "negative": return "text-red-600";
    default: return "text-amber-600";
  }
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected filter; null = show all
  const [selected, setSelected] = useState<Sentiment | null>(null);

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

  useEffect(() => { load(); }, []);

  // Add a lightweight sentiment to each row
  const itemsWithSentiment = useMemo(() => {
    return items.map((it) => {
      const text = (it.description ?? "").trim();
      const s = text ? classifySentiment(text).sentiment : "neutral";
      return { ...it, _sentiment: (s ?? "neutral") as Sentiment };
    });
  }, [items]);

  // Apply filter
  const filtered = useMemo(
    () => selected ? itemsWithSentiment.filter((x) => x._sentiment === selected) : itemsWithSentiment,
    [itemsWithSentiment, selected]
  );

  // Toggle filter when clicking a header paw
  const toggleFilter = (s: Sentiment) => setSelected((cur) => (cur === s ? null : s));

  // Single combined prompt: "Name | Description"
  const onEdit = async (it: Item) => {
    const seedName = it.name ?? "";
    const seedDesc = (it.description ?? "").replace(/\n/g, " "); // keep prompt one-line
    const combined = window.prompt("Edit as: Name | Description", `${seedName} | ${seedDesc}`);
    if (combined === null) return; // cancel

    // Parse by the first " | "
    const [rawName, ...rest] = combined.split("|");
    const newName = (rawName ?? "").trim();
    const newDesc = rest.join("|").trim(); // in case user had extra pipes

    if (!newName) {
      toast.error("Name cannot be empty");
      return;
    }

    const prev = items;
    // optimistic update
    setItems((xs) =>
      xs.map((x) =>
        x.id === it.id ? { ...x, name: newName, description: newDesc || null } : x
      )
    );

    try {
      await updateItem(it.id, { name: newName, description: newDesc || null });
      toast.success("Item updated");
    } catch (e) {
      setItems(prev); // revert on failure
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm("Delete this item?");
    if (!ok) return;
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== id)); // optimistic
    try {
      await deleteItem(id);
      toast.success("Item deleted");
    } catch (e) {
      setItems(prev);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
          <Welcome className="mt-1" />
        </div>
        <div className="flex gap-2">
          <Link to="/new">
            <Button className="h-10 sm:h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              New Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px] sm:min-w-0">
            <TableHeader>
              <TableRow className="text-xs sm:text-sm">
                <TableHead className="w-[38%] sm:w-[30%]">Name</TableHead>

                {/* Description header + tiny paw filters (no label) */}
                <TableHead className="hidden sm:table-cell w-[42%]">
                  <div className="flex items-center gap-2">
                    <span>Description</span>
                    <div className="flex items-center gap-1 ml-1">
                      {/* Negative */}
                      <button
                        type="button"
                        className={`p-1 rounded ${selected === "negative" ? "bg-red-50" : ""}`}
                        onClick={() => toggleFilter("negative")}
                        title="Filter negative"
                        aria-pressed={selected === "negative"}
                      >
                        <PawPrint className={`h-4 w-4 ${colorFor("negative")}`} />
                      </button>
                      {/* Neutral */}
                      <button
                        type="button"
                        className={`p-1 rounded ${selected === "neutral" ? "bg-amber-50" : ""}`}
                        onClick={() => toggleFilter("neutral")}
                        title="Filter neutral"
                        aria-pressed={selected === "neutral"}
                      >
                        <PawPrint className={`h-4 w-4 ${colorFor("neutral")}`} />
                      </button>
                      {/* Positive */}
                      <button
                        type="button"
                        className={`p-1 rounded ${selected === "positive" ? "bg-emerald-50" : ""}`}
                        onClick={() => toggleFilter("positive")}
                        title="Filter positive"
                        aria-pressed={selected === "positive"}
                      >
                        <PawPrint className={`h-4 w-4 ${colorFor("positive")}`} />
                      </button>
                    </div>
                  </div>
                </TableHead>

                <TableHead className="w-[22%] sm:w-[20%]">Created</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-500">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    <div className="text-sm text-gray-600">No items match.</div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((it: any) => (
                  <TableRow key={it.id} className="align-top">
                    <TableCell className="py-3">
                      <div className="font-medium text-sm sm:text-base">{it.name}</div>
                      {/* Mobile: inline desc + row paw */}
                      <div className="sm:hidden text-xs text-gray-600 mt-1 flex items-start gap-1.5">
                        <PawPrint className={`mt-0.5 h-3.5 w-3.5 ${colorFor(it._sentiment)}`} />
                        <span className="line-clamp-2">{it.description ?? "—"}</span>
                      </div>
                    </TableCell>

                    {/* Desktop: description column with a single row paw */}
                    <TableCell className="hidden sm:table-cell py-3 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <PawPrint className={`mt-0.5 h-4 w-4 ${colorFor(it._sentiment)}`} />
                        <span className="line-clamp-2">{it.description ?? "—"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                    <div
                        className="flex flex-col items-center justify-center w-12 h-12 rounded-lg border shadow-sm bg-gray-50"
                          title={new Date(it.created_at).toLocaleString()} // hover full date/time
                       >
    <span className="text-[0.6rem] uppercase text-gray-500 leading-none">
      {format(new Date(it.created_at), "MMM")}
    </span>
    <span className="text-lg font-semibold leading-none">
      {format(new Date(it.created_at), "d")}
    </span>
    <span className="text-[0.6rem] text-gray-400 leading-none">
      {format(new Date(it.created_at), "yyyy")}
    </span>
  </div>
</TableCell>

                    <TableCell className="py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => onEdit(it)}
                          aria-label={`Edit ${it.name}`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 px-2"
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
    </div>
  );
}

