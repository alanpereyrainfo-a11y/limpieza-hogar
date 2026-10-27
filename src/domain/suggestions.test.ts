import { describe, expect, it } from "vitest";
import { mapiMood } from "./mood.ts";
import { buildInitialState } from "./seed.ts";
import { buildSuggestions } from "./suggestions.ts";
import { parseAppData } from "./storage.ts";

describe("sugerencias y mascota", () => {
  it("un martes de arranque habla de la cocina y no del verano", () => {
    const state = buildInitialState("2026-10-27");
    const suggestions = buildSuggestions(state, "2026-10-27");
    expect(suggestions.some((item) => item.title.toLowerCase().includes("cocina"))).toBe(true);
    expect(suggestions.some((item) => item.id === "verano")).toBe(false);
    expect(mapiMood(state.tasks, "2026-10-27")).toBe("feliz");
  });

  it("en enero pide regar todos los días", () => {
    const state = buildInitialState("2026-01-15");
    const suggestions = buildSuggestions(state, "2026-01-15");
    expect(suggestions.some((item) => item.id === "verano")).toBe(true);
  });

  it("avisa si el quincho lleva 20 días sin barrer", () => {
    const state = buildInitialState("2026-10-27");
    const tasks = state.tasks.map((task) =>
      task.id === "quincho-barrer" ? { ...task, lastDone: "2026-10-07", nextDue: "2026-10-14" } : task,
    );
    const suggestions = buildSuggestions({ ...state, tasks }, "2026-10-27");
    expect(suggestions.some((item) => item.body.includes("El quincho lleva 20 días sin barrer"))).toBe(true);
    expect(mapiMood(tasks, "2026-10-27")).toBe("preocupado");
  });

  it("Mapi se ensucia con la deuda o con dos posposiciones", () => {
    const state = buildInitialState("2026-10-27");
    const dirt = state.tasks.map((task, index) => (index === 0 ? { ...task, dirtLevel: 3 } : task));
    expect(mapiMood(dirt, "2026-10-27")).toBe("sucio");
    const postponed = state.tasks.map((task, index) => (index === 0 ? { ...task, postponeCount: 2 } : task));
    expect(mapiMood(postponed, "2026-10-27")).toBe("sucio");
  });

  it("acepta un respaldo propio y rechaza uno roto", () => {
    const state = buildInitialState("2026-10-27");
    expect(parseAppData(JSON.parse(JSON.stringify(state)))).toEqual(state);
    expect(() => parseAppData({ version: 2 })).toThrow(/respaldo/);
    expect(() =>
      parseAppData({
        ...state,
        tasks: [{ ...state.tasks[0], zoneId: "no-existe" }],
      }),
    ).toThrow(/zona que no existe/);
  });
});
