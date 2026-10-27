import { describe, expect, it } from "vitest";
import { applyPostpone, isPostponeBlocked, isUrgent, postponeOptions, postponePenalty } from "./postpone.ts";
import { reducer } from "./reducer.ts";
import { buildInitialState } from "./seed.ts";
import type { AppData, Task } from "./types.ts";

const base = {
  nextDue: "2026-10-27",
  postponeCount: 0,
  dirtLevel: 0,
};

describe("posponer", () => {
  it("abre 1, 2 o 3 días y después aprieta", () => {
    expect(postponeOptions(0)).toEqual([1, 2, 3]);
    expect(postponeOptions(1)).toEqual([1]);
    expect(postponeOptions(2)).toEqual([1]);
    expect(postponeOptions(3)).toEqual([]);
    expect(isUrgent(0)).toBe(false);
    expect(isUrgent(1)).toBe(false);
    expect(isUrgent(2)).toBe(true);
    expect(isPostponeBlocked(2)).toBe(false);
    expect(isPostponeBlocked(3)).toBe(true);
    expect(postponePenalty(3)).toBe(12);
  });

  it("corre desde hoy si ya venció y suma deuda", () => {
    const result = applyPostpone({ ...base, nextDue: "2026-10-20" }, 2, "2026-10-27");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.nextDue).toBe("2026-10-29");
    expect(result.dirtLevel).toBe(1);
    expect(result.postponeCount).toBe(1);
    expect(result.pointsDelta).toBe(-8);
    expect(result.breaksStreak).toBe(true);
    expect(result.urgent).toBe(false);
  });

  it("si todavía no vence, suma los días a la fecha original y no corta la racha", () => {
    const result = applyPostpone({ ...base, nextDue: "2026-10-30" }, 1, "2026-10-27");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.nextDue).toBe("2026-10-31");
    expect(result.breaksStreak).toBe(false);
  });

  it("en la segunda solo deja un día y la marca urgente", () => {
    const blockedDays = applyPostpone({ ...base, postponeCount: 1 }, 2, "2026-10-27");
    expect(blockedDays).toEqual({ ok: false, reason: "dias" });
    const second = applyPostpone({ ...base, postponeCount: 1, dirtLevel: 1 }, 1, "2026-10-27");
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.postponeCount).toBe(2);
    expect(second.dirtLevel).toBe(2);
    expect(second.urgent).toBe(true);
    expect(second.blocked).toBe(false);
  });

  it("la tercera es el último día y después queda bloqueada", () => {
    const third = applyPostpone({ ...base, postponeCount: 2, dirtLevel: 2 }, 1, "2026-10-27");
    expect(third.ok).toBe(true);
    if (!third.ok) return;
    expect(third.blocked).toBe(true);
    expect(third.postponeCount).toBe(3);
    const locked = applyPostpone({ ...base, postponeCount: 3 }, 1, "2026-10-27");
    expect(locked).toEqual({ ok: false, reason: "bloqueada" });
  });
});

function task(partial: Partial<Task> & Pick<Task, "id" | "name">): Task {
  return {
    zoneId: "cocina",
    frequencyDays: 1,
    durationMin: 10,
    priority: "alta",
    weekday: null,
    nextDue: "2026-10-27",
    lastDone: "2026-10-26",
    postponeCount: 0,
    dirtLevel: 0,
    ...partial,
  };
}

function state(tasks: Task[], extra: Partial<AppData> = {}): AppData {
  return {
    version: 1,
    zones: [
      {
        id: "cocina",
        name: "Cocina",
        phrase: "la cocina",
        icon: "🍳",
        accent: "#fdba74",
        order: 0,
      },
    ],
    tasks,
    completions: [],
    points: 20,
    streak: 4,
    lastStreakDate: "2026-10-26",
    ...extra,
  };
}

describe("reducer de posponer y hecho", () => {
  it("posponer una de hoy corta la racha, resta puntos y no baja de cero", () => {
    const initial = state([task({ id: "platos", name: "lavar platos" })], { points: 5, streak: 4 });
    const next = reducer(initial, { type: "postpone", taskId: "platos", days: 2, today: "2026-10-27" });
    expect(next.streak).toBe(0);
    expect(next.lastStreakDate).toBeNull();
    expect(next.points).toBe(0);
    expect(next.tasks[0]?.dirtLevel).toBe(1);
    expect(next.tasks[0]?.nextDue).toBe("2026-10-29");
  });

  it("hacerla a tiempo suma puntos, limpia la deuda y empuja la fecha", () => {
    const dirty = task({
      id: "platos",
      name: "lavar platos",
      postponeCount: 2,
      dirtLevel: 2,
      priority: "alta",
    });
    const next = reducer(state([dirty]), {
      type: "complete",
      taskId: "platos",
      today: "2026-10-27",
      at: "2026-10-27T10:00:00",
      id: "c1",
    });
    expect(next.points).toBe(36);
    expect(next.tasks[0]?.postponeCount).toBe(0);
    expect(next.tasks[0]?.dirtLevel).toBe(0);
    expect(next.tasks[0]?.lastDone).toBe("2026-10-27");
    expect(next.tasks[0]?.nextDue).toBe("2026-10-28");
    expect(next.completions[0]?.onTime).toBe(true);
    expect(next.streak).toBe(5);
  });

  it("hacerla tarde da menos puntos y no cuenta como a tiempo", () => {
    const late = task({ id: "platos", name: "lavar platos", nextDue: "2026-10-20", priority: "baja" });
    const next = reducer(state([late], { streak: 2, lastStreakDate: "2026-10-26" }), {
      type: "complete",
      taskId: "platos",
      today: "2026-10-27",
      at: "2026-10-27T10:00:00",
      id: "c1",
    });
    expect(next.completions[0]?.onTime).toBe(false);
    expect(next.completions[0]?.points).toBe(5);
    expect(next.points).toBe(25);
  });

  it("no sube la racha si todavía queda algo de hoy", () => {
    const tasks = [
      task({ id: "platos", name: "lavar platos" }),
      task({ id: "basura", name: "sacar basura" }),
    ];
    const next = reducer(state(tasks), {
      type: "complete",
      taskId: "platos",
      today: "2026-10-27",
      at: "2026-10-27T10:00:00",
      id: "c1",
    });
    expect(next.streak).toBe(4);
    expect(next.lastStreakDate).toBe("2026-10-26");
  });

  it("ignora una posposición bloqueada", () => {
    const locked = task({ id: "platos", name: "lavar platos", postponeCount: 3, dirtLevel: 3 });
    const initial = state([locked]);
    const next = reducer(initial, { type: "postpone", taskId: "platos", days: 1, today: "2026-10-27" });
    expect(next).toBe(initial);
  });

  it("al abrir el día con vencidas, la racha se corta", () => {
    const initial = state([task({ id: "platos", name: "lavar platos", nextDue: "2026-10-25" })]);
    const next = reducer(initial, { type: "reconcile", today: "2026-10-27" });
    expect(next.streak).toBe(0);
    expect(next.lastStreakDate).toBeNull();
  });

  it("el plan inicial no trae vencidas y tiene historial de 4 días", () => {
    const initial = buildInitialState("2026-10-27");
    expect(initial.tasks.some((item) => item.nextDue < "2026-10-27")).toBe(false);
    expect(initial.streak).toBe(4);
    expect(initial.lastStreakDate).toBe("2026-10-26");
    expect(initial.points).toBe(384);
    expect(initial.completions).toHaveLength(24);
  });
});
