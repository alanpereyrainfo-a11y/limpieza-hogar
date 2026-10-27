import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarClock, CalendarDays, CheckCheck, Flame, LayoutGrid, Plus, Settings, Sparkles, Star, Sun } from "lucide-react";
import { PostponeDialog } from "./components/PostponeDialog.tsx";
import { SettingsDialog } from "./components/SettingsDialog.tsx";
import { TaskDialog } from "./components/TaskDialog.tsx";
import { ZoneDialog } from "./components/ZoneDialog.tsx";
import { Button } from "./components/ui/button.tsx";
import { createId } from "./domain/ids.ts";
import { postponePenalty } from "./domain/postpone.ts";
import { completionPoints } from "./domain/scoring.ts";
import type { Task, Zone } from "./domain/types.ts";
import { useStore } from "./state/store.tsx";
import { HechoView } from "./views/HechoView.tsx";
import { HoyView } from "./views/HoyView.tsx";
import { PlanView } from "./views/PlanView.tsx";
import { ProximasView } from "./views/ProximasView.tsx";
import { SugerenciasView } from "./views/SugerenciasView.tsx";
import { ZonasView } from "./views/ZonasView.tsx";

const NAV = [
  { id: "hoy", label: "Hoy", short: "Hoy", icon: Sun },
  { id: "proximas", label: "Próximas", short: "Próximas", icon: CalendarClock },
  { id: "hecho", label: "Hecho", short: "Hecho", icon: CheckCheck },
  { id: "zonas", label: "Zonas", short: "Zonas", icon: LayoutGrid },
  { id: "plan", label: "Plan", short: "Plan", icon: CalendarDays },
  { id: "sugerencias", label: "Sugerencias", short: "Tips", icon: Sparkles },
] as const;

type ViewId = (typeof NAV)[number]["id"];

function isView(value: string): value is ViewId {
  return NAV.some((item) => item.id === value);
}

