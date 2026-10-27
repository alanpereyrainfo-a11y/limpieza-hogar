import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils.ts";

function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-base text-ink outline-none",
        "placeholder:text-muted/70 focus-visible:border-cyan/60 focus-visible:ring-2 focus-visible:ring-cyan/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
