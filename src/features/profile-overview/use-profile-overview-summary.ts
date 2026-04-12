"use client";

import { useCallback, useState } from "react";
import {
  getProfileOverviewSummary,
  type ProfileOverviewSummaryResponse,
} from "@/api/profile";

type UseProfileOverviewSummaryResult = {
  data: ProfileOverviewSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  open: () => Promise<void>;
  close: () => void;
  isOpen: boolean;
};

const memoryCache = new Map<string, ProfileOverviewSummaryResponse>();
const STORAGE_PREFIX = "profile-overview-summary:";

export function useProfileOverviewSummary(
  userId: string | null,
): UseProfileOverviewSummaryResult {
  const [data, setData] = useState<ProfileOverviewSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(async () => {
    setIsOpen(true);

    if (!userId) {
      setError("Unable to generate an overview without an authenticated user.");
      setData(null);
      return;
    }

    const cached = getCachedSummary(userId);
    if (cached) {
      setData(cached);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getProfileOverviewSummary(userId);
      setData(response);
      setCachedSummary(userId, response);
    } catch {
      setError("Unable to load the overview summary right now.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    open,
    close,
    isOpen,
  };
}

function getCachedSummary(userId: string) {
  const memoryValue = memoryCache.get(userId);
  if (memoryValue) {
    return memoryValue;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(`${STORAGE_PREFIX}${userId}`);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ProfileOverviewSummaryResponse;
    memoryCache.set(userId, parsed);
    return parsed;
  } catch {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
    return null;
  }
}

function setCachedSummary(
  userId: string,
  value: ProfileOverviewSummaryResponse,
) {
  memoryCache.set(userId, value);

  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    `${STORAGE_PREFIX}${userId}`,
    JSON.stringify(value),
  );
}
