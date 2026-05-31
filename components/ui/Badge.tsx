import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-[10px] py-[3px] rounded-full",
        "text-[11px] font-bold tracking-[0.02em] capitalize whitespace-nowrap",
        {
          "badge-default": variant === "default",
          "badge-success": variant === "success",
          "badge-warning": variant === "warning",
          "badge-destructive": variant === "destructive",
          "badge-muted": variant === "muted",
        },
        className
      )}
      {...props}
    />
  );
}
