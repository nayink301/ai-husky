import { useEffect, useRef, useState } from "react";

export default function ExpandableText({
  text,
  clamp = 1,          // number of lines to show when collapsed
  className = "",
}: { text: string | null | undefined; clamp?: number; className?: string }) {
  const value = (text ?? "").trim() || "—";
  const [open, setOpen] = useState(false);
  const [lineHeight, setLineHeight] = useState<number>(0);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!spanRef.current) return;
    const cs = window.getComputedStyle(spanRef.current);
    const lh = parseFloat(cs.lineHeight || "0");
    setLineHeight(Number.isFinite(lh) && lh > 0 ? lh : 20);
  }, []);

  const collapsedMax = lineHeight * clamp || undefined;

  return (
    <button
      type="button"
      className={`group text-left w-full ${className}`}
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      title={open ? "Collapse" : "Expand"}
    >
      <span
        ref={spanRef}
        className="block transition-[max-height] duration-200 ease-in-out text-ellipsis"
        style={
          open
            ? { maxHeight: undefined, overflow: "visible" }
            : { maxHeight: collapsedMax, overflow: "hidden" }
        }
      >
        {value}
      </span>

      {/* subtle affordance */}
      <span className="mt-1 inline-block text-[11px] text-gray-400 group-hover:underline">
        {open ? "Show less ▲" : "Show more ▼"}
      </span>
    </button>
  );
}
