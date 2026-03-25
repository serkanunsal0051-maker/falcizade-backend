import { useState, useCallback } from "react";

const BASE_KEY = "falcizade_history";
const MAX_ITEMS = 50;

export interface FortuneHistoryItem {
  id: string;
  title: string;
  sections: {
    ask: string;
    para: string;
    yol: string;
    saglik: string;
    genel: string;
  };
  createdAt: string;
}

function getStorageKey(): string {
  try {
    const raw = localStorage.getItem("falcizade_auth");
    if (!raw) return BASE_KEY;
    const auth = JSON.parse(raw);
    if (auth?.type === "google" && auth?.id) return `${BASE_KEY}_${auth.id}`;
    return BASE_KEY;
  } catch {
    return BASE_KEY;
  }
}

function readHistory(): FortuneHistoryItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items: FortuneHistoryItem[]): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useHistory() {
  const [history, setHistory] = useState<FortuneHistoryItem[]>(() => readHistory());

  const addToHistory = useCallback((item: Omit<FortuneHistoryItem, "id" | "createdAt">) => {
    const newItem: FortuneHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
      writeHistory(updated);
      return updated;
    });
  }, []);

  return { history, addToHistory };
}
