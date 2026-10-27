import { describe, expect, it } from "vitest";
import { buildInitialState, BLUEPRINTS, ZONES } from "./seed.ts";
import { busyFromTasks, dueAfterComplete, findSlot } from "./schedule.ts";
import { MAX_DEEP_MINUTES } from "./plan.ts";
import type { Task } from "./types.ts";

const EXPECTED: Record<string, number[]> = {
  habitacion: [1, 2, 7, 7, 7, 30, 90, 90],
  estudio: [3, 7, 7, 7],
  living: [2, 7, 7, 14, 30, 90],
  cocina: [1, 1, 1, 2, 7, 7, 30, 30, 30, 90, 90],
  comedor: [1, 3, 7, 14],
  toilet: [3, 3, 7, 7],
  bano: [3, 3, 7, 7, 4, 30, 30, 30],
  quincho: [7, 14, 14, 30],
  patio: [7, 14, 30],
  jardin: [2, 14, 14, 7, 90],
  lavadero: [3, 3, 30, 7],
  deposito: [30, 30, 60, 180],
  mascota: [1, 4, 7],
};

function loadsOf(tasks: Task[]): Map<string, number> {
  const loads = new Map<string, number>();
  for (const task of tasks) {
    if (task.frequencyDays <= 1) continue;
    loads.set(task.nextDue, (loads.get(task.nextDue) ?? 0) + task.durationMin);
  }
  return loads;
}

describe("plan y frecuencias", () => {
  it("trae las zonas y las frecuencias de la casa", () => {
    expect(ZONES).toHaveLength(13);
    expect(BLUEPRINTS).toHaveLength(68);
    expect(new Set(BLUEPRINTS.map((task) => task.id)).size).toBe(68);
    for (const [zoneId, frequencies] of Object.entries(EXPECTED)) {
      const got = BLUEPRINTS.filter((task) => task.zoneId === zoneId)
        .map((task) => task.frequencyDays)
        .sort((a, b) => a - b);
      expect(got, zoneId).toEqual([...frequencies].sort((a, b) => a - b));
    }
    expect(BLUEPRINTS.find((task) => task.id === "cocina-trapear")?.weekday).toBe(2);
    expect(BLUEPRINTS.find((task) => task.id === "cocina-lavar-platos")?.weekday).toBeNull();
    expect(BLUEPRINTS.find((task) => task.id === "mascota-cambiar-viruta-jaula")?.frequencyDays).toBe(4);
  });

  it("reparte el fondo para no pasar los 60 minutos", () => {
    const state = buildInitialState("2026-10-27");
    expect(state.tasks.filter((task) => task.frequencyDays <= 1).every((task) => task.nextDue === "2026-10-27")).toBe(
      true,
    );
    for (const [day, minutes] of loadsOf(state.tasks)) {
      expect(minutes, day).toBeLessThanOrEqual(MAX_DEEP_MINUTES);
    }
  });

  it("al cumplir una tarea el próximo día tampoco se pasa del cupo", () => {
    let tasks = buildInitialState("2026-10-27").tasks;
    for (const current of [...tasks]) {
      if (current.frequencyDays <= 1) continue;
      const nextDue = dueAfterComplete(
        current,
        current.nextDue,
        tasks.filter((task) => task.id !== current.id),
      );
      tasks = tasks.map((task) =>
        task.id === current.id ? { ...task, nextDue, lastDone: current.nextDue } : task,
      );
    }
    for (const [day, minutes] of loadsOf(tasks)) {
      expect(minutes, day).toBeLessThanOrEqual(MAX_DEEP_MINUTES);
    }
  });

  it("elige el día del plan y se corre si no entra", () => {
    const busy = busyFromTasks([
      { nextDue: "2026-10-27", durationMin: 55, frequencyDays: 7 },
    ]);
    expect(
      findSlot({
        earliest: "2026-10-27",
        weekday: 2,
        durationMin: 10,
        busy,
        flexDays: 7,
      }),
    ).toBe("2026-11-03");

    const full = new Map<string, number>([
      ["2026-10-27", 60],
      ["2026-10-28", 60],
      ["2026-10-29", 60],
      ["2026-10-30", 60],
    ]);
    expect(
      findSlot({
        earliest: "2026-10-27",
        weekday: null,
        durationMin: 10,
        busy: full,
        flexDays: 3,
      }),
    ).toBe("2026-10-31");
  });
});
