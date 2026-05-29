import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink shadow-sm placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  )
);

TextInput.displayName = "TextInput";
