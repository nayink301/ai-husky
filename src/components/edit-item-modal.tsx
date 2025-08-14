import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/types/item";

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  onSave: (values: { name: string; description: string | null }) => Promise<void>;
};

export default function EditItemModal({ open, onClose, item, onSave }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (item) { setName(item.name); setDesc(item.description ?? ""); }
  }, [item]);

  const handleSave = async () => { await onSave({ name: name.trim(), description: desc.trim() || null }); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit item</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
