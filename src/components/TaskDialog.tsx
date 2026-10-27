import { useState } from "react";
import { findSlot, busyFromTasks } from "../domain/schedule.ts";
import { PLAN_DAYS } from "../domain/plan.ts";
import { createId } from "../domain/ids.ts";
import type { Priority, Task } from "../domain/types.ts";
import { useStore } from "../state/store.tsx";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

const fieldClass =
  "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-base text-ink outline-none focus-visible:border-cyan/60 focus-visible:ring-2 focus-visible:ring-cyan/30";

export function TaskDialog({
  open,
  task,
  defaultZoneId,
  onClose,
}: {
  open: boolean;
  task: Task | null;
  defaultZoneId?: string;
  onClose: () => void;
}) {
  const { data, today, dispatch } = useStore();
  const [name, setName] = useState(task?.name ?? "");
  const [zoneId, setZoneId] = useState(task?.zoneId ?? defaultZoneId ?? data.zones[0]?.id ?? "");
  const [frequency, setFrequency] = useState(String(task?.frequencyDays ?? 7));
  const [duration, setDuration] = useState(String(task?.durationMin ?? 15));
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "media");
  const [weekday, setWeekday] = useState(task?.weekday === null || task?.weekday === undefined ? "" : String(task.weekday));
  const [startToday, setStartToday] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  function submit() {
    const cleanName = name.trim();
    const frequencyDays = Number(frequency);
    const durationMin = Number(duration);
    if (!cleanName) {
      setError("Poné un nombre.");
      return;
    }
    if (!zoneId) {
      setError("Elegí una zona.");
      return;
    }
    if (!Number.isInteger(frequencyDays) || frequencyDays < 1 || frequencyDays > 365) {
      setError("La frecuencia tiene que ser entre 1 y 365 días.");
      return;
    }
    if (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 240) {
      setError("La duración tiene que ser entre 1 y 240 minutos.");
      return;
    }
    const chosenWeekday = frequencyDays <= 1 || weekday === "" ? null : Number(weekday);
    if (task) {
      dispatch({
        type: "update-task",
        today,
        task: {
          ...task,
          name: cleanName,
          zoneId,
          frequencyDays,
          durationMin,
          priority,
          weekday: chosenWeekday,
        },
      });
    } else {
      const nextDue =
        startToday || frequencyDays <= 1
          ? today
          : findSlot({
              earliest: today,
              weekday: frequencyDays >= 7 ? chosenWeekday : chosenWeekday,
              durationMin,
              busy: busyFromTasks(data.tasks),
              flexDays: frequencyDays >= 28 ? 40 : 14,
            });
      dispatch({
        type: "add-task",
        task: {
          id: createId("tarea"),
          name: cleanName,
          zoneId,
          frequencyDays,
          durationMin,
          priority,
          weekday: chosenWeekday,
          nextDue,
          lastDone: null,
          postponeCount: 0,
          dirtLevel: 0,
        },
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {task ? "Cambiale el nombre, la zona o cada cuánto toca." : "Nombre, zona, cada cuántos días y cuánto lleva."}
          </DialogDescription>
        </DialogHeader>
        {confirmDelete && task ? (
          <div>
            <p className="text-sm text-muted">
              ¿Seguro que querés borrar «{task.name}»? El historial de lo ya hecho queda.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Volver
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  dispatch({ type: "delete-task", taskId: task.id });
                  onClose();
                }}
              >
                Borrar
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="tarea-nombre">Nombre</Label>
              <Input id="tarea-nombre" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tarea-zona">Zona</Label>
              <select id="tarea-zona" className={fieldClass} value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
                {data.zones
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.icon} {zone.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tarea-frecuencia">Cada cuántos días</Label>
                <Input
                  id="tarea-frecuencia"
                  inputMode="numeric"
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tarea-duracion">Minutos</Label>
                <Input id="tarea-duracion" inputMode="numeric" value={duration} onChange={(event) => setDuration(event.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["alta", "media", "baja"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPriority(item)}
                    className={`h-11 rounded-2xl border text-sm font-semibold capitalize ${
                      priority === item ? "border-cyan bg-cyan/15 text-cyan" : "border-white/10 bg-white/5"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tarea-dia">Día del plan</Label>
              <select
                id="tarea-dia"
                className={fieldClass}
                value={Number(frequency) <= 1 ? "" : weekday}
                disabled={Number(frequency) <= 1}
                onChange={(event) => setWeekday(event.target.value)}
              >
                <option value="">Sin día fijo</option>
                {PLAN_DAYS.map((day) => (
                  <option key={day.weekday} value={day.weekday}>
                    {day.label} · {day.theme}
                  </option>
                ))}
              </select>
              {Number(frequency) <= 1 && <p className="text-xs text-muted">Las diarias entran todos los días.</p>}
            </div>
            {!task && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={startToday} onChange={(event) => setStartToday(event.target.checked)} />
                Que aparezca hoy
              </label>
            )}
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {task ? (
                <Button variant="danger" type="button" onClick={() => setConfirmDelete(true)}>
                  Borrar
                </Button>
              ) : (
                <Button variant="ghost" type="button" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              <Button type="submit">{task ? "Guardar" : "Agregar"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
