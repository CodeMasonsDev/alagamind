"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type ReflectionEntry = {
  id: string;
  createdAt: number;
  timestamp: string;
  mood: string;
  title: string;
  preview: string;
  tags?: string[];
  subBadge?: string;
  wordCount: string;
  action: string;
  moodClass: string;
  dotClass: string;
};

type ReflectionStore = {
  entries: ReflectionEntry[];
  addEntry: (entry: Omit<ReflectionEntry, "id" | "createdAt">) => void;
};

const ReflectionsContext = createContext<ReflectionStore | null>(null);

export function ReflectionsProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);

  const value = useMemo<ReflectionStore>(
    () => ({
      entries,
      addEntry: (entry) => {
        setEntries((previous) => [
          {
            ...entry,
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createdAt: Date.now(),
          },
          ...previous,
        ]);
      },
    }),
    [entries],
  );

  return (
    <ReflectionsContext.Provider value={value}>
      {children}
    </ReflectionsContext.Provider>
  );
}

export function useReflections() {
  const context = useContext(ReflectionsContext);
  if (!context) {
    throw new Error("useReflections must be used within ReflectionsProvider");
  }
  return context;
}
