// src/components/ui/button.tsx
import * as React from "react";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-2 text-xs",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-base",
};

const variantClasses: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90 border border-transparent",
  outline:
    "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          "ring-offset-background", // works with your shadcn-style tokens
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
