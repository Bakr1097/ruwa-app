import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-[7px] font-bold transition-all duration-150 rounded-[var(--radius-inner)] disabled:opacity-50 disabled:pointer-events-none active:translate-y-px",
          {
            "bg-primary text-primary-foreground btn-shadow-primary hover:brightness-105":
              variant === "primary",
            "bg-[var(--soft)] text-[var(--soft-foreground)] hover:bg-accent":
              variant === "secondary",
            "bg-transparent text-foreground hover:bg-accent":
              variant === "ghost",
            "bg-destructive text-destructive-foreground hover:opacity-90":
              variant === "destructive",
          },
          {
            "h-[38px] px-[14px] text-[13px]": size === "sm",
            "h-[42px] px-[18px] text-[14px]": size === "md",
            "h-[50px] px-5 text-[15px]": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
