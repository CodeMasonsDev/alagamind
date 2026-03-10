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
  isPendingSync?: boolean;
};

type ReflectionStore = {
  entries: ReflectionEntry[];
  isLoading: boolean;
  addEntry: (entry: Omit<ReflectionEntry, "createdAt" | "user_id">) => void;
  refreshEntries: () => Promise<void>;
};

const ReflectionsContext = createContext<ReflectionStore | null>(null);

export function ReflectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = "7e9793a6-c652-4b3a-8bed-780c221ee33a";

  const fetchEntries = async () => {
    setIsLoading(true);

    try {
      const data = await GetUserJournals(userId);
      const safeData = Array.isArray(data) ? data : [];
      const mappedEntries: ReflectionEntry[] = safeData.map((item: any) =>
        mapJournalToReflectionEntry(item, userId),
      );

      mappedEntries.sort((a, b) => b.createdAt - a.createdAt);

      setEntries((previous) =>
        mergeEntriesWithPending(previous, mappedEntries),
      );
    } catch (error) {
      console.error("Failed to fetch entries in context", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              entry.id ||
              (typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
            user_id: userId,
            createdAt: entry.createdAt ?? Date.now(),
            isPendingSync: true,
          },
          ...previous.filter((existingEntry) => existingEntry.id !== entry.id),
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

function mapJournalToReflectionEntry(item: any, fallbackUserId: string) {
  const createdAtValue = item.createdAt ?? item.created_at ?? Date.now();
  const createdAtDate = new Date(createdAtValue);
  const createdAt = Number.isNaN(createdAtDate.getTime())
    ? Date.now()
    : createdAtDate.getTime();
  const plainContent = stripHtml(item.content);
  const preview =
    plainContent.length > 120
      ? `${plainContent.slice(0, 120).trimEnd()}...`
      : plainContent || "No content";
  const wordCount = plainContent.split(/\s+/).filter(Boolean).length;

  return {
    id: item.id ?? item.journalId ?? `${fallbackUserId}-${createdAt}`,
    user_id: item.userId ?? item.user_id ?? fallbackUserId,
    createdAt,
    timestamp: formatEntryTimestamp(createdAt),
    title: item.title || "Untitled Reflection",
    preview,
    mood: item.emotionTag || item.mood || "Neutral",
    wordCount: item.wordCount
      ? `${item.wordCount} words`
      : `${wordCount} words`,
    tags: Array.isArray(item.journalTags) ? item.journalTags : [],
    action: "View Reflection",
    moodClass: "text-gray-700 bg-gray-50 ring-gray-600/20",
    dotClass: "bg-gray-500",
    isPendingSync: false,
  };
}

function mergeEntriesWithPending(
  previousEntries: ReflectionEntry[],
  fetchedEntries: ReflectionEntry[],
) {
  const fetchedIds = new Set(fetchedEntries.map((entry) => entry.id));
  const pendingEntries = previousEntries.filter(
    (entry) => entry.isPendingSync && !fetchedIds.has(entry.id),
  );

  return [...pendingEntries, ...fetchedEntries].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}

function stripHtml(content?: string) {
  return (
    content
      ?.replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function formatEntryTimestamp(createdAt: number) {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
