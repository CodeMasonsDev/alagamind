"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getFocusMomentum,
  type FocusMomentumResponse,
} from "@/api/focus-momentum";

type DashboardMetricsStore = {
  focusMomentum: FocusMomentumResponse | null;
  isFocusMomentumLoading: boolean;
  isFocusMomentumRefreshing: boolean;
  focusMomentumError: string | null;
  refreshFocusMomentum: (
    userId: string,
  ) => Promise<FocusMomentumResponse | null>;
};

const DashboardMetricsContext = createContext<DashboardMetricsStore | null>(
  null,
);

export function DashboardMetricsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [focusMomentum, setFocusMomentum] =
    useState<FocusMomentumResponse | null>(null);
  const focusMomentumRef = useRef<FocusMomentumResponse | null>(null);
  const [isFocusMomentumLoading, setIsFocusMomentumLoading] = useState(false);
  const [isFocusMomentumRefreshing, setIsFocusMomentumRefreshing] =
    useState(false);
  const [focusMomentumError, setFocusMomentumError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    focusMomentumRef.current = focusMomentum;
  }, [focusMomentum]);

  const refreshFocusMomentum = useCallback(
    async (userId: string) => {
      const isInitialLoad = focusMomentumRef.current == null;

      if (isInitialLoad) {
        setIsFocusMomentumLoading(true);
      } else {
        setIsFocusMomentumRefreshing(true);
      }

      setFocusMomentumError(null);

      try {
        const response = await getFocusMomentum(userId);

        if (!response) {
          setFocusMomentumError("Unable to load focus momentum right now.");
          return null;
        }

        setFocusMomentum(response);
        return response;
      } catch (error) {
        console.error("Failed to refresh focus momentum:", error);
        setFocusMomentumError("Unable to load focus momentum right now.");
        return null;
      } finally {
        setIsFocusMomentumLoading(false);
        setIsFocusMomentumRefreshing(false);
      }
    },
    [],
  );

  const value = useMemo<DashboardMetricsStore>(
    () => ({
      focusMomentum,
      isFocusMomentumLoading,
      isFocusMomentumRefreshing,
      focusMomentumError,
      refreshFocusMomentum,
    }),
    [
      focusMomentum,
      focusMomentumError,
      isFocusMomentumLoading,
      isFocusMomentumRefreshing,
      refreshFocusMomentum,
    ],
  );

  return (
    <DashboardMetricsContext.Provider value={value}>
      {children}
    </DashboardMetricsContext.Provider>
  );
}

export function useDashboardMetrics() {
  const context = useContext(DashboardMetricsContext);

  if (!context) {
    throw new Error(
      "useDashboardMetrics must be used within DashboardMetricsProvider",
    );
  }

  return context;
}
