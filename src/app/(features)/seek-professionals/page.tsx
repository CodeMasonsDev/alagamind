"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { getMe, type SessionUser } from "@/api/auth/auth";
import SeekProfessionalsModal from "@/components/insights-reports/seek-professionals-modal";
import ApprovedSessionsPanel from "@/components/insights-reports/approved-sessions-panel";
import { getAllMHPs, type MHPInfo } from "@/app/(MHP)/api/mhp";
import { PageHeader } from "@/components/features/insights-sessions/shared";

export default function SeekProfessionalsPage() {
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [mhps, setMhps] = useState<MHPInfo[]>([]);
  const [isLoadingMhps, setIsLoadingMhps] = useState(true);
  const [seekModalOpen, setSeekModalOpen] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const mhpList = await getAllMHPs();
        if (isMounted) {
          setMhps(
            mhpList.map((m) => ({
              id: m.id,
              firstName: m.firstName,
              lastName: m.lastName,
              email: m.email,
            })),
          );
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load MHPs:", error);
          setMhps([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMhps(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-500/15 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Professional Services
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your Sessions
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Manage and track your approved sessions with mental health professionals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSeekModalOpen(true)}
              disabled={isLoadingProfile || isLoadingMhps}
              className="w-full sm:w-auto inline-flex shrink-0 items-center justify-center sm:justify-start gap-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:shadow-teal-600/50 hover:from-teal-700 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-teal-600/20 dark:hover:shadow-teal-600/40"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Request Professional</span>
            </button>
          </div>

        </div>

        <SeekProfessionalsModal
          isOpen={seekModalOpen}
          onClose={() => setSeekModalOpen(false)}
          mhps={mhps}
          userId={profile?.id ?? ""}
        />

        {isLoadingProfile ? (
          <div className="flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-8 sm:p-16 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Loading your sessions...
              </p>
            </div>
          </div>
        ) : (
          <ApprovedSessionsPanel
            clientId={profile?.id ?? ""}
            isOpen={true}
            hideClose={true}
            onClose={() => {}}
          />
        )}
      </div>
    </div>
  );
}
