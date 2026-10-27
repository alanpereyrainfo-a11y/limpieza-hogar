import { addDays } from "./dates.ts";
import { applyPostpone } from "./postpone.ts";
import { buildInitialState } from "./seed.ts";
import { busyFromTasks, dueAfterComplete, findSlot } from "./schedule.ts";
import { applyStreak, completionPoints } from "./scoring.ts";
import type { AppData, Completion, Task, Zone } from "./types.ts";

export type Action =
  | { type: "complete"; taskId: string; today: string; at: string; id: string }
  | { type: "postpone"; taskId: string; days: number; today: string }
  | { type: "add-zone"; zone: Zone }
  | { type: "update-zone"; zone: Zone }
  | { type: "delete-zone"; zoneId: string }
  | { type: "add-task"; task: Task }
  | { type: "update-task"; task: Task; today: string }
  | { type: "delete-task"; taskId: string }
  | { type: "import"; data: AppData; today: string }
  | { type: "reset"; today: string }
  | { type: "reconcile"; today: string };

export function reconcileData(state: AppData, today: string): AppData {
  const hasOverdue = state.tasks.some((task) => task.nextDue < today);
  if (!hasOverdue) return state;
  if (state.streak === 0 && state.lastStreakDate === null) return state;
  return { ...state, streak: 0, lastStreakDate: null };
}

function reschedule(previous: Task, next: Task, others: Task[], today: string): Task {
  const frequencyChanged = previous.frequencyDays !== next.frequencyDays;
  const weekdayChanged = previous.weekday !== next.weekday;
  const task: Task = next.frequencyDays <= 1 ? { ...next, weekday: null } : { ...next };
  if (!frequencyChanged && !weekdayChanged) return task;
  if (previous.nextDue <= today && !frequencyChanged) return task;

  const anchor = task.lastDone ?? addDays(today, -task.frequencyDays);
  let earliest = addDays(anchor, task.frequencyDays);
  if (earliest < today) earliest = today;
  if (task.frequencyDays <= 1) return { ...task, nextDue: earliest };

  const nextDue = findSlot({
    earliest,
    weekday: task.frequencyDays >= 7 ? task.weekday : null,
    durationMin: task.durationMin,
    busy: busyFromTasks(others.filter((item) => item.id !== task.id)),
    flexDays: task.frequencyDays >= 28 ? 21 : task.frequencyDays >= 7 ? 10 : 4,
  });
  return { ...task, nextDue };
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "reconcile":
      return reconcileData(state, action.today);
    case "reset":
      return buildInitialState(action.today);
    case "import":
      return reconcileData(action.data, action.today);
    case "add-zone":
      if (state.zones.some((zone) => zone.id === action.zone.id)) return state;
      return { ...state, zones: [...state.zones, action.zone] };
    case "update-zone":
      return {
        ...state,
        zones: state.zones.map((zone) => (zone.id === action.zone.id ? action.zone : zone)),
      };
    case "delete-zone":
      if (state.tasks.some((task) => task.zoneId === action.zoneId)) return state;
      return { ...state, zones: state.zones.filter((zone) => zone.id !== action.zoneId) };
    case "add-task":
      if (state.tasks.some((task) => task.id === action.task.id)) return state;
      if (!state.zones.some((zone) => zone.id === action.task.zoneId)) return state;
      return { ...state, tasks: [...state.tasks, action.task] };
    case "delete-task":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.taskId) };
    case "update-task": {
      const previous = state.tasks.find((task) => task.id === action.task.id);
      if (!previous) return state;
      if (!state.zones.some((zone) => zone.id === action.task.zoneId)) return state;
      const next = reschedule(previous, action.task, state.tasks, action.today);
      return { ...state, tasks: state.tasks.map((task) => (task.id === next.id ? next : task)) };
    }
    case "postpone": {
      const task = state.tasks.find((item) => item.id === action.taskId);
      if (!task) return state;
      const result = applyPostpone(task, action.days, action.today);
      if (!result.ok) return state;
      return {
        ...state,
        points: Math.max(0, state.points + result.pointsDelta),
        streak: result.breaksStreak ? 0 : state.streak,
        lastStreakDate: result.breaksStreak ? null : state.lastStreakDate,
        tasks: state.tasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                nextDue: result.nextDue,
                postponeCount: result.postponeCount,
                dirtLevel: result.dirtLevel,
              }
            : item,
        ),
      };
    }
    case "complete": {
      const task = state.tasks.find((item) => item.id === action.taskId);
      if (!task) return state;
      const zone = state.zones.find((item) => item.id === task.zoneId);
      const onTime = task.nextDue >= action.today;
      const points = completionPoints(task.priority, onTime);
      const others = state.tasks.filter((item) => item.id !== task.id);
      const nextDue = dueAfterComplete(task, action.today, others);
      const tasks = state.tasks.map((item) =>
        item.id === task.id
          ? { ...item, nextDue, lastDone: action.today, postponeCount: 0, dirtLevel: 0 }
          : item,
      );
      const remaining = tasks.filter((item) => item.nextDue <= action.today).length;
      const streak = applyStreak(state.streak, state.lastStreakDate, action.today, remaining);
      const completion: Completion = {
        id: action.id,
        taskId: task.id,
        taskName: task.name,
        zoneId: task.zoneId,
        zoneName: zone?.name ?? "Zona",
        date: action.today,
        at: action.at,
        onTime,
        points,
      };
      return {
        ...state,
        tasks,
        completions: [completion, ...state.completions],
        points: state.points + points,
        streak: streak.streak,
        lastStreakDate: streak.lastStreakDate,
      };
    }
    default:
      return state;
  }
}
