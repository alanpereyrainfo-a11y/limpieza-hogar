import { addDays } from "./dates.ts";
import { ZONE_WEEKDAY } from "./plan.ts";
import { scheduleBlueprints, type Blueprint } from "./schedule.ts";
import { completionPoints } from "./scoring.ts";
import type { AppData, Completion, Priority, Task, Zone } from "./types.ts";
import { slugify } from "./ids.ts";

export const ZONES: Zone[] = [
  { id: "habitacion", name: "Habitación", phrase: "la habitación", icon: "🛏️", accent: "#c4b5fd", order: 0 },
  { id: "estudio", name: "Estudio", phrase: "el estudio", icon: "💻", accent: "#7dd3fc", order: 1 },
  { id: "living", name: "Living", phrase: "el living", icon: "🛋️", accent: "#f9a8d4", order: 2 },
  { id: "cocina", name: "Cocina", phrase: "la cocina", icon: "🍳", accent: "#fdba74", order: 3 },
  { id: "comedor", name: "Comedor", phrase: "el comedor", icon: "🍽️", accent: "#fde68a", order: 4 },
  { id: "toilet", name: "Toilet", phrase: "el toilet", icon: "🚽", accent: "#99f6e4", order: 5 },
  { id: "bano", name: "Baño principal", phrase: "el baño principal", icon: "🚿", accent: "#5eead4", order: 6 },
  { id: "quincho", name: "Quincho", phrase: "el quincho", icon: "🔥", accent: "#fca5a5", order: 7 },
  { id: "patio", name: "Patio", phrase: "el patio", icon: "🌿", accent: "#86efac", order: 8 },
  { id: "jardin", name: "Jardín", phrase: "el jardín", icon: "🌱", accent: "#bef264", order: 9 },
  { id: "lavadero", name: "Lavadero", phrase: "el lavadero", icon: "👕", accent: "#93c5fd", order: 10 },
  { id: "deposito", name: "Depósito", phrase: "el depósito", icon: "📦", accent: "#d6d3d1", order: 11 },
  { id: "mascota", name: "Uvita", phrase: "la jaula de Uvita", icon: "🐹", accent: "#f0abfc", order: 12 },
];

type Draft = {
  zoneId: string;
  name: string;
  frequencyDays: number;
  durationMin: number;
  priority: Priority;
};

