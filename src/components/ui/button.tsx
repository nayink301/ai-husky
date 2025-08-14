import * as React from "react";
export function Button({ className="", variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "outline"|"ghost"; size?: "sm"|"md"}) {
  const base = "inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm transition";
  const v = variant==="outline" ? "border-gray-300 hover:bg-gray-100"
        : variant==="ghost" ? "border-transparent hover:bg-gray-100"
        : "bg-black text-white border-black hover:opacity-90";
  const s = size==="sm" ? "text-xs px-2 py-1" : "";
  return <button className={`${base} ${v} ${s} ${className}`} {...props} />;
}
