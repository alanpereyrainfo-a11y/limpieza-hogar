import { zoneCleanliness } from "./cleanliness.ts";
import { diffDays, isArgentineSummer, weekdayIndex } from "./dates.ts";
import { planDay } from "./plan.ts";
import type { AppData } from "./types.ts";

export type Suggestion = {
  id: string;
  tone: "alerta" | "tip" | "plan";
  title: string;
  body: string;
  zoneId?: string;
};

const PRODUCT_TIPS: Array<{ id: string; match: RegExp; title: string; body: string }> = [
  {
    id: "vidrios",
    match: /vidrio/i,
    title: "Vidrios sin rayas",
    body: "Diario y un chorrito de vinagre blanco. No los limpies al sol, que secan antes y quedan marcas.",
  },
  {
    id: "pantallas",
    match: /pantalla|teclado|polvo/i,
    title: "Pantallas y polvo",
    body: "Microfibra seca para el monitor y el teclado. El alcohol se come el antirreflejo.",
  },
  {
    id: "bano",
    match: /inodoro|ducha|azulejo|junta|mampara/i,
    title: "Baño sin drama",
    body: "Bicarbonato y vinagre en el inodoro, dejalo actuar y después cepillá. En las juntas, la misma pasta.",
  },
  {
    id: "horno",
    match: /horno|anafe|mesada|campana|grasa/i,
    title: "Grasa de cocina",
    body: "Agua caliente y detergente. Si está pegada, bicarbonato. El horno sale con vapor, sin aerosoles fuertes.",
  },
  {
    id: "parrilla",
    match: /parrilla/i,
    title: "Parrilla en caliente",
    body: "Cepillala apenas terminás de usarla, todavía caliente. Fría es el doble de trabajo. El plan la pone cada 14 días por si no la marcaste.",
  },
  {
    id: "uvita",
    match: /viruta|jaula|comedero/i,
    title: "Uvita",
    body: "Viruta de papel o pellets, nunca cedro ni pino. El comedero se lava todos los días. Si hace calor, no estires la jaula a más de 4.",
  },
  {
    id: "piso",
    match: /trapear|barrer|baldear/i,
    title: "Pisos",
    body: "Primero barré y después trapeá. Si no, el trapo arrastra tierra y queda peor.",
  },
  {
    id: "lavarropas",
    match: /lavarropas|ropa/i,
    title: "Lavarropas",
    body: "Una vez por mes, un ciclo vacío caliente con bicarbonato o vinagre saca el olor a humedad.",
  },
];

function tipFor(names: string[], day: number): { id: string; title: string; body: string } | null {
  const matches = PRODUCT_TIPS.filter((tip) => names.some((name) => tip.match.test(name)));
  if (matches.length === 0) return null;
  return matches[day % matches.length] ?? null;
}