const DRAFTS: Draft[] = [
  { zoneId: "habitacion", name: "hacer la cama", frequencyDays: 1, durationMin: 5, priority: "alta" },
  { zoneId: "habitacion", name: "ordenar", frequencyDays: 2, durationMin: 10, priority: "media" },
  { zoneId: "habitacion", name: "cambiar sábanas", frequencyDays: 7, durationMin: 12, priority: "media" },
  { zoneId: "habitacion", name: "aspirar/barrer", frequencyDays: 7, durationMin: 10, priority: "media" },
  { zoneId: "habitacion", name: "repasar polvo", frequencyDays: 7, durationMin: 8, priority: "media" },
  { zoneId: "habitacion", name: "limpiar vidrios", frequencyDays: 30, durationMin: 15, priority: "baja" },
  { zoneId: "habitacion", name: "ordenar placard", frequencyDays: 90, durationMin: 40, priority: "baja" },
  { zoneId: "habitacion", name: "dar vuelta el colchón", frequencyDays: 90, durationMin: 15, priority: "baja" },

  { zoneId: "estudio", name: "ordenar escritorio", frequencyDays: 3, durationMin: 10, priority: "media" },
  { zoneId: "estudio", name: "polvo y limpiar pantallas/teclado", frequencyDays: 7, durationMin: 10, priority: "media" },
  { zoneId: "estudio", name: "barrer/aspirar", frequencyDays: 7, durationMin: 8, priority: "media" },
  { zoneId: "estudio", name: "vaciar papelera", frequencyDays: 7, durationMin: 3, priority: "baja" },

  { zoneId: "living", name: "ordenar", frequencyDays: 2, durationMin: 10, priority: "media" },
  { zoneId: "living", name: "polvo", frequencyDays: 7, durationMin: 10, priority: "media" },
  { zoneId: "living", name: "aspirar/barrer", frequencyDays: 7, durationMin: 12, priority: "media" },
  { zoneId: "living", name: "aspirar sillones", frequencyDays: 14, durationMin: 15, priority: "media" },
  { zoneId: "living", name: "vidrios", frequencyDays: 30, durationMin: 15, priority: "baja" },
  { zoneId: "living", name: "lavar fundas/cortinas", frequencyDays: 90, durationMin: 40, priority: "baja" },

  { zoneId: "cocina", name: "lavar platos", frequencyDays: 1, durationMin: 10, priority: "alta" },
  { zoneId: "cocina", name: "limpiar mesada y anafe", frequencyDays: 1, durationMin: 8, priority: "alta" },
  { zoneId: "cocina", name: "sacar basura", frequencyDays: 1, durationMin: 4, priority: "alta" },
  { zoneId: "cocina", name: "barrer", frequencyDays: 2, durationMin: 8, priority: "media" },
  { zoneId: "cocina", name: "trapear", frequencyDays: 7, durationMin: 12, priority: "media" },
  { zoneId: "cocina", name: "microondas", frequencyDays: 7, durationMin: 8, priority: "media" },
  { zoneId: "cocina", name: "heladera por dentro", frequencyDays: 30, durationMin: 25, priority: "media" },
  { zoneId: "cocina", name: "horno", frequencyDays: 30, durationMin: 25, priority: "media" },
  { zoneId: "cocina", name: "azulejos", frequencyDays: 30, durationMin: 20, priority: "baja" },
  { zoneId: "cocina", name: "alacenas", frequencyDays: 90, durationMin: 30, priority: "baja" },
  { zoneId: "cocina", name: "campana/filtro", frequencyDays: 90, durationMin: 20, priority: "baja" },

  { zoneId: "comedor", name: "limpiar mesa", frequencyDays: 1, durationMin: 5, priority: "alta" },
  { zoneId: "comedor", name: "barrer", frequencyDays: 3, durationMin: 8, priority: "media" },
  { zoneId: "comedor", name: "trapear", frequencyDays: 7, durationMin: 10, priority: "media" },
  { zoneId: "comedor", name: "sillas", frequencyDays: 14, durationMin: 12, priority: "baja" },

  { zoneId: "toilet", name: "inodoro", frequencyDays: 3, durationMin: 8, priority: "alta" },
  { zoneId: "toilet", name: "lavatorio y espejo", frequencyDays: 3, durationMin: 8, priority: "alta" },
  { zoneId: "toilet", name: "trapear", frequencyDays: 7, durationMin: 8, priority: "media" },
  { zoneId: "toilet", name: "reponer papel", frequencyDays: 7, durationMin: 3, priority: "media" },

  { zoneId: "bano", name: "lavatorio y espejo", frequencyDays: 3, durationMin: 8, priority: "alta" },
  { zoneId: "bano", name: "inodoro", frequencyDays: 3, durationMin: 8, priority: "alta" },
  { zoneId: "bano", name: "ducha/bañera", frequencyDays: 7, durationMin: 15, priority: "alta" },
  { zoneId: "bano", name: "trapear", frequencyDays: 7, durationMin: 8, priority: "media" },
  { zoneId: "bano", name: "cambiar toallas", frequencyDays: 4, durationMin: 5, priority: "media" },
  { zoneId: "bano", name: "azulejos y juntas", frequencyDays: 30, durationMin: 20, priority: "media" },
  { zoneId: "bano", name: "cortina/mampara", frequencyDays: 30, durationMin: 12, priority: "baja" },
  { zoneId: "bano", name: "desagües", frequencyDays: 30, durationMin: 10, priority: "media" },

  { zoneId: "quincho", name: "barrer", frequencyDays: 7, durationMin: 10, priority: "media" },
  { zoneId: "quincho", name: "limpiar mesa y sillas", frequencyDays: 14, durationMin: 12, priority: "media" },
  { zoneId: "quincho", name: "parrilla", frequencyDays: 14, durationMin: 20, priority: "alta" },
  { zoneId: "quincho", name: "telarañas", frequencyDays: 30, durationMin: 12, priority: "baja" },

  { zoneId: "patio", name: "barrer", frequencyDays: 7, durationMin: 12, priority: "media" },
  { zoneId: "patio", name: "baldear", frequencyDays: 14, durationMin: 15, priority: "media" },
  { zoneId: "patio", name: "limpiar desagües", frequencyDays: 30, durationMin: 12, priority: "media" },

  { zoneId: "jardin", name: "regar", frequencyDays: 2, durationMin: 10, priority: "alta" },
  { zoneId: "jardin", name: "cortar pasto", frequencyDays: 14, durationMin: 30, priority: "media" },
  { zoneId: "jardin", name: "sacar maleza", frequencyDays: 14, durationMin: 20, priority: "media" },
  { zoneId: "jardin", name: "juntar hojas", frequencyDays: 7, durationMin: 12, priority: "media" },
  { zoneId: "jardin", name: "podar", frequencyDays: 90, durationMin: 40, priority: "baja" },

  { zoneId: "lavadero", name: "lavar ropa", frequencyDays: 3, durationMin: 15, priority: "alta" },
  { zoneId: "lavadero", name: "doblar y guardar", frequencyDays: 3, durationMin: 12, priority: "media" },
  { zoneId: "lavadero", name: "limpiar lavarropas/filtro", frequencyDays: 30, durationMin: 15, priority: "media" },
  { zoneId: "lavadero", name: "barrer y trapear", frequencyDays: 7, durationMin: 10, priority: "media" },

  { zoneId: "deposito", name: "barrer", frequencyDays: 30, durationMin: 15, priority: "baja" },
  { zoneId: "deposito", name: "ordenar", frequencyDays: 30, durationMin: 25, priority: "media" },
  { zoneId: "deposito", name: "revisar humedad/plagas", frequencyDays: 60, durationMin: 10, priority: "alta" },
  { zoneId: "deposito", name: "descartar lo que no se usa", frequencyDays: 180, durationMin: 30, priority: "baja" },

  { zoneId: "mascota", name: "limpiar comedero/bebedero", frequencyDays: 1, durationMin: 5, priority: "alta" },
  { zoneId: "mascota", name: "cambiar viruta/jaula", frequencyDays: 4, durationMin: 15, priority: "alta" },
  { zoneId: "mascota", name: "limpieza profunda de jaula", frequencyDays: 7, durationMin: 20, priority: "alta" },
];

