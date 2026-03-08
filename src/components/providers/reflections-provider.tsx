"use client";

import { GetUserJournals } from "@/api/journal";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ReflectionEntry = {
  id: string;
  user_id: string;
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
  isLoading: boolean;
  addEntry: (
    entry: Omit<ReflectionEntry, "id" | "createdAt" | "user_id">,
  ) => void;
  refreshEntries: () => Promise<void>; // Expose this so you can trigger a re-fetch after saving
};

const ReflectionsContext = createContext<ReflectionStore | null>(null);

export function ReflectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded for now per your request
  const userId = "7e9793a6-c652-4b3a-8bed-780c221ee33a";
  const journal_id = "072392ed-38f6-4a76-83b7-aa99f4be163a";

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const data = await GetUserJournals(userId);

      // THE FIX: Fallback to an empty array if data is undefined or not an array
      const safeData = Array.isArray(data) ? data : [];

      const mappedEntries: ReflectionEntry[] = safeData.map((item: any) => {
        const dateObj = new Date(item.createdAt);
        const cleanPreview = item.content
          ? item.content.replace(/[#_*~`>]/g, "").substring(0, 120) + "..."
          : "No content";

        return {
          id: item.id,
          user_id: userId,
          createdAt: dateObj.getTime(),
          timestamp: dateObj.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          title: item.title || "Untitled Reflection",
          preview: cleanPreview,
          mood: item.emotionTag || "Neutral",
          wordCount: item.wordCount
            ? `${item.wordCount} words`
            : `${item.content?.split(/\s+/).length || 0} words`,
          tags: item.journalTags || [],
          action: "View Reflection",
          moodClass: "text-gray-700 bg-gray-50 ring-gray-600/20",
          dotClass: "bg-gray-500",
        };
      });

      mappedEntries.sort((a, b) => b.createdAt - a.createdAt);
      setEntries(mappedEntries);
    } catch (error) {
      console.error("Failed to fetch entries in context", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const value = useMemo<ReflectionStore>(
    () => ({
      entries,
      isLoading,
      refreshEntries: fetchEntries,
      addEntry: (entry) => {
        setEntries((previous) => [
          {
            ...entry,
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            user_id: userId,
            createdAt: Date.now(),
          },
          ...previous,
        ]);
      },
    }),
    [entries, isLoading],
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
