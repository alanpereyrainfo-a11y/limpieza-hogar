import { addDays, weekdayIndex } from "./dates.ts";
import { MAX_DEEP_MINUTES } from "./plan.ts";
import type { Task } from "./types.ts";

export type Blueprint = Omit<Task, "nextDue" | "lastDone" | "postponeCount" | "dirtLevel">;

export type BusyMap = Map<string, number>;

type SlotInput = {
  earliest: string;
  weekday: number | null;
  durationMin: number;
  busy: BusyMap;
  flexDays: number;
  maxMinutes?: number;
};

export function busyFromTasks(
  tasks: Array<Pick<Task, "nextDue" | "durationMin" | "frequencyDays">>,
): BusyMap {
  const busy: BusyMap = new Map();
  for (const task of tasks) {
    if (task.frequencyDays <= 1) continue;
    busy.set(task.nextDue, (busy.get(task.nextDue) ?? 0) + task.durationMin);
  }
  return busy;
}

function fits(busy: BusyMap, date: string, durationMin: number, maxMinutes: number): boolean {
  return (busy.get(date) ?? 0) + durationMin <= maxMinutes;
}

/**
 * Elige el primer día que respeta el cupo.
 * Prefiere el día del plan y, si no entra, corre la fecha antes de apilar.
 * Una tarea más larga que el cupo no se puede partir: cae en su día.
 */
export function findSlot(input: SlotInput): string {
  const maxMinutes = input.maxMinutes ?? MAX_DEEP_MINUTES;
  if (input.durationMin > maxMinutes) {
    if (input.weekday === null) return input.earliest;
    for (let offset = 0; offset <= Math.max(input.flexDays, 6); offset += 1) {
      const date = addDays(input.earliest, offset);
      if (weekdayIndex(date) === input.weekday) return date;
    }
    return input.earliest;
  }

  const window = Math.max(0, input.flexDays);
  const dates = Array.from({ length: window + 1 }, (_, offset) => addDays(input.earliest, offset));

  if (input.weekday !== null) {
    const themed = dates.find(
      (date) => weekdayIndex(date) === input.weekday && fits(input.busy, date, input.durationMin, maxMinutes),
    );
    if (themed) return themed;
  }

  const any = dates.find((date) => fits(input.busy, date, input.durationMin, maxMinutes));
  if (any) return any;

  for (let offset = window + 1; offset <= 120; offset += 1) {
    const date = addDays(input.earliest, offset);
    const themed = input.weekday === null || weekdayIndex(date) === input.weekday;
    if (themed && fits(input.busy, date, input.durationMin, maxMinutes)) return date;
  }
  for (let offset = window + 1; offset <= 120; offset += 1) {
    const date = addDays(input.earliest, offset);
    if (fits(input.busy, date, input.durationMin, maxMinutes)) return date;
  }
  return input.earliest;
}

export function dueAfterComplete(
  task: Pick<Task, "frequencyDays" | "durationMin" | "weekday">,
  completedOn: string,
  others: Array<Pick<Task, "nextDue" | "durationMin" | "frequencyDays">>,
): string {
  const earliest = addDays(completedOn, Math.max(1, task.frequencyDays));
  if (task.frequencyDays <= 1) return earliest;
  return findSlot({
    earliest,
    weekday: task.frequencyDays >= 7 ? task.weekday : null,
    durationMin: task.durationMin,
    busy: busyFromTasks(others),
    flexDays: task.frequencyDays >= 28 ? 21 : task.frequencyDays >= 7 ? 10 : 4,
  });
}

function phase(frequency: number): number {
  if (frequency <= 1) return -1;
  if (frequency >= 7 && frequency < 28) return 0;
  if (frequency < 7) return 1;
  return 2;
}

/** Arma la primera fecha de cada tarea sin pasar el cupo diario de fondo. */
export function scheduleBlueprints(blueprints: Blueprint[], today: string): Task[] {
  const busy: BusyMap = new Map();
  const sorted = [...blueprints].sort((a, b) => {
    const phaseDelta = phase(a.frequencyDays) - phase(b.frequencyDays);
    if (phaseDelta !== 0) return phaseDelta;
    if (a.frequencyDays !== b.frequencyDays) return a.frequencyDays - b.frequencyDays;
    return b.durationMin - a.durationMin;
  });

  return sorted.map((blueprint) => {
    if (blueprint.frequencyDays <= 1) {
      return {
        ...blueprint,
        weekday: null,
        nextDue: today,
        lastDone: addDays(today, -1),
        postponeCount: 0,
        dirtLevel: 0,
      };
    }
    const flexDays =
      blueprint.frequencyDays >= 28 ? Math.min(blueprint.frequencyDays, 90) : blueprint.frequencyDays >= 7 ? 21 : 8;
    const nextDue = findSlot({
      earliest: today,
      weekday: blueprint.weekday,
      durationMin: blueprint.durationMin,
      busy,
      flexDays,
    });
    busy.set(nextDue, (busy.get(nextDue) ?? 0) + blueprint.durationMin);
    const impliedLast = addDays(nextDue, -blueprint.frequencyDays);
    return {
      ...blueprint,
      nextDue,
      lastDone: impliedLast <= today ? impliedLast : null,
      postponeCount: 0,
      dirtLevel: 0,
    };
  });
}

export function deepMinutesOn(tasks: Task[], date: string): number {
  return tasks
    .filter((task) => task.frequencyDays > 1 && task.nextDue === date)
    .reduce((total, task) => total + task.durationMin, 0);
}
