import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils.ts";

function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="overlay-in fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "sheet-in glass fixed z-50 w-full overflow-y-auto p-5 outline-none",
          "inset-x-0 bottom-0 max-h-[92vh] rounded-t-[28px] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[85vh] md:w-[min(460px,calc(100%-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-full p-2 text-muted hover:bg-white/10 hover:text-ink"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-4 pr-8", className)} {...props} />;
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-display text-2xl font-bold tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-1 text-sm text-muted", className)} {...props} />;
}

function DialogFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>{children}</div>;
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger };
