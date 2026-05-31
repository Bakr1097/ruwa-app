import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        {
          "bg-primary text-primary-foreground": variant === "default",
          "bg-success text-success-foreground": variant === "success",
          "bg-warning text-warning-foreground": variant === "warning",
          "bg-destructive text-destructive-foreground": variant === "destructive",
          "bg-muted text-muted-foreground": variant === "muted",
        },
        className
      )}
      {...props}
    />
  );
}
