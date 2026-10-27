/** Cupo del trabajo de fondo (todo lo que no es diaria). Las diarias van aparte. */
export const MAX_DEEP_MINUTES = 60;

export type PlanDay = {
  weekday: number;
  label: string;
  short: string;
  theme: string;
  detail: string;
};

export const PLAN_DAYS: PlanDay[] = [
  {
    weekday: 1,
    label: "Lunes",
    short: "Lun",
    theme: "Baños y toilet",
    detail: "Inodoro, lavatorio, ducha y piso.",
  },
  {
    weekday: 2,
    label: "Martes",
    short: "Mar",
    theme: "Cocina profunda",
    detail: "Trapear, microondas y lo que se junta en la mesada.",
  },
  {
    weekday: 3,
    label: "Miércoles",
    short: "Mié",
    theme: "Living y comedor",
    detail: "Orden, polvo y pisos de donde te sentás.",
  },
  {
    weekday: 4,
    label: "Jueves",
    short: "Jue",
    theme: "Habitación y estudio",
    detail: "Sábanas, polvo y el escritorio.",
  },
  {
    weekday: 5,
    label: "Viernes",
    short: "Vie",
    theme: "Lavadero y ropa",
    detail: "Lavar, doblar y dejar el lavadero respirable.",
  },
  {
    weekday: 6,
    label: "Sábado",
    short: "Sáb",
    theme: "Exterior",
    detail: "Patio, quincho y jardín.",
  },
  {
    weekday: 0,
    label: "Domingo",
    short: "Dom",
    theme: "Liviano y vencidas",
    detail: "Descanso, Uvita y un repaso de lo que quedó.",
  },
];

export const ZONE_WEEKDAY: Record<string, number> = {
  toilet: 1,
  bano: 1,
  cocina: 2,
  living: 3,
  comedor: 3,
  habitacion: 4,
  estudio: 4,
  lavadero: 5,
  quincho: 6,
  patio: 6,
  jardin: 6,
  deposito: 0,
  mascota: 0,
};

export function planDay(weekday: number): PlanDay {
  const day = PLAN_DAYS.find((item) => item.weekday === weekday);
  if (!day) throw new Error(`Día inválido: ${weekday}`);
  return day;
}
