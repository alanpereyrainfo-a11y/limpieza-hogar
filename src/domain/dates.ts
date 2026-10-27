const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function parseIsoDate(iso: string): Date {
  const match = ISO_DATE.exec(iso);
  if (!match || !isIsoDate(iso)) {
    throw new Error(`Fecha inválida: ${iso}`);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso(now = new Date()): string {
  return formatIsoDate(now);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

/** Días desde `from` hasta `to`. Positivo si `to` es posterior. */
export function diffDays(from: string, to: string): number {
  const start = parseIsoDate(from).getTime();
  const end = parseIsoDate(to).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function weekdayIndex(iso: string): number {
  return parseIsoDate(iso).getDay();
}

export function nextWeekday(today: string, weekday: number): string {
  const delta = (weekday - weekdayIndex(today) + 7) % 7;
  return addDays(today, delta);
}

export function monthIndex(iso: string): number {
  return Number(iso.slice(5, 7));
}

/** Verano argentino: diciembre, enero y febrero. */
export function isArgentineSummer(iso: string): boolean {
  const month = monthIndex(iso);
  return month === 12 || month === 1 || month === 2;
}

export function duePhrase(due: string, today: string): string {
  const delta = diffDays(today, due);
  if (delta > 1) return `en ${delta} días`;
  if (delta === 1) return "mañana";
  if (delta === 0) return "hoy";
  if (delta === -1) return "ayer";
  return `hace ${-delta} días`;
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function sentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("es-AR") + value.slice(1);
}

export function formatLongDate(iso: string): string {
  const date = parseIsoDate(iso);
  const weekday = WEEKDAYS[date.getDay()] ?? "";
  const month = MONTHS[date.getMonth()] ?? "";
  return `${sentenceCase(weekday)}, ${date.getDate()} de ${month}`;
}

export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  const short = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][date.getDay()] ?? "";
  const month = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][date.getMonth()] ?? "";
  return `${short} ${date.getDate()} ${month}`;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Buen día";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function formatMinutes(total: number): string {
  const minutes = Math.max(0, Math.round(total));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
