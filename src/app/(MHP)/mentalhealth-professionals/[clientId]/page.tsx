"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import BehavioralPatterns from "@/components/insights-reports/behavioral-patterns";
import CompanionInsights from "@/components/insights-reports/companion-insights";
import DistortionAnalysis from "@/components/insights-reports/distortion-analysis";
import EmotionalStateDistribution from "@/components/insights-reports/emotional-state-distribution";
import OverviewMetrics from "@/components/insights-reports/overview-metrics";
import WeeklyActivity from "@/components/insights-reports/weekly-activity";
import { type ClientStatus, type MHPClient } from "../../components/mock-data";
import ApprovalModal, {
  type ApprovalDetails,
} from "../../components/approval-modal";
import {
  createApprovedSessionSafe,
  deleteClient,
  getMHPById,
  getClientsByMHP,
  sendApprovedSessionEmail,
  updateClientStatus,
  type ClientData,
  type MHPData,
  type CreateApprovedSessionPayload,
  type ApproveSessionEmailPayload,
} from "../../api/mhp";
import { getMe, type SessionUser } from "@/api/auth/auth";
import { useInsightsReports } from "@/features/insights-reports/use-insights-reports";
import { useProfileOverviewSummary } from "@/features/profile-overview/use-profile-overview-summary";
import ProfileOverviewModal from "@/components/insights-reports/profile-overview-modal";

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_STEPS: ClientStatus[] = ["New Request", "In Session", "Follow-up"];

const STATUS_BADGE: Record<ClientStatus, string> = {
  "New Request":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  "In Session":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  "Follow-up":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
};

const STATUS_DESCRIPTIONS: Record<ClientStatus, string> = {
  "New Request":
    "Client has submitted a session request and is awaiting MHP review.",
  "In Session": "Client is currently in an active therapeutic session.",
  "Follow-up": "Client is in the follow-up and monitoring phase.",
};

// ─── Status Stepper ──────────────────────────────────────────────────────────

