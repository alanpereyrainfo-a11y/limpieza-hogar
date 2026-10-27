import { useState } from "react";
import { formatLongDate, sentenceCase } from "../domain/dates.ts";
import { applyPostpone, postponeOptions } from "../domain/postpone.ts";
import type { Task } from "../domain/types.ts";
import { Mapi } from "./Mapi.tsx";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog.tsx";

export function PostponeDialog({
  task,
  today,
  onClose,
  onConfirm,
}: {
  task: Task | null;
  today: string;
  onClose: () => void;
  onConfirm: (days: number) => void;
}) {
  const options = task ? postponeOptions(task.postponeCount) : [];
  const [days, setDays] = useState(options[0] ?? 1);
  const preview = task ? applyPostpone(task, days, today) : null;

  return (
    <Dialog open={task !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {task && preview && preview.ok && (
          <>
            <DialogHeader>
              <DialogTitle>Posponer</DialogTitle>
              <DialogDescription>«{sentenceCase(task.name)}»</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3">
              <Mapi mood="sucio" className="h-24 w-24 shrink-0" />
              <p className="text-sm text-muted">
                {task.postponeCount === 0 && "Podés correrla 1, 2 o 3 días. Cada vez suma mugre."}
                {task.postponeCount === 1 && "Es la segunda seguida: solo 1 día, y queda urgente."}
                {task.postponeCount === 2 && "Última vez: 1 día. Después no se puede posponer."}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((option) => {
                const enabled = options.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!enabled}
                    onClick={() => setDays(option)}
                    className={`h-16 rounded-2xl border text-sm font-semibold ${
                      days === option && enabled
                        ? "border-amber bg-amber/15 text-amber"
                        : "border-white/10 bg-white/5 text-ink"
                    }`}
                  >
                    {option} {option === 1 ? "día" : "días"}
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              <li>Pasa a {formatLongDate(preview.nextDue)}.</li>
              <li>Suma 1 de suciedad. La zona se ensucia más rápido.</li>
              <li>Restás {Math.abs(preview.pointsDelta)} puntos.</li>
              {preview.breaksStreak && <li>Se corta la racha, porque hoy ya tocaba.</li>}
              {preview.urgent && <li>Queda marcada como urgente.</li>}
              {preview.blocked && <li>Después de esta, no vas a poder posponerla.</li>}
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="amber" onClick={() => onConfirm(days)}>
                Posponer {days} {days === 1 ? "día" : "días"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
