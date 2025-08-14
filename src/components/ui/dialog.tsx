import * as React from "react";
export function Dialog({ open, onOpenChange, children }:{ open:boolean; onOpenChange:(o:boolean)=>void; children:React.ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-black/40" onClick={()=>onOpenChange(false)}>
    <div className="absolute inset-0 flex items-center justify-center p-4" onClick={e=>e.stopPropagation()}>
      {children}
    </div>
  </div>;
}
export function DialogContent({ children }:{ children:React.ReactNode }) {
  return <div className="w-full max-w-md bg-white rounded-xl shadow p-4">{children}</div>;
}
export const DialogHeader = ({ children }:{children:React.ReactNode}) => <div className="mb-2">{children}</div>;
export const DialogTitle = ({ children }:{children:React.ReactNode}) => <h2 className="text-lg font-semibold">{children}</h2>;
export const DialogFooter = ({ children }:{children:React.ReactNode}) => <div className="mt-3 flex justify-end gap-2">{children}</div>;
