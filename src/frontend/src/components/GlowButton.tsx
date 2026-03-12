import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  size?: "default" | "lg";
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    { children, className, variant = "primary", size = "default", ...props },
    ref,
  ) => {
    const base =
      "relative w-full font-body font-semibold rounded-2xl cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-start focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "btn-glow text-white",
      ghost:
        "bg-transparent border-2 border-orange-start text-orange-start hover:bg-orange-50 transition-colors",
    };

    const sizes = {
      default: "min-h-[56px] px-6 text-base md:min-h-[72px] md:text-lg md:px-8",
      lg: "min-h-[64px] px-8 text-lg md:min-h-[80px] md:text-xl md:px-10",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

GlowButton.displayName = "GlowButton";
