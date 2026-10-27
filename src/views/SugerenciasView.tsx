import { buildSuggestions } from "../domain/suggestions.ts";
import { mapiLine, mapiMood } from "../domain/mood.ts";
import { Mapi } from "../components/Mapi.tsx";
import { Button } from "../components/ui/button.tsx";
import { useStore } from "../state/store.tsx";

export function SugerenciasView({ onOpenZone }: { onOpenZone: (zoneId: string) => void }) {
  const { data, today, dispatch } = useStore();
  const suggestions = buildSuggestions(data, today);
  const overdue = data.tasks.filter((task) => task.nextDue < today).length;
  const mood = mapiMood(data.tasks, today);

  function applyWatering(days: number) {
    const task = data.tasks.find((item) => item.zoneId === "jardin" && item.name === "regar");
    if (!task) return;
    dispatch({ type: "update-task", today, task: { ...task, frequencyDays: days } });
  }

  return (
    <div data-testid="view-sugerencias" className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Sugerencias</h1>
        <p className="mt-1 text-sm text-muted">Qué conviene juntar, qué se está viniendo abajo y algún tip.</p>
      </div>
      <section className="rim flex items-center gap-3 rounded-[28px] p-4">
        <Mapi mood={mood} className="h-28 w-28 shrink-0" />
        <p className="text-sm leading-relaxed">{mapiLine(mood, overdue, data.streak)}</p>
      </section>
      {suggestions.length === 0 ? (
        <div className="glass rounded-[24px] px-5 py-8 text-center">
          <h2 className="font-display text-2xl">Mapi está tranquilo</h2>
          <p className="mt-2 text-sm text-muted">Por ahora no hay nada para sugerir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <article key={suggestion.id} className="glass rounded-[24px] p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-cyan uppercase">
                {suggestion.tone === "alerta" ? "Ojo" : suggestion.tone === "plan" ? "Plan" : "Tip"}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">{suggestion.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{suggestion.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestion.zoneId ? (
                  <Button size="sm" variant="ghost" onClick={() => onOpenZone(suggestion.zoneId ?? "")}>
                    Ver la zona
                  </Button>
                ) : null}
                {suggestion.id === "verano" && (
                  <Button size="sm" onClick={() => applyWatering(1)}>
                    Regar todos los días
                  </Button>
                )}
                {suggestion.id === "post-verano" && (
                  <Button size="sm" variant="ghost" onClick={() => applyWatering(2)}>
                    Volver a cada 2 días
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
