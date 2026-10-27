import { duePhrase, formatMinutes, nextWeekday, sentenceCase } from "../domain/dates.ts";
import { MAX_DEEP_MINUTES, PLAN_DAYS } from "../domain/plan.ts";
import { deepMinutesOn } from "../domain/schedule.ts";
import type { Task } from "../domain/types.ts";
import { useStore } from "../state/store.tsx";

const fieldClass =
  "h-9 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-cyan/40";

export function PlanView({ onEdit }: { onEdit: (task: Task) => void }) {
  const { data, today, dispatch } = useStore();
  const dailies = data.tasks.filter((task) => task.frequencyDays <= 1);
  const dailyMinutes = dailies.reduce((sum, task) => sum + task.durationMin, 0);

  return (
    <div data-testid="view-plan" className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Plan</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          La semana, además de las diarias. El fondo intenta no pasar de {MAX_DEEP_MINUTES} min por día. Si un día se
          llena, la fecha se corre sola.
        </p>
      </div>
      <section className="glass rounded-[24px] p-4">
        <h2 className="font-display text-xl font-bold">Todos los días</h2>
        <p className="mt-1 text-sm text-muted">{formatMinutes(dailyMinutes)} de rutina, aparte del fondo.</p>
        <ul className="mt-3 space-y-2">
          {dailies.map((task) => (
            <li key={task.id}>
              <button type="button" className="text-sm hover:text-cyan" onClick={() => onEdit(task)}>
                {sentenceCase(task.name)}
                <span className="ml-2 text-xs text-muted">{formatMinutes(task.durationMin)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid gap-3 lg:grid-cols-2">
        {PLAN_DAYS.map((day) => {
          const tasks = data.tasks
            .filter((task) => task.weekday === day.weekday && task.frequencyDays > 1)
            .sort((a, b) => a.frequencyDays - b.frequencyDays);
          const date = nextWeekday(today, day.weekday);
          const load = deepMinutesOn(data.tasks, date);
          const heavy = load > MAX_DEEP_MINUTES;
          return (
            <section key={day.weekday} className="glass rounded-[24px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold">{day.label}</h2>
                  <p className="text-sm text-cyan">{day.theme}</p>
                  <p className="mt-1 text-xs text-muted">{day.detail}</p>
                </div>
                <p className={`text-right text-xs font-semibold ${heavy ? "text-amber" : "text-muted"}`}>
                  {load} min
                  <span className="block font-normal">fondo {duePhrase(date, today)}</span>
                </p>
              </div>
              {heavy && (
                <p className="mt-2 text-xs text-amber">Este día se pasa de {MAX_DEEP_MINUTES} min. Pasá alguna a otro día.</p>
              )}
              <ul className="mt-3 space-y-2">
                {tasks.length === 0 && <li className="text-sm text-muted">Nada fijo este día.</li>}
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-2">
                    <button type="button" className="min-w-0 truncate text-left text-sm hover:text-cyan" onClick={() => onEdit(task)}>
                      {sentenceCase(task.name)}
                      <span className="ml-2 text-xs text-muted">
                        {formatMinutes(task.durationMin)} · cada {task.frequencyDays} días
                        {task.nextDue !== date ? ` · ${duePhrase(task.nextDue, today)}` : ""}
                      </span>
                    </button>
                    <select
                      aria-label={`Día de ${task.name}`}
                      className={fieldClass}
                      value={String(task.weekday)}
                      onChange={(event) => {
                        const weekday = Number(event.target.value);
                        dispatch({ type: "update-task", today, task: { ...task, weekday } });
                      }}
                    >
                      {PLAN_DAYS.map((option) => (
                        <option key={option.weekday} value={option.weekday}>
                          {option.short}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
