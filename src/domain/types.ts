export type Priority = "baja" | "media" | "alta";

export type Zone = {
  id: string;
  name: string;
  /** Nombre con artículo, para frases: "el quincho". */
  phrase: string;
  icon: string;
  accent: string;
  order: number;
};

export type Task = {
  id: string;
  zoneId: string;
  name: string;
  frequencyDays: number;
  durationMin: number;
  priority: Priority;
  /** 0 domingo … 6 sábado. Null en las diarias. */
  weekday: number | null;
  nextDue: string;
  lastDone: string | null;
  postponeCount: number;
  dirtLevel: number;
};

export type Completion = {
  id: string;
  taskId: string;
  taskName: string;
  zoneId: string;
  zoneName: string;
  date: string;
  at: string;
  onTime: boolean;
  points: number;
};

export type AppData = {
  version: 1;
  zones: Zone[];
  tasks: Task[];
  completions: Completion[];
  points: number;
  streak: number;
  lastStreakDate: string | null;
};

export type Mood = "feliz" | "preocupado" | "sucio";

export const DATA_VERSION = 1;
export const STORAGE_KEY = "limpieza-hogar.v1";
