"use client";

import { useCallback, useEffect, useState } from "react";
import { loadInsightsReportsPageData } from "./service";
import type {
  InsightsReportsPageData,
  InsightsReportsRange,
} from "./types";

type UseInsightsReportsResult = {
  data: InsightsReportsPageData;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  warnings: string[];
  refetch: () => Promise<void>;
};

const EMPTY_DATA: InsightsReportsPageData = {
  report: null,
  rqHistory: null,
  distortionsSummary: null,
};

export function useInsightsReports(
  userId: string | null,
  range: InsightsReportsRange,
): UseInsightsReportsResult {
  const [data, setData] = useState<InsightsReportsPageData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const runFetch = useCallback(
    async (showInitialLoading: boolean) => {
      if (!userId) {
        setData(EMPTY_DATA);
        setIsLoading(false);
        setIsRefreshing(false);
        setError("Unable to load insights without an authenticated user.");
        setWarnings([]);
        return;
      }

      if (showInitialLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const result = await loadInsightsReportsPageData(userId, range);
        const hasAnyData =
          result.data.report !== null ||
          result.data.rqHistory !== null ||
          result.data.distortionsSummary !== null;

        setData(result.data);
        setWarnings(result.errors);

        if (!hasAnyData) {
          setError("No insights report data is available for this range yet.");
        }
      } catch {
        setError("Unable to load the insights report right now.");
        setWarnings([]);
        setData(EMPTY_DATA);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [range, userId],
  );

  useEffect(() => {
    void runFetch(true);
  }, [runFetch]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    warnings,
    refetch: async () => {
      await runFetch(false);
    },
  };
}
