import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ className, fullWidth, style, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "transition-all rounded px-3 py-2 leading-5 outline-none focus:ring-2 focus:ring-primary-400",
        fullWidth && "w-full",
        className
      )}
      style={{
        background: "var(--input, #f8f9fa)",
        color: "var(--foreground, #333)",
        border: "1px solid var(--border, #ccc)",
        borderRadius: 6,
        boxShadow: "var(--shadow, 0 1px 2px rgba(0,0,0,0.04))",
        fontFamily: "var(--typography-paragraph-fontFamily, inherit)",
        fontSize: "var(--typography-paragraph-fontSize, 1rem)",
        fontWeight: "var(--typography-paragraph-fontWeight, 400)",
        ...style
      }}
      {...props}
    />
  )
);
