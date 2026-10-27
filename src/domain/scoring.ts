import { addDays } from "./dates.ts";
import type { Priority } from "./types.ts";

export const PRIORITY_RANK: Record<Priority, number> = { alta: 0, media: 1, baja: 2 };

export function completionPoints(priority: Priority, onTime: boolean): number {
  const base = onTime ? 10 : 4;
  const bonus = priority === "alta" ? 6 : priority === "media" ? 3 : 1;
  return base + bonus;
}

export function applyStreak(
  streak: number,
  lastStreakDate: string | null,
  today: string,
  remainingDue: number,
): { streak: number; lastStreakDate: string | null; incremented: boolean } {
  if (remainingDue > 0) {
    return { streak, lastStreakDate, incremented: false };
  }
  if (lastStreakDate === today) {
    return { streak, lastStreakDate, incremented: false };
  }
  if (lastStreakDate === addDays(today, -1)) {
    return { streak: streak + 1, lastStreakDate: today, incremented: true };
  }
  return { streak: 1, lastStreakDate: today, incremented: true };
}

export function priorityLabel(priority: Priority): string {
  if (priority === "alta") return "Alta";
  if (priority === "media") return "Media";
  return "Baja";
}

export function cleanlinessLabel(value: number): string {
  if (value >= 85) return "Impecable";
  if (value >= 70) return "Bien";
  if (value >= 50) return "Regular";
  if (value >= 30) return "Sucio";
  return "Crítico";
}
