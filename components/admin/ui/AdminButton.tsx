import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantStyles = {
  default: {
    background: "var(--primary, #007bff)",
    color: "var(--primary-foreground, #fff)",
    border: "none"
  },
  destructive: {
    background: "var(--destructive, #dc3545)",
    color: "#fff",
    border: "none"
  },
  outline: {
    background: "var(--background, #fff)",
    color: "var(--primary, #007bff)",
    border: "1px solid var(--border, #dee2e6)"
  },
  secondary: {
    background: "var(--secondary, #f5f5f5)",
    color: "var(--secondary-foreground, #333)",
    border: "none"
  },
  ghost: {
    background: "none",
    color: "var(--primary, #007bff)",
    border: "none"
  },
  link: {
    background: "none",
    color: "var(--primary, #007bff)",
    border: "none",
    textDecoration: "underline"
  }
};

const sizeStyles = {
  default: { height: 36, padding: "0 1.25rem", fontSize: "1rem", borderRadius: 8 },
  sm: { height: 32, padding: "0 1rem", fontSize: "0.95rem", borderRadius: 6 },
  lg: { height: 44, padding: "0 2rem", fontSize: "1.08rem", borderRadius: 12 },
  icon: { height: 36, width: 36, padding: 0, borderRadius: 8, fontSize: "1rem" }
};

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      style,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 select-none",
          className
        )}
        style={{
          ...variantStyle,
          ...sizeStyle,
          fontFamily: "var(--typography-button-fontFamily, inherit)",
          fontWeight: "var(--typography-button-fontWeight, 500)",
          fontSize: sizeStyle.fontSize,
          ...style
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
