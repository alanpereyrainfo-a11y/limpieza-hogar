import { Check, Clock, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { duePhrase, formatMinutes, sentenceCase } from "../domain/dates.ts";
import { isPostponeBlocked, isUrgent } from "../domain/postpone.ts";
import { priorityLabel } from "../domain/scoring.ts";
import type { Task, Zone } from "../domain/types.ts";
import { Button } from "./ui/button.tsx";

export function TaskCard({
  task,
  zone,
  today,
  onDone,
  onPostpone,
  onEdit,
}: {
  task: Task;
  zone: Zone | undefined;
  today: string;
  onDone: () => void;
  onPostpone: () => void;
  onEdit: () => void;
}) {
  const overdue = task.nextDue < today;
  const blocked = isPostponeBlocked(task.postponeCount);
  const urgent = isUrgent(task.postponeCount);
  return (
    <article className="glass rounded-[24px] p-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{ background: `${zone?.accent ?? "#5ef2ff"}22` }}
          aria-hidden="true"
        >
          {zone?.icon ?? "✨"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base leading-tight font-semibold">{sentenceCase(task.name)}</h3>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-ink"
              aria-label={`Editar ${task.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">
            {zone?.name ?? "Sin zona"} · {formatMinutes(task.durationMin)} · {overdue ? "venció" : "vence"}{" "}
            {duePhrase(task.nextDue, today)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {overdue && <Chip tone="danger">Vencida</Chip>}
            {urgent && <Chip tone="warn">Urgente</Chip>}
            {blocked && <Chip tone="danger">Sin posponer</Chip>}
            {task.dirtLevel > 0 && <Chip tone="warn">Suciedad {task.dirtLevel}</Chip>}
            <Chip>{priorityLabel(task.priority)}</Chip>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="lime" onClick={onDone} data-testid={`done-${task.id}`}>
          <Check className="h-4 w-4" />
          Hecho
        </Button>
        <Button variant="amber" onClick={onPostpone} disabled={blocked} data-testid={`postpone-${task.id}`}>
          <Clock className="h-4 w-4" />
          Posponer
        </Button>
      </div>
      {blocked && <p className="mt-2 text-xs text-danger">Ya la pospusiste 3 veces. Hoy toca hacerla.</p>}
    </article>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "danger" | "warn" | "ok" }) {
  const tones = {
    neutral: "bg-white/8 text-muted",
    danger: "bg-danger/15 text-danger",
    warn: "bg-amber/15 text-amber",
    ok: "bg-lime/15 text-lime",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}
