import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { todayIso } from "../domain/dates.ts";
import { reducer, type Action } from "../domain/reducer.ts";
import { buildInitialState } from "../domain/seed.ts";
import { loadState, saveState } from "../domain/storage.ts";
import type { AppData } from "../domain/types.ts";

type Undo = { data: AppData; label: string };

type StoreValue = {
  data: AppData;
  today: string;
  undo: Undo | null;
  pulse: number;
  saveError: boolean;
  dispatch: (action: Action, undoLabel?: string) => void;
  undoLast: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function loadInitial(): AppData {
  const today = todayIso();
  const stored = loadState();
  if (!stored) return buildInitialState(today);
  return reducer(stored, { type: "reconcile", today });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState(todayIso);
  const [trackedToday, setTrackedToday] = useState(today);
  const [data, setData] = useState<AppData>(loadInitial);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [pulse, setPulse] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const dataRef = useRef(data);

  if (trackedToday !== today) {
    setTrackedToday(today);
    setData((current) => reducer(current, { type: "reconcile", today }));
  }

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const id = window.setInterval(() => setToday(todayIso()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setSaveError(!saveState(data));
  }, [data]);

  useEffect(() => {
    if (!undo) return;
    const id = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(id);
  }, [undo]);

  const value: StoreValue = {
    data,
    today,
    undo,
    pulse,
    saveError,
    dispatch: (action, undoLabel) => {
      if (undoLabel) setUndo({ data: dataRef.current, label: undoLabel });
      setData((current) => reducer(current, action));
      if (action.type === "complete") setPulse((count) => count + 1);
    },
    undoLast: () => {
      const snapshot = undo;
      if (!snapshot) return;
      setData(snapshot.data);
      setUndo(null);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore tiene que usarse dentro del provider");
  return value;
}
