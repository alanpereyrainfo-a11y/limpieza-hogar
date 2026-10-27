import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/80 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-cyan text-slate-950 shadow-[0_0_24px_rgba(94,242,255,0.35)] hover:brightness-110",
        lime: "bg-lime text-slate-950 shadow-[0_0_22px_rgba(198,255,74,0.28)] hover:brightness-105",
        amber: "border border-amber/40 bg-amber/12 text-amber hover:bg-amber/20",
        ghost: "border border-white/10 bg-white/5 text-ink hover:bg-white/10",
        danger: "border border-danger/40 bg-danger/15 text-danger hover:bg-danger/25",
        quiet: "text-muted hover:bg-white/8 hover:text-ink",
      },
      size: {
        default: "h-11 px-4 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, type = "button", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} type={asChild ? undefined : type} {...props} />;
}

export { Button };