export function blueprintsFromDrafts(): Blueprint[] {
  return DRAFTS.map((draft) => ({
    id: `${draft.zoneId}-${slugify(draft.name)}`,
    zoneId: draft.zoneId,
    name: draft.name,
    frequencyDays: draft.frequencyDays,
    durationMin: draft.durationMin,
    priority: draft.priority,
    weekday: draft.frequencyDays <= 1 ? null : (ZONE_WEEKDAY[draft.zoneId] ?? null),
  }));
}

export const BLUEPRINTS: Blueprint[] = blueprintsFromDrafts();

function seedCompletions(tasks: Task[], zones: Zone[], today: string): { completions: Completion[]; points: number } {
  const names = new Map(zones.map((zone) => [zone.id, zone.name]));
  const completions: Completion[] = [];
  let points = 0;
  const dailies = tasks.filter((task) => task.frequencyDays <= 1);
  for (let ago = 4; ago >= 1; ago -= 1) {
    const date = addDays(today, -ago);
    dailies.forEach((task, index) => {
      const gained = completionPoints(task.priority, true);
      points += gained;
      completions.push({
        id: `seed-${task.id}-${date}`,
        taskId: task.id,
        taskName: task.name,
        zoneId: task.zoneId,
        zoneName: names.get(task.zoneId) ?? "Zona",
        date,
        at: `${date}T09:${String(index).padStart(2, "0")}:00`,
        onTime: true,
        points: gained,
      });
    });
  }
  return { completions, points };
}

export function buildInitialState(today: string): AppData {
  const tasks = scheduleBlueprints(BLUEPRINTS, today);
  const { completions, points } = seedCompletions(tasks, ZONES, today);
  return {
    version: 1,
    zones: ZONES.map((zone) => ({ ...zone })),
    tasks,
    completions,
    points,
    streak: 4,
    lastStreakDate: addDays(today, -1),
  };
}