function StatusStepper({ current }: { current: ClientStatus }) {
  const currentIndex = STATUS_STEPS.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-teal-500 bg-teal-500 text-white"
                    : active
                      ? "border-teal-500 bg-white text-teal-600 dark:bg-slate-900"
                      : "border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : active ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  active
                    ? "text-teal-600 dark:text-teal-400"
                    : done
                      ? "text-teal-500 dark:text-teal-500"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step}
              </span>
            </div>

            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`mb-5 h-0.5 w-16 sm:w-24 transition-colors ${
                  i < currentIndex
                    ? "bg-teal-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Action Panel ─────────────────────────────────────────────────────────────

type ActionPanelProps = {
  client: MHPClient;
  status: ClientStatus;
  approvalSent: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onAdvance: () => void;
  onReopen: () => void;
  isLoading?: boolean;
};

function ActionPanel({
  client,
  status,
  approvalSent,
  onApprove,
  onDecline,
  onAdvance,
  onReopen,
  isLoading = false,
}: ActionPanelProps) {
  if (status === "New Request") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Pending Review
            </p>
            <p className="mt-1 max-w-md text-sm text-amber-700/80 dark:text-amber-400/80">
              {client?.name || "Client"} is requesting a therapeutic session.
              Review their insights below before approving or declining.
            </p>
          </div>
          {!approvalSent ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onDecline}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <XCircle className="h-4 w-4" />
                Decline
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Request
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 dark:border-teal-500/30 dark:bg-teal-500/10">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                Approval sent
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === "In Session") {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-500/20 dark:bg-teal-500/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-teal-800 dark:text-teal-300">
              Active Session
            </p>
            <p className="mt-1 max-w-md text-sm text-teal-700/80 dark:text-teal-400/80">
              {client?.name || "Client"} is currently in an active session. Move
              to follow-up once the primary intervention is complete.
            </p>
          </div>
          <button
            type="button"
            onClick={onAdvance}
            disabled={isLoading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Move to Follow-up
          </button>
        </div>
      </div>
    );
  }

  // Follow-up
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-500/20 dark:bg-violet-500/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-300">
            Follow-up Phase
          </p>
          <p className="mt-1 max-w-md text-sm text-violet-700/80 dark:text-violet-400/80">
            {client?.name || "Client"} is in the follow-up phase. You can reopen
            the session if further intervention is needed.
          </p>
        </div>
        <button
          type="button"
          onClick={onReopen}
          disabled={isLoading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-500/30 dark:bg-transparent dark:text-violet-400 dark:hover:bg-violet-500/10"
        >
          <RefreshCw className="h-4 w-4" />
          Resume Session
        </button>
      </div>
    </div>
  );
}

// ─── Approved Summary Card ────────────────────────────────────────────────────

function ApprovalSummaryCard({ details }: { details: ApprovalDetails }) {
  return (
    <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm dark:border-teal-500/20 dark:bg-white/3">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-600 dark:text-teal-400">
          Approval Sent
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail
          label="Session Type"
          value={
            details.sessionType === "online" ? "Online (Video)" : "In-Person"
          }
        />
        {details.sessionType === "online" && details.meetLink && (
          <Detail label="Google Meet" value={details.meetLink} isLink />
        )}
        {details.appointmentDate && (
          <Detail
            label="Appointment"
            value={`${details.appointmentDate}${details.appointmentTime ? ` at ${details.appointmentTime}` : ""}`}
          />
        )}
        <Detail label="Contact Email" value={details.contactEmail} />
        <Detail label="Contact Phone" value={details.contactPhone} />
        {details.notes && <Detail label="Notes" value={details.notes} wide />}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  isLink = false,
  wide = false,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block truncate text-sm font-medium text-teal-600 underline underline-offset-2 hover:text-teal-700 dark:text-teal-400"
        >
          {value}
        </a>
      ) : (
        <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function deriveStatus(client: ClientData): ClientStatus {
  if (client.inFollowUp) return "Follow-up";
  if (client.inSession) return "In Session";
  return "New Request";
}

function formatClientNameFromEmail(email: string) {
  const localPart = email.split("@")[0]?.trim();
  return localPart || "Client";
}

function toIsoDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

export default function ClientReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const router = useRouter();
  const { clientId } = use(params);
  const { data: passedData } = use(searchParams);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [mhpUser, setMhpUser] = useState<SessionUser | null>(null);
  const [mhpProfile, setMhpProfile] = useState<MHPData | null>(null);
  const [clientDataLoading, setClientDataLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [approvalSubmitError, setApprovalSubmitError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadClientData = async () => {
      try {
        // Get current MHP and fetch fresh client data from API
        const mhp = await getMe();
        setMhpUser(mhp);
        if (mhp?.id) {
          let effectiveMhpId = mhp.id;
          try {
            const profile = await getMHPById(mhp.id);
            setMhpProfile(profile);
            effectiveMhpId = profile?.mhpId || mhp.id;
          } catch (profileError) {
            console.warn(
              "âš ï¸ Failed to load MHP profile details:",
              profileError,
            );
          }
          const clients = await getClientsByMHP(effectiveMhpId);
          const matches = clients.filter(
            (c) => c.userId === clientId || c.id === clientId,
          );
          const asNumber = (value: string) => {
            const n = Number(value);
            return Number.isFinite(n) ? n : 0;
          };

          const getIsApproved = (row: ClientData) =>
            (row as unknown as { isApproved?: boolean }).isApproved ??
            (row as unknown as { IsApproved?: boolean }).IsApproved ??
            false;

          // Prefer the newest unapproved seek request for this user, otherwise fall back to newest overall.
          const found =
            matches
              .filter((c) => !getIsApproved(c))
              .sort((a, b) => asNumber(b.id) - asNumber(a.id))[0] ??
            matches.sort((a, b) => asNumber(b.id) - asNumber(a.id))[0];
          if (found) {
            console.log("✅ Fresh client data fetched:", found);
            setClientData(found);
          } else {
            console.warn("⚠️ Client not found in list, using passed data");
            if (passedData) {
              const decoded = JSON.parse(
                decodeURIComponent(passedData),
              ) as ClientData;
              setClientData(decoded);
            }
          }
        }
      } catch (error) {
        console.error("❌ Failed to load client data:", error);
        // Fallback to passed data if API fails
        if (passedData) {
          const decoded = JSON.parse(
            decodeURIComponent(passedData),
          ) as ClientData;
          setClientData(decoded);
        } else {
          setClientData(null);
        }
      } finally {
        setClientDataLoading(false);
      }
    };

    loadClientData();
  }, [clientId, passedData]);

  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useInsightsReports(clientId, "7d");
  const {
    data: overviewSummary,
    isLoading: isLoadingOverviewSummary,
    error: overviewSummaryError,
    open: openOverviewSummary,
    close: closeOverviewSummary,
    isOpen: isOverviewSummaryOpen,
  } = useProfileOverviewSummary(clientId);

  const insights = insightsData;

  const [status, setStatus] = useState<ClientStatus>(() =>
    clientData ? deriveStatus(clientData) : "New Request",
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDetails, setApprovalDetails] =
    useState<ApprovalDetails | null>(null);
  const declined = false;

  useEffect(() => {
    if (clientData) {
      setStatus(deriveStatus(clientData));
    }
  }, [clientData]);

  const behavioralPatterns = useMemo(() => {
    if (!insights?.report) return [];
    return insights.report.behavioral_patterns.length
      ? insights.report.behavioral_patterns
      : (insights.distortionsSummary?.patterns ?? []);
  }, [insights]);

  if (clientDataLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Loading client...
          </p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Client not found
          </p>
          <Link
            href="/mentalhealth-professionals"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  async function handleConfirmApproval(details: ApprovalDetails) {
    if (!clientData || !mhpUser) return;

    setApprovalSubmitError(null);
    setIsUpdating(true);
    try {
      const sessionDateTimeIso = toIsoDateTime(
        details.appointmentDate,
        details.appointmentTime,
      );
      const approvedSessionPayload: CreateApprovedSessionPayload = {
        userId: clientData.userId,
        mhpId: mhpProfile?.mhpId ?? mhpUser.id,
        sessionType: "Idle",
        sessionSetting:
          details.sessionType === "online" ? "Session" : "In-Person",
        googleMeetLink:
          details.sessionType === "online" ? details.meetLink.trim() : "",
        sessionDate: sessionDateTimeIso,
        sessionTime: details.appointmentTime,
        // Backend currently validates these as required, so send safe defaults.
        duration: 0,
        attendance: "Attended",
        progress: 0,
        topicsCovered: "Idle",
        // Backend currently validates this as required (non-empty).
        therapistNotes: details.notes.trim().length > 0 ? details.notes.trim() : "N/A",
        // Intentionally empty on approve; can be set later from Session Registry edit.
        nextScheduledSession: null,
      };
      const emailPayload: ApproveSessionEmailPayload = {
        userId: clientData.userId,
        clientName: formatClientNameFromEmail(clientData.email),
        clientEmail: clientData.email,
        messageToClient: details.message,
        sessionType: details.sessionType === "online" ? "Online" : "In-Person",
        googleMeetLink:
          details.sessionType === "online" ? details.meetLink.trim() : "",
        date: sessionDateTimeIso,
        time: details.appointmentTime,
        mhpEmail: details.contactEmail.trim(),
        mhpPhone: details.contactPhone.trim(),
        additionalNotes: details.notes.trim(),
      };

      await createApprovedSessionSafe(approvedSessionPayload);
      await sendApprovedSessionEmail(emailPayload);

      const updatedData = { ...clientData, inSession: true, isApproved: true };
      await updateClientStatus(clientData.id, clientData.userId, updatedData);
      setClientData(updatedData);
      setApprovalDetails(details);
      setShowApprovalModal(false);
      setStatus("In Session");
      console.log("✅ Client approved");
    } catch (error) {
      console.error("❌ Failed to approve client:", error);
      setApprovalSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to approve client. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDecline() {
    if (!clientData) return;

    if (!confirm("Are you sure you want to decline this request?")) return;

    setIsUpdating(true);
    try {
      await deleteClient(clientData.id);
      console.log("✅ Client declined");
      router.push("/mentalhealth-professionals");
    } catch (error) {
      console.error("❌ Failed to decline client:", error);
      alert("Failed to decline client. Please try again.");
      setIsUpdating(false);
    }
  }

  async function handleAdvance() {
    if (!clientData) return;

    setIsUpdating(true);
    try {
      const updatedData = {
        ...clientData,
        inSession: true,
        inFollowUp: true,
      };
      await updateClientStatus(clientData.id, clientData.userId, updatedData);
      setClientData(updatedData);
      setStatus("Follow-up");
      console.log("✅ Client advanced to follow-up");
    } catch (error) {
      console.error("❌ Failed to advance client:", error);
      alert("Failed to advance client. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleReopen() {
    if (!clientData) return;

    setIsUpdating(true);
    try {
      const updatedData = {
        ...clientData,
        inSession: true,
        inFollowUp: false,
      };
      await updateClientStatus(clientData.id, clientData.userId, updatedData);
      setClientData(updatedData);
      setStatus("In Session");
      console.log("✅ Client session reopened");
    } catch (error) {
      console.error("❌ Failed to reopen session:", error);
      alert("Failed to reopen session. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      {showApprovalModal && clientData && (
        <ApprovalModal
          client={{
            id: clientData.id,
            name: formatClientNameFromEmail(clientData.email),
            status,
            rqScore: 0,
            lastCheckin: "",
            concern: "",
          }}
          onClose={() => {
            if (isUpdating) return;
            setApprovalSubmitError(null);
            setShowApprovalModal(false);
          }}
          onConfirm={handleConfirmApproval}
          initialContactEmail={mhpProfile?.email || mhpUser?.email}
          initialContactPhone={mhpProfile?.phoneNumber}
          isSubmitting={isUpdating}
          errorMessage={approvalSubmitError}
        />
      )}

      <ProfileOverviewModal
        isOpen={isOverviewSummaryOpen}
        isLoading={isLoadingOverviewSummary}
        error={overviewSummaryError}
        data={overviewSummary}
        onClose={closeOverviewSummary}
      />

      <div className="min-h-full bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* ── Page Header ── */}
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-white/5 dark:bg-white/3">
            <Link
              href="/mentalhealth-professionals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-teal-600 transition-colors hover:text-teal-700 dark:text-teal-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Clients
            </Link>

            {clientDataLoading ? (
              <div className="mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading client data...
                </p>
              </div>
            ) : clientData ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                  {/* Client info from API */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {clientData.email || "No email"}
                      </h1>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[status]}`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Client Contact Information */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 min-w-[120px]">
                          📧 Email
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {clientData.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 min-w-[120px]">
                          📱 Phone
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {clientData.phoneNumber || "No phone number"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                          💬 Message
                        </span>
                        <textarea
                          value={clientData.message || "No message"}
                          disabled
                          className="min-h-20 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      User ID:{" "}
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {clientData.userId}
                      </span>
                    </p>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic">
                      {STATUS_DESCRIPTIONS[status]}
                    </p>

                    {/* Overview Button */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => void openOverviewSummary()}
                        className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
                      >
                        Overview
                      </button>
                    </div>
                  </div>

                  {/* Action Panel - Compact for Sidebar */}
                  {status === "New Request" && (
                    <div className="w-full shrink-0 lg:w-80">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                          Pending Review
                        </p>
                        <p className="mt-2 text-xs text-amber-700/80 dark:text-amber-400/80">
                          Client is requesting a therapeutic session. Review
                          their insights below before approving or declining.
                        </p>
                        {!approvalDetails ? (
                          <div className="mt-4 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={handleDecline}
                              disabled={isUpdating}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setApprovalSubmitError(null);
                                setShowApprovalModal(true);
                              }}
                              disabled={isUpdating}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve Request
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 dark:border-teal-500/30 dark:bg-teal-500/10">
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                              Approval sent
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepper */}
                <div className="pt-2">
                  <StatusStepper current={status} />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Client data not found
                </p>
              </div>
            )}
          </div>

          {/* ── Action Panel - Full Width for In Session & Follow-up ── */}
          {declined ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-500/20 dark:bg-rose-500/5">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                  Request declined — no further action required.
                </p>
              </div>
            </div>
          ) : status !== "New Request" ? (
            <ActionPanel
              client={{} as MHPClient}
              status={status}
              approvalSent={
                approvalDetails !== null && status !== "New Request"
              }
              onApprove={() => {
                setApprovalSubmitError(null);
                setShowApprovalModal(true);
              }}
              onDecline={handleDecline}
              onAdvance={handleAdvance}
              onReopen={handleReopen}
              isLoading={isUpdating}
            />
          ) : null}

          {/* ── Approval Summary (shown after approval is sent) ── */}
          {approvalDetails && <ApprovalSummaryCard details={approvalDetails} />}

          {/* ── Client Mental Health Profile ── */}
          {insightsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-white/3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading client profile...
              </p>
            </div>
          ) : insightsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-12 text-center dark:border-rose-500/20 dark:bg-rose-500/5">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {insightsError}
              </p>
            </div>
          ) : insights?.report ? (
            <>
              {/* Resilience Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-white/3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Resilience Overview
                </h2>
                <OverviewMetrics overview={insights.report.overview} />
              </div>

              {/* Mental State & Activity */}
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-white/3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Emotional State Distribution
                  </h3>
                  <EmotionalStateDistribution
                    emotionalDistribution={
                      insights.report.emotional_distribution
                    }
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-white/3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Weekly Activity Pattern
                  </h3>
                  <WeeklyActivity
                    weeklyActivity={insights.report.weekly_activity}
                  />
                </div>
              </div>

              {/* Cognitive Patterns */}
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-white/3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Behavioral Patterns
                  </h3>
                  <BehavioralPatterns patterns={behavioralPatterns} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-white/3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Distortion Analysis
                  </h3>
                  <DistortionAnalysis
                    distortionsSummary={insights.distortionsSummary}
                  />
                </div>
              </div>

              {/* Companion Support */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-white/3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  AI Companion Insights
                </h3>
                <CompanionInsights
                  companionInsights={insights.report.companion_insights}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-white/3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No client profile data available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
