import { useMemo, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PawPrint } from "lucide-react";

import { createItem } from "@/services/items";
import { isHuskyOn } from "@/lib/huskyToggle";
import { decideResponse, classifyIntent, classifySentiment, suggestPhrasesScored } from "@/lib/aiHusky";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500, "Description too long").optional(),
});
type FormValues = z.infer<typeof schema>;

function useDebouncedValue<T>(value: T, ms = 500) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = window.setTimeout(() => setV(value), ms); return () => window.clearTimeout(id); }, [value, ms]);
  return v;
}

export default function NewItem() {
  const navigate = useNavigate();
  const [useHusky, setUseHusky] = useState(isHuskyOn());

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } });

  const { ref: rhfDescRef, onChange: rhfOnChange, ...descReg } = register("description");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const [desc, setDesc] = useState("");
  const debouncedDesc = useDebouncedValue(desc, 600);

  const questions = useMemo(() => {
    if (!useHusky) return [] as string[];
    const list = suggestPhrasesScored(debouncedDesc).filter(s => s.score >= 0.6).slice(0, 3).map(s => s.text);
    return list.length ? list : ["What was the goal?", "What worked / didn’t?", "What’s the next step?"];
  }, [debouncedDesc, useHusky]);

  const insertHuskyPrompt = (q: string) => {
    const el = taRef.current; if (!el) return;
    const current = el.value ?? "";
    const prefix = current.trim().length ? (current.endsWith("\n") ? "" : "\n\n") : "";
    const block = `“Husky asks: ${q}”\n— `;
    const next = (current + prefix + block).slice(0, 500);
    el.value = next;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    requestAnimationFrame(() => { el.focus(); const pos = next.length; el.setSelectionRange(pos, pos); });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await createItem({ name: data.name.trim(), description: (data.description ?? "").trim() });

      if (useHusky) {
        const text = (data.description ?? "").trim();
        const intent = classifyIntent(text);
        const sentiment = intent.intent === "review" ? classifySentiment(text) : { sentiment: "neutral", score: 0.5 };
        const decision = decideResponse(text);
        if (decision.kind === "review-positive") toast.success(decision.message, { duration: 5000 });
        else if (decision.kind === "review-negative") toast.error(decision.message, { duration: 5000, action: { label: "Share details", onClick: () => {} } });
        else toast(decision.message, { duration: 5000 });
      } else {
        toast.success("Item created!", { duration: 5000 });
      }

      reset(); navigate("/dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create item.", { duration: 6000 });
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="rounded-2xl border bg-white shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-semibold mb-4">New Item</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <Input id="name" type="text" {...register("name")} />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe your experience, goal, or question…"
              className="w-full"
              {...descReg}
              ref={(el) => { taRef.current = el; rhfDescRef(el); }}
              aria-invalid={!!errors.description}
              onChange={(e) => { setDesc(e.target.value); rhfOnChange(e); }}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}

            {useHusky && (
              <div className="mt-3 border-t border-gray-200 pt-2">
                <div className="mb-1 text-xs italic text-gray-500 flex items-center gap-1">
                  <PawPrint className="h-3.5 w-3.5 text-gray-400" />
                  Husky suggests:
                </div>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-3 py-1 flex items-center gap-1 transition-transform transform hover:scale-105 hover:shadow-sm"
                      onClick={() => insertHuskyPrompt(q)}
                      aria-label={`Insert prompt: ${q}`}
                    >
                      <PawPrint className="h-3 w-3 text-gray-500" /> “{q}”
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useHusky} onChange={() => setUseHusky(v => !v)} /> Enable Husky AI
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
