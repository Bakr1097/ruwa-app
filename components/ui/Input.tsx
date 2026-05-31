import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-card border border-border rounded-[var(--radius-inner)]",
        "px-[13px] py-3 text-[14.5px] text-foreground",
        "placeholder:text-muted-foreground",
        "transition-[border-color,box-shadow] duration-150",
        "input-focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
