import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full bg-card border border-border rounded-[var(--radius-inner)]",
        "px-[13px] py-3 text-[14.5px] text-foreground",
        "transition-[border-color,box-shadow] duration-150",
        "input-focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
