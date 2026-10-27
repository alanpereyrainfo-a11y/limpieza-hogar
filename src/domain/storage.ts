import { isIsoDate } from "./dates.ts";
import type { AppData, Completion, Priority, Task, Zone } from "./types.ts";
import { STORAGE_KEY } from "./types.ts";

const PRIORITIES = new Set<Priority>(["baja", "media", "alta"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  return value;
}

function intField(record: Record<string, unknown>, key: string, min: number, max: number): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  return value;
}

function parseZone(value: unknown): Zone {
  if (!isRecord(value)) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  return {
    id: stringField(value, "id"),
    name: stringField(value, "name"),
    phrase: stringField(value, "phrase"),
    icon: stringField(value, "icon"),
    accent: stringField(value, "accent"),
    order: intField(value, "order", 0, 999),
  };
}

function parseTask(value: unknown): Task {
  if (!isRecord(value)) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  const priority = value.priority;
  if (typeof priority !== "string" || !PRIORITIES.has(priority as Priority)) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  const weekday = value.weekday;
  if (weekday !== null && (typeof weekday !== "number" || !Number.isInteger(weekday) || weekday < 0 || weekday > 6)) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  const lastDone = value.lastDone;
  if (lastDone !== null && (typeof lastDone !== "string" || !isIsoDate(lastDone))) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  const nextDue = stringField(value, "nextDue");
  if (!isIsoDate(nextDue)) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  return {
    id: stringField(value, "id"),
    zoneId: stringField(value, "zoneId"),
    name: stringField(value, "name"),
    frequencyDays: intField(value, "frequencyDays", 1, 365),
    durationMin: intField(value, "durationMin", 1, 240),
    priority: priority as Priority,
    weekday,
    nextDue,
    lastDone,
    postponeCount: intField(value, "postponeCount", 0, 99),
    dirtLevel: intField(value, "dirtLevel", 0, 99),
  };
}

function parseCompletion(value: unknown): Completion {
  if (!isRecord(value)) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  const date = stringField(value, "date");
  if (!isIsoDate(date)) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  if (typeof value.onTime !== "boolean") throw new Error("Ese archivo no es un respaldo de Limpieza.");
  return {
    id: stringField(value, "id"),
    taskId: stringField(value, "taskId"),
    taskName: stringField(value, "taskName"),
    zoneId: stringField(value, "zoneId"),
    zoneName: stringField(value, "zoneName"),
    date,
    at: stringField(value, "at"),
    onTime: value.onTime,
    points: intField(value, "points", 0, 999),
  };
}

export function parseAppData(input: unknown): AppData {
  if (!isRecord(input) || input.version !== 1) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  if (!Array.isArray(input.zones) || !Array.isArray(input.tasks) || !Array.isArray(input.completions)) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  const zones = input.zones.map(parseZone);
  const zoneIds = new Set(zones.map((zone) => zone.id));
  if (zoneIds.size !== zones.length) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  const tasks = input.tasks.map(parseTask);
  const taskIds = new Set(tasks.map((task) => task.id));
  if (taskIds.size !== tasks.length) throw new Error("Ese archivo no es un respaldo de Limpieza.");
  if (tasks.some((task) => !zoneIds.has(task.zoneId))) {
    throw new Error("El respaldo tiene una tarea en una zona que no existe.");
  }
  const lastStreakDate = input.lastStreakDate;
  if (lastStreakDate !== null && (typeof lastStreakDate !== "string" || !isIsoDate(lastStreakDate))) {
    throw new Error("Ese archivo no es un respaldo de Limpieza.");
  }
  return {
    version: 1,
    zones,
    tasks,
    completions: input.completions.map(parseCompletion),
    points: intField(input, "points", 0, 1_000_000),
    streak: intField(input, "streak", 0, 10_000),
    lastStreakDate,
  };
}

export function loadState(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseAppData(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveState(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(data: AppData, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
