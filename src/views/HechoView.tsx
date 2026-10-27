import { useState, type ReactNode } from "react";
import { duePhrase, formatLongDate, sentenceCase } from "../domain/dates.ts";
import { useStore } from "../state/store.tsx";

export function HechoView() {
  const { data, today } = useStore();
  const [zoneId, setZoneId] = useState("todas");
  const zones = data.zones.slice().sort((a, b) => a.order - b.order);
  const filtered = data.completions
    .filter((item) => zoneId === "todas" || item.zoneId === zoneId)
    .slice()
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const groups = new Map<string, typeof filtered>();
  for (const item of filtered) {
    const list = groups.get(item.date) ?? [];
    list.push(item);
    groups.set(item.date, list);
  }

  return (
    <div data-testid="view-hecho" className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Hecho</h1>
        <p className="mt-1 text-sm text-muted">Lo que fuiste cumpliendo, por fecha y por zona.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={zoneId === "todas"} onClick={() => setZoneId("todas")}>
          Todas
        </FilterChip>
        {zones.map((zone) => (
          <FilterChip key={zone.id} active={zoneId === zone.id} onClick={() => setZoneId(zone.id)}>
            {zone.icon} {zone.name}
          </FilterChip>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="glass rounded-[24px] px-5 py-8 text-center">
          <h2 className="font-display text-2xl">Todavía no hay nada en este filtro</h2>
          <p className="mt-2 text-sm text-muted">Cuando marques una tarea como hecha, queda acá.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {[...groups.entries()].map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-2 text-sm font-semibold text-cyan">
                {date === today ? "Hoy" : formatLongDate(date)}
                {date !== today ? ` · ${duePhrase(date, today)}` : ""}
              </h2>
              <ul className="glass divide-y divide-white/8 rounded-[24px]">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{sentenceCase(item.taskName)}</p>
                      <p className="text-xs text-muted">
                        {item.zoneName}
                        {item.onTime ? "" : " · tarde"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-lime">+{item.points}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium ${
        active ? "bg-cyan text-slate-950" : "bg-white/5 text-muted"
      }`}
    >
      {children}
    </button>
  );
}