function readHash(): ViewId {
  const value = window.location.hash.replace(/^#\/?/, "");
  return isView(value) ? value : "hoy";
}

export function Shell() {
  const { data, today, undo, pulse, saveError, dispatch, undoLast } = useStore();
  const reduce = useReducedMotion();
  const [view, setView] = useState<ViewId>(readHash);
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskEditor, setTaskEditor] = useState<{ task: Task | null; zoneId?: string } | null>(null);
  const [zoneEditor, setZoneEditor] = useState<Zone | null | "new">(null);
  const [postponeTask, setPostponeTask] = useState<Task | null>(null);

  useEffect(() => {
    const onHash = () => setView(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [view, reduce]);

  function go(next: ViewId, zoneId?: string) {
    setView(next);
    setFocusZoneId(zoneId ?? null);
    const hash = `#/${next}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
  }

  function complete(task: Task) {
    const points = completionPoints(task.priority, task.nextDue >= today);
    dispatch(
      {
        type: "complete",
        taskId: task.id,
        today,
        at: new Date().toISOString(),
        id: createId("hecho"),
      },
      `Listo: ${task.name} · +${points} pts`,
    );
  }

  const mark = `${import.meta.env.BASE_URL}favicon.svg`;

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-white/10 bg-[#07060f]/80 p-4 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-3 px-2 py-2">
          <img src={mark} alt="" className="h-11 w-11 rounded-2xl" />
          <div>
            <p className="font-display text-lg leading-none font-extrabold">Limpieza</p>
            <p className="mt-1 text-xs text-muted">con Mapi</p>
          </div>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Secciones">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
                aria-current={active ? "page" : undefined}
                onClick={() => go(item.id)}
                className={`flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold ${
                  active ? "bg-cyan/15 text-cyan" : "text-muted hover:bg-white/5 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="glass rounded-3xl p-4">
          <Stat streak={data.streak} points={data.points} pulse={pulse} />
          <Button className="mt-3 w-full" variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            Ajustes
          </Button>
        </div>
      </aside>

      <div className="md:pl-[240px]">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-[#07060f]/75 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <img src={mark} alt="" className="h-9 w-9 rounded-xl" />
            <span className="font-display text-lg font-extrabold">Limpieza</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-muted">Tu casa, al día</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Stat streak={data.streak} points={data.points} pulse={pulse} />
            </div>
            <Button size="icon" variant="ghost" aria-label="Nueva tarea" onClick={() => setTaskEditor({ task: null })}>
              <Plus className="h-5 w-5" />
            </Button>
            <Button className="md:hidden" size="icon" variant="ghost" aria-label="Ajustes" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {saveError && (
          <p className="mx-4 mt-3 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger md:mx-8">
            No pude guardar. El almacenamiento del navegador puede estar lleno.
          </p>
        )}

        <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-28 md:px-8 md:pt-8 md:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {view === "hoy" && <HoyView onEdit={(task) => setTaskEditor({ task })} onPostpone={setPostponeTask} onDone={complete} />}
              {view === "proximas" && (
                <ProximasView onEdit={(task) => setTaskEditor({ task })} onPostpone={setPostponeTask} onDone={complete} />
              )}
              {view === "hecho" && <HechoView />}
              {view === "zonas" && (
                <ZonasView
                  focusZoneId={focusZoneId}
                  onEditZone={(zone) => setZoneEditor(zone)}
                  onCreateZone={() => setZoneEditor("new")}
                  onEditTask={(task) => setTaskEditor({ task })}
                  onCreateTask={(zoneId) => setTaskEditor({ task: null, zoneId })}
                />
              )}
              {view === "plan" && <PlanView onEdit={(task) => setTaskEditor({ task })} />}
              {view === "sugerencias" && <SugerenciasView onOpenZone={(zoneId) => go("zonas", zoneId)} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07060f]/85 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Secciones"
      >
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
                aria-current={active ? "page" : undefined}
                onClick={() => go(item.id)}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
                  active ? "text-cyan" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.short}
              </button>
            );
          })}
        </div>
      </nav>

      {undo && (
        <div className="fixed inset-x-4 bottom-24 z-40 md:right-6 md:bottom-6 md:left-auto md:w-96" role="status">
          <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
            <p className="text-sm">{undo.label}</p>
            <Button size="sm" onClick={undoLast}>
              Deshacer
            </Button>
          </div>
        </div>
      )}

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {taskEditor && (
        <TaskDialog
          key={taskEditor.task?.id ?? `new-${taskEditor.zoneId ?? "libre"}`}
          open
          task={taskEditor.task}
          defaultZoneId={taskEditor.zoneId}
          onClose={() => setTaskEditor(null)}
        />
      )}
      {zoneEditor && (
        <ZoneDialog
          key={zoneEditor === "new" ? "new-zone" : zoneEditor.id}
          open
          zone={zoneEditor === "new" ? null : zoneEditor}
          onClose={() => setZoneEditor(null)}
        />
      )}
      {postponeTask && (
        <PostponeDialog
          key={`${postponeTask.id}-${postponeTask.postponeCount}`}
          task={postponeTask}
          today={today}
          onClose={() => setPostponeTask(null)}
          onConfirm={(days) => {
            dispatch(
              { type: "postpone", taskId: postponeTask.id, days, today },
              `Pospusiste «${postponeTask.name}» · −${postponePenalty(days)} pts`,
            );
            setPostponeTask(null);
          }}
        />
      )}
    </div>
  );
}

function Stat({ streak, points, pulse }: { streak: number; points: number; pulse: number }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <span className="inline-flex items-center gap-1 text-amber">
        <Flame className="h-4 w-4" />
        <span className="tabular-nums">{streak}</span>
      </span>
      <motion.span key={pulse} className="inline-flex items-center gap-1 text-cyan" animate={{ scale: [1, 1.12, 1] }}>
        <Star className="h-4 w-4" />
        <span className="tabular-nums">{points}</span>
      </motion.span>
    </div>
  );
}
