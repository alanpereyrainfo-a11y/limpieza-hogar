import { useEffect } from "react";
import { Pencil, Plus } from "lucide-react";
import { duePhrase, formatMinutes } from "../domain/dates.ts";
import { zoneCleanliness } from "../domain/cleanliness.ts";
import { cleanlinessLabel } from "../domain/scoring.ts";
import type { Task, Zone } from "../domain/types.ts";
import { CleanRing } from "../components/CleanRing.tsx";
import { Button } from "../components/ui/button.tsx";
import { useStore } from "../state/store.tsx";

export function ZonasView({
  focusZoneId,
  onEditZone,
  onCreateZone,
  onEditTask,
  onCreateTask,
}: {
  focusZoneId: string | null;
  onEditZone: (zone: Zone) => void;
  onCreateZone: () => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (zoneId: string) => void;
}) {
  const { data, today } = useStore();
  const zones = data.zones.slice().sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!focusZoneId) return;
    document.getElementById(`zona-${focusZoneId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusZoneId]);

  return (
    <div data-testid="view-zonas" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Zonas</h1>
          <p className="mt-1 text-sm text-muted">El nivel baja con los días y más rápido si posponés.</p>
        </div>
        <Button size="sm" onClick={onCreateZone}>
          <Plus className="h-4 w-4" />
          Zona
        </Button>
      </div>
      {zones.length === 0 ? (
        <div className="glass rounded-[24px] px-5 py-8 text-center">
          <h2 className="font-display text-2xl">No hay zonas</h2>
          <p className="mt-2 text-sm text-muted">Creá la primera habitación de la casa.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {zones.map((zone) => {
            const tasks = data.tasks
              .filter((task) => task.zoneId === zone.id)
              .sort((a, b) => a.frequencyDays - b.frequencyDays || a.name.localeCompare(b.name, "es"));
            const score = zoneCleanliness(tasks, today);
            const open = focusZoneId === zone.id;
            return (
              <article key={zone.id} id={`zona-${zone.id}`} className="glass rounded-[24px] p-4">
                <div className="flex items-center gap-3">
                  <CleanRing value={score} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-xl font-bold">
                        <span className="mr-1" aria-hidden="true">
                          {zone.icon}
                        </span>
                        {zone.name}
                      </h2>
                      <button
                        type="button"
                        className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-ink"
                        aria-label={`Editar ${zone.name}`}
                        onClick={() => onEditZone(zone)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted">
                      {cleanlinessLabel(score)} · {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
                    </p>
                  </div>
                </div>
                <ul className={`mt-3 space-y-2 ${open ? "" : "max-h-40 overflow-hidden"}`}>
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                      <button type="button" className="min-w-0 truncate text-left capitalize hover:text-cyan" onClick={() => onEditTask(task)}>
                        {task.name}
                      </button>
                      <span className="shrink-0 text-xs text-muted">
                        {formatMinutes(task.durationMin)} · {duePhrase(task.nextDue, today)}
                      </span>
                    </li>
                  ))}
                </ul>
                {tasks.length > 4 && !open && <p className="mt-2 text-xs text-muted">Hay {tasks.length} tareas. Tocá una para editarla.</p>}
                <Button className="mt-3" size="sm" variant="ghost" onClick={() => onCreateTask(zone.id)}>
                  <Plus className="h-4 w-4" />
                  Tarea en {zone.name}
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
