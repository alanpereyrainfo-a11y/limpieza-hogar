import { useState } from "react";
import { diffDays, duePhrase, formatLongDate } from "../domain/dates.ts";
import type { Task } from "../domain/types.ts";
import { TaskCard } from "../components/TaskCard.tsx";
import { Button } from "../components/ui/button.tsx";
import { useStore } from "../state/store.tsx";

export function ProximasView({
  onEdit,
  onPostpone,
  onDone,
}: {
  onEdit: (task: Task) => void;
  onPostpone: (task: Task) => void;
  onDone: (task: Task) => void;
}) {
  const { data, today } = useStore();
  const [expanded, setExpanded] = useState(false);
  const zones = new Map(data.zones.map((zone) => [zone.id, zone]));
  const upcoming = data.tasks
    .filter((task) => task.nextDue > today)
    .sort((a, b) => (a.nextDue < b.nextDue ? -1 : a.nextDue > b.nextDue ? 1 : a.name.localeCompare(b.name, "es")));
  const visible = expanded ? upcoming : upcoming.filter((task) => diffDays(today, task.nextDue) <= 21);
  const groups = new Map<string, Task[]>();
  for (const task of visible) {
    const list = groups.get(task.nextDue) ?? [];
    list.push(task);
    groups.set(task.nextDue, list);
  }

  return (
    <div data-testid="view-proximas" className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Próximas</h1>
        <p className="mt-1 text-sm text-muted">Lo que viene, con cuántos días faltan.</p>
      </div>
      {upcoming.length === 0 ? (
        <div className="glass rounded-[24px] px-5 py-8 text-center">
          <h2 className="font-display text-2xl">No hay nada más adelante</h2>
          <p className="mt-2 text-sm text-muted">Cuando cumplas las de hoy, las próximas aparecen acá.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([date, tasks]) => (
            <section key={date} className="space-y-3">
              <h2 className="text-sm font-semibold text-cyan capitalize">
                {formatLongDate(date)} · {duePhrase(date, today)}
              </h2>
              {tasks.map((task) => (
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
          ))}
          {!expanded && upcoming.length > visible.length && (
            <Button variant="ghost" onClick={() => setExpanded(true)}>
              Ver todo lo que viene
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
