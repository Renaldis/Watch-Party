import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" && "bg-fern text-white hover:bg-[#126b55]",
          variant === "secondary" && "border border-line bg-white text-ink hover:bg-slate-50",
          variant === "danger" && "bg-coral text-white hover:bg-[#c95340]",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
