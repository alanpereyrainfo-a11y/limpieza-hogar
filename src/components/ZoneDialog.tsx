import { useState } from "react";
import { createId, slugify } from "../domain/ids.ts";
import type { Zone } from "../domain/types.ts";
import { useStore } from "../state/store.tsx";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

const ICONS = ["🛏️", "💻", "🛋️", "🍳", "🍽️", "🚽", "🚿", "🔥", "🌿", "🌱", "👕", "📦", "🐹", "🧽", "🪟", "🚪", "🧺", "✨"];
const COLORS = ["#c4b5fd", "#7dd3fc", "#f9a8d4", "#fdba74", "#fde68a", "#99f6e4", "#5eead4", "#fca5a5", "#86efac", "#bef264", "#93c5fd", "#f0abfc"];

export function ZoneDialog({
  open,
  zone,
  onClose,
}: {
  open: boolean;
  zone: Zone | null;
  onClose: () => void;
}) {
  const { data, dispatch } = useStore();
  const [name, setName] = useState(zone?.name ?? "");
  const [icon, setIcon] = useState(zone?.icon ?? "✨");
  const [accent, setAccent] = useState(zone?.accent ?? COLORS[0]);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const taskCount = zone ? data.tasks.filter((task) => task.zoneId === zone.id).length : 0;

  function submit() {
    const clean = name.trim();
    if (!clean) {
      setError("Poné un nombre.");
      return;
    }
    if (zone) {
      dispatch({
        type: "update-zone",
        zone: { ...zone, name: clean, phrase: clean === zone.name ? zone.phrase : clean.toLowerCase(), icon, accent },
      });
    } else {
      const order = data.zones.reduce((max, item) => Math.max(max, item.order), -1) + 1;
      const base = slugify(clean);
      const id = data.zones.some((item) => item.id === base) ? createId("zona") : base;
      dispatch({
        type: "add-zone",
        zone: { id, name: clean, phrase: clean.toLowerCase(), icon, accent, order },
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{zone ? "Editar zona" : "Nueva zona"}</DialogTitle>
          <DialogDescription>Una habitación, el quincho o lo que quieras seguir.</DialogDescription>
        </DialogHeader>
        {confirmDelete && zone ? (
          <div>
            {taskCount > 0 ? (
              <>
                <p className="text-sm text-muted">
                  {zone.name} tiene {taskCount} {taskCount === 1 ? "tarea" : "tareas"}. Primero movelas o borralas.
                </p>
                <Button className="mt-4" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Entendido
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">¿Seguro que querés borrar {zone.name}?</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Volver
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      dispatch({ type: "delete-zone", zoneId: zone.id });
                      onClose();
                    }}
                  >
                    Borrar
                  </Button>
                </div>
              </>
            )}
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
              <Label htmlFor="zona-nombre">Nombre</Label>
              <Input id="zona-nombre" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label>Ícono</Label>
              <div className="grid grid-cols-9 gap-1.5">
                {ICONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIcon(item)}
                    className={`h-10 rounded-xl text-lg ${icon === item ? "bg-cyan/20 ring-1 ring-cyan" : "bg-white/5"}`}
                    aria-label={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccent(color)}
                    className={`h-8 w-8 rounded-full ${accent === color ? "ring-2 ring-white" : ""}`}
                    style={{ background: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="grid grid-cols-2 gap-2">
              {zone ? (
                <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
                  Borrar
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              <Button type="submit">{zone ? "Guardar" : "Crear zona"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