export function buildSuggestions(data: AppData, today: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const zones = new Map(data.zones.map((zone) => [zone.id, zone]));
  const overdue = data.tasks.filter((task) => task.nextDue < today);
  const dueToday = data.tasks.filter((task) => task.nextDue === today);
  const soon = data.tasks.filter((task) => {
    const delta = diffDays(today, task.nextDue);
    return delta >= 0 && delta <= 2;
  });

  const theme = planDay(weekdayIndex(today));
  suggestions.push({
    id: `plan-${theme.weekday}`,
    tone: "plan",
    title: `Hoy toca: ${theme.theme.toLowerCase()}`,
    body: `${theme.detail} Las diarias siguen igual, encima de eso.`,
  });

  if (overdue.length >= 4) {
    const shortest = [...overdue].sort((a, b) => a.durationMin - b.durationMin)[0];
    suggestions.push({
      id: "vencidas",
      tone: "alerta",
      title: `Se te juntaron ${overdue.length} vencidas`,
      body: shortest
        ? `Empezá por la más corta: «${shortest.name}», unos ${shortest.durationMin} min. Después el resto pesa menos.`
        : "Empezá por la más corta para destrabar el día.",
    });
  }

  const groups = new Map<string, typeof dueToday>();
  for (const task of [...overdue, ...dueToday]) {
    const list = groups.get(task.zoneId) ?? [];
    list.push(task);
    groups.set(task.zoneId, list);
  }
  const grouped = [...groups.entries()]
    .filter(([, tasks]) => tasks.length >= 3)
    .sort((a, b) => b[1].length - a[1].length);
  for (const [zoneId, tasks] of grouped.slice(0, 2)) {
    const zone = zones.get(zoneId);
    if (!zone) continue;
    const minutes = tasks.reduce((total, task) => total + task.durationMin, 0);
    suggestions.push({
      id: `grupo-${zoneId}`,
      tone: "plan",
      title: `Aprovechá ${zone.phrase}`,
      body: `Tenés ${tasks.length} cosas juntas. Si las hacés de una, son unos ${minutes} min.`,
      zoneId,
    });
  }

  const stale = data.tasks
    .map((task) => {
      const late = Math.max(0, diffDays(task.nextDue, today));
      const daysWithout = task.lastDone
        ? diffDays(task.lastDone, today)
        : task.frequencyDays + late;
      return { task, late, daysWithout };
    })
    .filter(({ task, late, daysWithout }) => late >= 3 || daysWithout >= task.frequencyDays + 3)
    .sort((a, b) => b.late - a.late || b.daysWithout - a.daysWithout)
    .slice(0, 3);

  for (const { task, daysWithout } of stale) {
    const zone = zones.get(task.zoneId);
    if (!zone) continue;
    const phrase = zone.phrase.charAt(0).toUpperCase() + zone.phrase.slice(1);
    suggestions.push({
      id: `stale-${task.id}`,
      tone: "alerta",
      title: `${zone.name} pide atención`,
      body: `${phrase} lleva ${daysWithout} ${daysWithout === 1 ? "día" : "días"} sin ${task.name}.`,
      zoneId: zone.id,
    });
  }

  const names = soon.map((task) => task.name);
  const day = Number(today.slice(8, 10));
  const tip = tipFor(names, day) ?? {
    id: "general",
    title: "Lo básico alcanza",
    body: "Microfibra, un balde y detergente neutro cubren casi toda la casa. El resto es constancia.",
  };
  suggestions.push({ id: `tip-${tip.id}`, tone: "tip", title: tip.title, body: tip.body });

  const watering = data.tasks.find((task) => task.zoneId === "jardin" && task.name === "regar");
  if (watering && isArgentineSummer(today) && watering.frequencyDays > 1) {
    suggestions.push({
      id: "verano",
      tone: "tip",
      title: "En verano, el jardín todos los días",
      body: "De diciembre a febrero conviene regar cada 1 día, temprano o al atardecer. Ahora está en cada " +
        `${watering.frequencyDays}.`,
      zoneId: "jardin",
    });
  }
  if (watering && !isArgentineSummer(today) && monthIndexSafe(today) === 3 && watering.frequencyDays === 1) {
    suggestions.push({
      id: "post-verano",
      tone: "tip",
      title: "Ya pasó el calor fuerte",
      body: "En marzo podés volver a regar cada 2 días, salvo que venga una ola de calor.",
      zoneId: "jardin",
    });
  }

  const dirt = data.tasks.reduce((total, task) => total + task.dirtLevel, 0);
  if (dirt >= 3) {
    suggestions.push({
      id: "mapi-sucio",
      tone: "alerta",
      title: "Mapi está lleno de polvo",
      body: "Cada posposición le suma mugre. Una tarea corta lo deja mejor y te saca deuda de encima.",
    });
  }

  const worst = [...data.zones]
    .map((zone) => ({
      zone,
      score: zoneCleanliness(
        data.tasks.filter((task) => task.zoneId === zone.id),
        today,
      ),
    }))
    .filter(({ zone }) => data.tasks.some((task) => task.zoneId === zone.id))
    .sort((a, b) => a.score - b.score)[0];
  if (worst && worst.score < 45) {
    suggestions.push({
      id: `zona-${worst.zone.id}`,
      tone: "alerta",
      title: `${worst.zone.name} está en ${worst.score}%`,
      body: "Es la zona que más se vino abajo. Con una o dos tareas de ahí se nota.",
      zoneId: worst.zone.id,
    });
  }

  const parrilla = data.tasks.find((task) => task.id === "quincho-parrilla");
  if (parrilla && diffDays(today, parrilla.nextDue) <= 2 && diffDays(today, parrilla.nextDue) >= 0) {
    suggestions.push({
      id: "parrilla-uso",
      tone: "tip",
      title: "Si usaste la parrilla, no esperes",
      body: "El plan la pone cada 14 días, pero si hubo asado se limpia al terminar. Marcála hecha cuando la hagas.",
      zoneId: "quincho",
    });
  }

  return dedupe(suggestions).slice(0, 6);
}

function monthIndexSafe(iso: string): number {
  return Number(iso.slice(5, 7));
}

function dedupe(suggestions: Suggestion[]): Suggestion[] {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    if (seen.has(suggestion.id)) return false;
    seen.add(suggestion.id);
    return true;
  });
}
