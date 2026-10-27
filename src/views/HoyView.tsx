import { useState } from "react";
import { motion } from "framer-motion";
import { formatLongDate, formatMinutes, greetingForHour } from "../domain/dates.ts";
import { mapiLine, mapiMood } from "../domain/mood.ts";
import { PRIORITY_RANK } from "../domain/scoring.ts";
import type { Task } from "../domain/types.ts";
import { Mapi } from "../components/Mapi.tsx";
import { TaskCard } from "../components/TaskCard.tsx";
import { useStore } from "../state/store.tsx";

function sortHoy(tasks: Task[], today: string): Task[] {
  return tasks
    .filter((task) => task.nextDue <= today)
    .sort((a, b) => {
      if (a.nextDue !== b.nextDue) return a.nextDue < b.nextDue ? -1 : 1;
      const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (rank !== 0) return rank;
      return a.durationMin - b.durationMin;
    });
}

export function HoyView({
  onEdit,
  onPostpone,
  onDone,
}: {
  onEdit: (task: Task) => void;
  onPostpone: (task: Task) => void;
  onDone: (task: Task) => void;
}) {
  const { data, today, pulse } = useStore();
  const zones = new Map(data.zones.map((zone) => [zone.id, zone]));
  const pending = sortHoy(data.tasks, today);
  const overdue = pending.filter((task) => task.nextDue < today);
  const todayTasks = pending.filter((task) => task.nextDue === today);
  const done = data.completions.filter((item) => item.date === today).length;
  const total = done + pending.length;
  const ratio = total === 0 ? 1 : done / total;
  const routine = pending.filter((task) => task.frequencyDays <= 1).reduce((sum, task) => sum + task.durationMin, 0);
  const deep = pending.filter((task) => task.frequencyDays > 1).reduce((sum, task) => sum + task.durationMin, 0);
  const mood = mapiMood(data.tasks, today);
  const [hour] = useState(() => new Date().getHours());

  return (
    <div data-testid="view-hoy" className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {greetingForHour(hour)}, Alan
        </h1>
        <p className="mt-1 text-sm text-muted">{formatLongDate(today)}</p>
      </div>

      <section className="rim rounded-[28px] p-4 md:p-5">
        <div className="flex items-center gap-3">
          <Mapi mood={mood} pulse={pulse} className="h-36 w-36 shrink-0 md:h-44 md:w-44" />
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">Mapi</p>
            <p className="mt-1 text-sm leading-relaxed text-ink md:text-base">{mapiLine(mood, overdue.length, data.streak)}</p>
            <p className="mt-3 text-sm text-muted">
              {total === 0
                ? "Nada pendiente"
                : `${done} de ${total} hechas · ${formatMinutes(routine)} de rutina y ${formatMinutes(deep)} de fondo`}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-lime"
                initial={false}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        </div>
      </section>

      {pending.length === 0 ? (
        <div className="glass rounded-[24px] px-5 py-8 text-center">
          <h2 className="font-display text-2xl">Hoy no tenés nada pendiente</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            La casa está al día. Si querés, mirá lo que viene o agregá una tarea nueva.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {overdue.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-[0.14em] text-danger uppercase">Vencidas</h2>
              {overdue.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  zone={zones.get(task.zoneId)}
                  today={today}
                  onDone={() => onDone(task)}
                  onPostpone={() => onPostpone(task)}
                  onEdit={() => onEdit(task)}
                />
              ))}
            </section>
          )}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Para hoy</h2>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted">Lo de hoy ya está. Quedan las vencidas de arriba.</p>
            ) : (
              todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  zone={zones.get(task.zoneId)}
                  today={today}
                  onDone={() => onDone(task)}
                  onPostpone={() => onPostpone(task)}
                  onEdit={() => onEdit(task)}
                />
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}
