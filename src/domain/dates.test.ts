import { describe, expect, it } from "vitest";
import {
  addDays,
  diffDays,
  duePhrase,
  formatMinutes,
  greetingForHour,
  isArgentineSummer,
  isIsoDate,
  nextWeekday,
  todayIso,
} from "./dates.ts";

describe("fechas", () => {
  it("suma días cruzando mes, año y bisiesto", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-10-27", -1)).toBe("2026-10-26");
  });

  it("cuenta la diferencia en días de calendario", () => {
    expect(diffDays("2026-10-27", "2026-11-02")).toBe(6);
    expect(diffDays("2026-10-27", "2026-10-27")).toBe(0);
    expect(diffDays("2026-10-27", "2026-10-20")).toBe(-7);
  });

  it("arma la frase relativa", () => {
    expect(duePhrase("2026-10-27", "2026-10-27")).toBe("hoy");
    expect(duePhrase("2026-10-28", "2026-10-27")).toBe("mañana");
    expect(duePhrase("2026-10-30", "2026-10-27")).toBe("en 3 días");
    expect(duePhrase("2026-10-26", "2026-10-27")).toBe("ayer");
    expect(duePhrase("2026-10-20", "2026-10-27")).toBe("hace 7 días");
  });

  it("usa el día local y no el UTC", () => {
    expect(todayIso(new Date(2026, 9, 27, 23, 30))).toBe("2026-10-27");
  });

  it("reconoce el verano argentino y rechaza fechas imposibles", () => {
    expect(isArgentineSummer("2026-01-15")).toBe(true);
    expect(isArgentineSummer("2026-12-01")).toBe(true);
    expect(isArgentineSummer("2026-10-27")).toBe(false);
    expect(isIsoDate("2026-02-31")).toBe(false);
    expect(isIsoDate("2026-10-27")).toBe(true);
  });

  it("saluda según la hora y formatea minutos", () => {
    expect(greetingForHour(8)).toBe("Buen día");
    expect(greetingForHour(15)).toBe("Buenas tardes");
    expect(greetingForHour(21)).toBe("Buenas noches");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(75)).toBe("1 h 15 min");
  });

  it("encuentra el próximo día de la semana", () => {
    expect(nextWeekday("2026-10-27", 2)).toBe("2026-10-27");
    expect(nextWeekday("2026-10-27", 6)).toBe("2026-10-31");
  });
});
