"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { getMe, type SessionUser } from "@/api/auth/auth";
import BehavioralPatterns from "@/components/insights-reports/behavioral-patterns";
import CompanionInsights from "@/components/insights-reports/companion-insights";
import DistortionAnalysis from "@/components/insights-reports/distortion-analysis";
import EmotionalStateDistribution from "@/components/insights-reports/emotional-state-distribution";
import ExerciseRecommendations from "@/components/insights-reports/exercise-recommendations";
import ModuleContribution from "@/components/insights-reports/module-contribution";
import OverviewMetrics from "@/components/insights-reports/overview-metrics";
import ProfileOverviewModal from "@/components/insights-reports/profile-overview-modal";
import RangeSelector from "@/components/insights-reports/range-selector";
import RqScoreTrend from "@/components/insights-reports/rq-score-trend";
import {
  InsightsReportsEmptyState,
  InsightsReportsErrorState,
  InsightsReportsLoadingState,
} from "@/components/insights-reports/states";
import WeeklyActivity from "@/components/insights-reports/weekly-activity";
import {
  PageHeader,
  StatusPill,
} from "@/components/features/insights-sessions/shared";
import { useInsightsReports } from "@/features/insights-reports/use-insights-reports";
import { useProfileOverviewSummary } from "@/features/profile-overview/use-profile-overview-summary";
import type { InsightsReportsRange } from "@/features/insights-reports/types";

export default function InsightsReportsPage() {
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [range, setRange] = useState<InsightsReportsRange>("7d");

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getMe();
        if (isMounted) {
          setProfile(currentUser);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const { data, isLoading, isRefreshing, error, warnings, refetch } =
    useInsightsReports(profile?.id ?? null, range);
  const {
    data: overviewSummary,
    isLoading: isLoadingOverviewSummary,
    error: overviewSummaryError,
    open: openOverviewSummary,
    close: closeOverviewSummary,
    isOpen: isOverviewSummaryOpen,
  } = useProfileOverviewSummary(profile?.id ?? null);

  const report = data.report;
  const rqHistory = data.rqHistory;
  const distortionsSummary = data.distortionsSummary;

  const hasRenderableData = useMemo(
    () =>
      Boolean(
        report?.overview ||
        (rqHistory?.snapshots.length ?? 0) > 0 ||
        report?.emotional_distribution ||
        report?.weekly_activity ||
        distortionsSummary ||
        report?.companion_insights ||
        (report?.behavioral_patterns.length ?? 0) > 0 ||
        report?.module_contribution ||
        report?.exercise_recommendations,
      ),
    [distortionsSummary, report, rqHistory],
  );

  const behavioralPatterns = report?.behavioral_patterns.length
    ? report.behavioral_patterns
    : (distortionsSummary?.patterns ?? []);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Insights & Reports"
          title="Insights & Reports"
          description="Track resilience movement, emotional distribution, usage patterns, and recommendation signals across your selected reporting window."
          actions={
            <>
              <button
                type="button"
                onClick={() => void openOverviewSummary()}
                disabled={isLoadingProfile}
                className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Overview
              </button>
              <RangeSelector
                value={range}
                onChange={setRange}
                disabled={isLoadingProfile || isLoading}
              />
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isLoadingProfile || isRefreshing}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRefreshing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </>
          }
        />

        {warnings.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {warnings.map((warning) => (
              <StatusPill key={warning} tone="amber">
                {warning}
              </StatusPill>
            ))}
          </div>
        ) : null}

        <ProfileOverviewModal
          isOpen={isOverviewSummaryOpen}
          isLoading={isLoadingOverviewSummary}
          error={overviewSummaryError}
          data={overviewSummary}
          onClose={closeOverviewSummary}
        />

        {isLoadingProfile || isLoading ? (
          <InsightsReportsLoadingState />
        ) : error && !hasRenderableData ? (
          <InsightsReportsErrorState
            message={error}
            onRetry={() => void refetch()}
          />
        ) : !hasRenderableData ? (
          <InsightsReportsEmptyState message="The API returned no usable insights data for the selected range." />
        ) : (
          <div className="space-y-6">
            <OverviewMetrics overview={report?.overview ?? null} />

            <div className="grid gap-6 xl:grid-cols-2">
              <EmotionalStateDistribution
                emotionalDistribution={report?.emotional_distribution ?? null}
              />
              <WeeklyActivity
                weeklyActivity={report?.weekly_activity ?? null}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-1">
              <DistortionAnalysis distortionsSummary={distortionsSummary} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <CompanionInsights
                companionInsights={report?.companion_insights ?? null}
              />
              <BehavioralPatterns patterns={behavioralPatterns} />
            </div>

            <ModuleContribution
              moduleContribution={report?.module_contribution ?? null}
            />

            <ExerciseRecommendations
              exerciseRecommendations={report?.exercise_recommendations ?? null}
            />
          </div>
        )}
      </div>
    </div>
  );
}
