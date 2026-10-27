import { describe, expect, it } from "vitest";
import { taskCleanliness, zoneCleanliness } from "./cleanliness.ts";
import type { Task } from "./types.ts";

const task = {
  frequencyDays: 7,
  lastDone: "2026-10-23",
  nextDue: "2026-10-30",
  dirtLevel: 0,
};

describe("limpieza de la zona", () => {
  it("está impecable recién hecha y baja hasta el día que vence", () => {
    expect(taskCleanliness({ ...task, lastDone: "2026-10-27" }, "2026-10-27")).toBe(100);
    expect(taskCleanliness(task, "2026-10-27")).toBe(66);
    expect(
      taskCleanliness({ ...task, lastDone: "2026-10-20", nextDue: "2026-10-27" }, "2026-10-27"),
    ).toBe(40);
  });

  it("la deuda de suciedad la hace caer más rápido", () => {
    const clean = taskCleanliness(task, "2026-10-27");
    const dirty = taskCleanliness({ ...task, dirtLevel: 2 }, "2026-10-27");
    expect(dirty).toBe(42);
    expect(dirty).toBeLessThan(clean);
  });

  it("promedia la zona pesando por la duración", () => {
    const short = {
      ...task,
      id: "a",
      zoneId: "cocina",
      name: "a",
      durationMin: 10,
      priority: "baja" as const,
      weekday: 2,
      postponeCount: 0,
      lastDone: "2026-10-27",
    } satisfies Task;
    const long = {
      ...short,
      id: "b",
      name: "b",
      durationMin: 30,
      lastDone: "2026-10-20",
      nextDue: "2026-10-27",
    } satisfies Task;
    expect(zoneCleanliness([short, long], "2026-10-27")).toBe(55);
  });
});
