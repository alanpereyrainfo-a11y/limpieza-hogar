import { useEffect, useRef, useState } from "react";
import { downloadBackup, parseAppData } from "../domain/storage.ts";
import { todayIso } from "../domain/dates.ts";
import { useStore } from "../state/store.tsx";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog.tsx";

type InstallPrompt = Event & { prompt: () => Promise<void> };

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, today, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone =
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function onImport(file: File) {
    try {
      const parsed = parseAppData(JSON.parse(await file.text()) as unknown);
      dispatch({ type: "import", data: parsed, today });
      setError("");
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pude leer ese archivo.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setConfirmReset(false);
          setError("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustes</DialogTitle>
          <DialogDescription>Todo queda en este dispositivo. Si cambiás de celu, llevate el archivo.</DialogDescription>
        </DialogHeader>
        {confirmReset ? (
          <div>
            <p className="text-sm text-muted">
              Esto borra tus tareas, el historial y los puntos de este dispositivo, y vuelve a la casa de ejemplo.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  dispatch({ type: "reset", today });
                  onClose();
                }}
              >
                Volver al inicio
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => downloadBackup(data, `limpieza-hogar-${todayIso()}.json`)}
            >
              Exportar JSON
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => fileRef.current?.click()}>
              Importar JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onImport(file);
                event.target.value = "";
              }}
            />
            {!standalone && install && (
              <Button
                className="w-full"
                onClick={() => {
                  void install.prompt();
                  setInstall(null);
                }}
              >
                Instalar la app
              </Button>
            )}
            {!standalone && ios && (
              <p className="text-sm text-muted">En el iPhone: Compartir y después «Agregar a inicio».</p>
            )}
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
              Volver a los datos iniciales
            </Button>
            <p className="pt-2 text-xs leading-relaxed text-muted">
              Limpieza del hogar para Alan Pereyra. Mapi es un mapache original, dibujado para esta app. No hay
              servidor: los datos viven en el navegador.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
