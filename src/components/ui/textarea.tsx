import * as React from "react";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className="", ...props }, ref) => (
    <textarea ref={ref} className={`w-full border rounded px-3 py-2 ${className}`} {...props} />
  )
);
Textarea.displayName = "Textarea";
