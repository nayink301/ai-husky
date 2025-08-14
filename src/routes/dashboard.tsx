import { useEffect, useMemo, useState } from "react";
import { listItems, deleteItem, updateItem} from "@/services/items";
import type { Item } from "@/types/item";
import EditItemModal from "@/components/edit-item-modal";
import Spinner from "@/components/spinner";
import Alert from "@/components/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { isHuskyOn } from "@/lib/huskyToggle";
import { classifyIntent, classifySentiment } from "@/lib/aiHusky";
import { Pencil, Trash2 } from "lucide-react";
import { disableDemoMode, isDemoMode } from "@/lib/demoFlag";
import { useNavigate } from "react-router-dom";
import Welcome from "@/components/welcome";

type SortKey = "name" | "created_at";
type SortDir = "asc" | "desc";


function HuskyBadge({ text }: { text: string | null }) {
  if (!isHuskyOn() || !text?.trim()) return null;
  const { intent } = classifyIntent(text);
  if (intent === "review") {
    const { sentiment } = classifySentiment(text);
    const cls = sentiment === "positive" ? "bg-green-100 text-green-900"
      : sentiment === "negative" ? "bg-red-100 text-red-900"
      : "bg-gray-100 text-gray-800";
    const label = sentiment === "positive" ? "Review: Positive"
      : sentiment === "negative" ? "Review: Negative" : "Review";
    return <span className={`text-xs px-2 py-0.5 rounded ${cls}`}>{label}</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-900">Other</span>;
}
export function DemoBanner() {
    const nav = useNavigate();
  
    const exitDemo = () => {
      disableDemoMode();
      nav("/login", { replace: true });
      window.location.reload(); // ensures all in-memory state resets
    };
  
    if (!isDemoMode()) return null;
  
    return (
      <div className="bg-amber-100 text-amber-900 px-4 py-2 flex justify-between items-center">
        <span>You are in demo mode.</span>
        <Button variant="outline" size="sm" onClick={exitDemo}>
          ❌ Exit demo
        </Button>
      </div>
    );
  }

export default function Dashboard() {
  const [all, setAll] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  useEffect(() => {
    (async () => {
      try { setLoading(true); setAll(await listItems()); }
      catch (e: any) { setErr(e?.message ?? "Failed to load."); }
      finally { setLoading(false); }
    })();
  }, []);

  const sorted = useMemo(() => {
    const s = [...all].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return sortDir === "asc" ? s : s.reverse();
  }, [all, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const onDelete = async (id: string) => {
    const prev = all;
    setAll(prev.filter(x => x.id !== id));
    try { await deleteItem(id); toast.success("Deleted", { duration: 3000 }); }
    catch { setAll(prev); toast.error("Delete failed", { duration: 5000 }); }
  };

  const onEditClick = (row: Item) => { setEditing(row); setOpenEdit(true); };
  const onSaveEdit = async (values: { name: string; description: string | null }) => {
    if (!editing) return;
    const id = editing.id;
    const prev = all;
    setAll(prev.map(x => x.id === id ? { ...x, ...values } : x));
    try { await updateItem(id, values); toast.success("Updated", { duration: 3000 }); }
    catch { setAll(prev); toast.error("Update failed", { duration: 5000 }); }
    finally { setEditing(null); }
  };

  if (loading) return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="rounded-2xl border bg-white shadow-sm p-6"><Spinner label="Loading dashboard…" /></div>
    </div>
  );
  if (err) return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="rounded-2xl border bg-white shadow-sm p-6"><Alert kind="error">{err}</Alert></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
         <Welcome className="mb-4" />

        {sorted.length === 0 ? (
          <Alert kind="info">No items yet. Create your first item from the “New Item” page.</Alert>
        ) : (
          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    Name {sortKey==="name" ? (sortDir==="asc" ? "↑" : "↓") : ""}
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                    Created {sortKey==="created_at" ? (sortDir==="asc" ? "↑" : "↓") : ""}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(it => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{it.description}</div>
                        <HuskyBadge text={it.description} />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(it.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => onEditClick(it)} className="mr-1">
                        <Pencil className="h-4 w-4 mr-1" /> 
                      </Button>
                      <Button variant="ghost" onClick={() => onDelete(it.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> 
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {sorted.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
            <span className="text-sm">Page {page} / {totalPages}</span>
            <Button variant="outline" disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</Button>
          </div>
        )}
      </div>

      <EditItemModal
        open={openEdit}
        onClose={() => { setOpenEdit(false); setEditing(null); }}
        item={editing}
        onSave={onSaveEdit}
      />
    </div>
  );
}
