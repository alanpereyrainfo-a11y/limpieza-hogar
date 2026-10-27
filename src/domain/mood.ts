import type { Mood, Task } from "./types.ts";

export function mapiMood(tasks: Task[], today: string): Mood {
  const dirt = tasks.reduce((total, task) => total + task.dirtLevel, 0);
  const hardPostpone = tasks.some((task) => task.postponeCount >= 2);
  if (dirt >= 3 || hardPostpone) return "sucio";
  if (tasks.some((task) => task.nextDue < today)) return "preocupado";
  return "feliz";
}

export function mapiLine(mood: Mood, overdue: number, streak: number): string {
  if (mood === "sucio" && overdue > 0) {
    return "Estoy hecho un asco y además hay cosas vencidas. Hacé una cortita y respiramos.";
  }
  if (mood === "sucio") {
    return "Cada posposición me deja mugre. Si la hacés ahora, quedo como nuevo.";
  }
  if (mood === "preocupado") {
    return overdue === 1
      ? "Hay una vencida. Empezá por esa y yo dejo de mirarte así."
      : `Hay ${overdue} vencidas. Empezá por la más corta, ¿dale?`;
  }
  if (streak >= 3) {
    return `Llevás ${streak} días de racha. Che, así da gusto.`;
  }
  return "Vas al día. La casa está en orden y yo también.";
}

export function moodLabel(mood: Mood): string {
  if (mood === "feliz") return "al día";
  if (mood === "preocupado") return "preocupado";
  return "sucio de tanto posponer";
}
