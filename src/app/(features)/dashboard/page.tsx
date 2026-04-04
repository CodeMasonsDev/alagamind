"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type LucideIcon,
  Bell,
  Check,
  Clock,
  Shield,
  Zap,
  Frown,
  Meh,
  Smile,
  X,
  Bot,
  BookOpen,
  Dumbbell,
  MessageSquare,
  Lock,
  LayoutGrid,
  PenLine,
} from "lucide-react";
import { CheckInModal } from "@/components/dashboard/check-in-modal";
import { FocusMomentumCard } from "@/components/dashboard/focus-momentum-card";
import { useDashboardMetrics } from "@/components/providers/dashboard-metrics-provider";
import { GetCurrentState } from "@/api/check-in";
import {
  calculateRQ,
  formatResilienceUpdate,
  getResilienceProgressPercent,
  getResilienceTier,
  getQuotientResilienceScore,
  type ResilienceQuotientResponse,
} from "@/api/resilience-quitient";
import { DEFAULT_USER_ID } from "@/lib/current-user";
import { getMe, SessionUser } from "@/api/auth/auth";

// ----------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ----------------------------------------------------------------------

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full min-h-full pb-10">
      <TopBar />

      <div className="flex flex-col gap-10  max-w-7xl 2xl:max-w-[1600px] p-8">
        <WellnessIntelligence />
        <IntegratedWellnessSuite />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: HEADER & LAYOUT
// ----------------------------------------------------------------------

function TopBar() {
  return (
    <header className="flex sticky top-0  z-10 items-center justify-between pb-4 border-b bg-white border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
        {/* <span className="flex items-center gap-2 text-teal-500">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          System Status: Nominal
        </span> */}
        <span className="text-slate-300">/</span>
        <span className="text-slate-900">Dashboard</span>
      </div>

      {/* <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-500 bg-slate-100 rounded-md">
          <Clock size={14} />
          Secure Session: 14:22 Remaining
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
          <Bell size={20} />
        </button>
      </div> */}
    </header>
  );
}

// ----------------------------------------------------------------------
// SECTION 1: WELLNESS INTELLIGENCE
// ----------------------------------------------------------------------

function WellnessIntelligence() {
  const emotions = [
    { label: "Stressed", icon: Frown, intensity: 3.2 },
    { label: "Tired", icon: Meh, intensity: 4.8 },
    { label: "Focused", icon: Smile, intensity: 0 },
    { label: "Calm", icon: Smile, intensity: 6.4 },
    { label: "Energized", icon: Zap, intensity: 8.6 },
  ];

  const [profile, setProfile] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getMe();
        console.log("from dashboard", currentUser);

        if (isMounted) setProfile(currentUser);
      } catch (error) {
        if (isMounted) setProfile(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const userId = profile?.id;
  const {
    focusMomentum,
    isFocusMomentumLoading,
    isFocusMomentumRefreshing,
    focusMomentumError,
    refreshFocusMomentum,
  } = useDashboardMetrics();

  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [lastLoggedIntensity, setLastLoggedIntensity] = useState<number | null>(
    null,
  );
  const [resilienceData, setResilienceData] =
    useState<ResilienceQuotientResponse | null>(null);

  const GetUserState = async (userId: string) => {
    const res = await GetCurrentState(userId);
    if (!res) {
      return null;
    }
    const emotionLabels = ["Stressed", "Tired", "Focused", "Calm", "Energized"];
    setSelectedEmotion(emotionLabels[res.state]);
    setLastLoggedIntensity(res.intensity);
    console.log("state", res.state);
    setToastKey(res.intensity);
  };

  const CalculateRQ = async (userId: string) => {
    const rq = await calculateRQ({ userId, trigger_source: "checkin" });
    if (!rq) return;
    setResilienceData(rq);
  };

  const FetchRQScore = async (userId: string, refresh: boolean) => {
    const res = await getQuotientResilienceScore({ userId, refresh });
    if (!res) return null;

    console.log("QR score:", res.score);

    setResilienceData(res);
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([
        GetUserState(userId),
        FetchRQScore(userId, false),
        refreshFocusMomentum(userId),
      ]);
    };

    if (userId) {
      void run();
    }
  }, [refreshFocusMomentum, userId]);

  const activeEmotion =
    emotions.find((emotion) => emotion.label === selectedEmotion) ??
    emotions[2];
  const displayIntensity = lastLoggedIntensity ?? activeEmotion.intensity;
  const intensityProgress = `${displayIntensity * 10}%`;
  const resilienceScore = resilienceData?.score ?? 0;
  const resilienceStrokeValue = Math.max(0, Math.min(100, resilienceScore));
  const resilienceProgress = getResilienceProgressPercent(resilienceData);
  const resilienceTier = getResilienceTier(resilienceScore);
  const resilienceUpdatedLabel = formatResilienceUpdate(
    resilienceData?.calculated_at,
  );
  const hasDeferredExercises =
    resilienceData?.deferred_components?.includes("exercises") ?? false;

  const handleCheckInSuccess = (state: number, intensity: number) => {
    const emotionLabels = ["Stressed", "Tired", "Focused", "Calm", "Energized"];
    setSelectedEmotion(emotionLabels[state] ?? "Focused");
    setLastLoggedIntensity(intensity);
    setShowToast(true);
    setToastKey((prev) => prev + 1);
    void Promise.allSettled([
      CalculateRQ(userId),
      refreshFocusMomentum(userId),
    ]);
  };

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showToast, toastKey]);

  return (
    <>
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Wellness Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time emotional tracking and performance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6  ">
          {/* Card 1: Quick Check-In */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowCheckInModal(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowCheckInModal(true);
              }
            }}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col col-span-2 cursor-pointer hover:border-teal-200 transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
                Quick Check-In
              </h3>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Last Logged: 2H Ago
              </span>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase text-center mb-2">
                Current Emotional State
              </p>
              <div className="grid grid-cols-5 gap-2">
                {emotions.map(({ icon, label }) => (
                  <EmotionBtn
                    key={label}
                    icon={icon}
                    label={label}
                    isActive={selectedEmotion === label}
                    onClick={() => setShowCheckInModal(true)}
                  />
                ))}
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Intensity
                  </span>
                  <span className="text-sm font-bold text-teal-500">
                    {displayIntensity.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-300"
                    style={{ width: intensityProgress }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Resilience Quotient */}
          <div
            className={`p-6 border rounded-2xl shadow-sm flex flex-col  ${resilienceTier.surface}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
                Resilience Quotient
              </h3>
              <Shield size={16} className={resilienceTier.icon} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative my-4 min-h-[22px]">
              <div
                className={`absolute inset-8 rounded-full blur-3xl opacity-60 ${resilienceTier.glow}`}
              />
              {/* SVG Circular Progress */}
              <svg
                viewBox="0 0 36 36"
                className="w-32 h-32 transform -rotate-90 relative"
              >
                <path
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={resilienceTier.ring}
                  strokeDasharray={`${resilienceStrokeValue}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {resilienceScore}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  Score
                </span>
                <span
                  className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${resilienceTier.soft}`}
                >
                  {resilienceTier.label}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  Adaptive Capacity
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {resilienceProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${resilienceTier.accent}`}
                  style={{ width: `${resilienceProgress}%` }}
                ></div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>{resilienceUpdatedLabel}</span>
                {hasDeferredExercises ? (
                  <span>Exercises coming soon</span>
                ) : null}
              </div>
            </div>
          </div>

          <FocusMomentumCard
            data={focusMomentum}
            isLoading={isFocusMomentumLoading}
            isRefreshing={isFocusMomentumRefreshing}
            error={focusMomentumError}
          />
        </div>
      </section>

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        userId={userId}
        onSuccess={handleCheckInSuccess}
      />

      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div
          key={toastKey}
          className={`pointer-events-auto w-[min(92vw,420px)] bg-teal-50 border border-teal-200 rounded-2xl shadow-lg px-5 py-4 transition-all duration-300 ${
            showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-teal-800">Success</p>
              <p className="text-sm text-slate-600 mt-0.5">
                Mood log saved successfully. Your dashboard metrics are
                refreshing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-teal-500 hover:text-teal-700 transition-colors"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function EmotionBtn({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
        isActive
          ? "border-teal-400 bg-teal-50 text-teal-600 shadow-sm"
          : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
      }`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

// ----------------------------------------------------------------------
// SECTION 2: INTEGRATED WELLNESS SUITE
// ----------------------------------------------------------------------

const SUITE_DATA = [
  {
    title: "AI Companion",
    description:
      "Continue your supportive session with AlagaMind AI for real-time guidance.",
    icon: Bot,
    badge: "AI-LIVE",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
    iconBg: "bg-teal-50 text-teal-500",
    stats: [
      { label: "Status", value: "Ready", isStatus: true },
      { label: "Type", value: "Conversational" },
      { label: "Latency", value: "<200ms" },
    ],
    btnText: "CHAT NOW",
    href: "/ai-companion",
    btnIcon: MessageSquare,
    btnStyle: "bg-slate-900 text-white hover:bg-slate-800",
  },
  {
    title: "Journal & Reflections",
    description:
      "Review your insights or start a new reflection session to offload cognitive load.",
    icon: BookOpen,
    badge: "LOG-04",
    badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
    iconBg: "bg-blue-50 text-blue-500",
    stats: [
      { label: "Last Entry", value: "Today" },
      { label: "Streak", value: "5 Days" },
      {
        label: "Privacy",
        value: "Encrypted",
        icon: Lock,
        iconColor: "text-blue-500",
      },
    ],
    btnText: "WRITE NOW",
    href: "/journals-reflections/write",
    btnIcon: PenLine,
    btnStyle:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  },
  {
    title: "Exercises ",
    description:
      "Browse the full library of mindfulness and grounding tools for nervous system care.",
    icon: Dumbbell,
    badge: "LIB-42",
    badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
    iconBg: "bg-purple-50 text-purple-500",
    stats: [
      { label: "Protocols", value: "12 Available" },
      { label: "Format", value: "Multi-modal" },
      { label: "Updates", value: "New Added", color: "text-purple-600" },
    ],
    btnText: "EXPLORE LIBRARY",
    btnIcon: LayoutGrid,
    btnStyle:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  },
];

function IntegratedWellnessSuite() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Integrated Wellness Suite
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Core clinical pathways for personalized mental optimization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {SUITE_DATA.map((card, idx) => {
          const Icon = card.icon;
          const BtnIcon = card.btnIcon;

          return (
            <div
              key={idx}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon size={24} />
                </div>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md border ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed flex-1">
                {card.description}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {card.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                      {stat.label}
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1  "text-slate-900"`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {card.href ? (
                <Link
                  href={card.href}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${card.btnStyle}`}
                >
                  {card.btnText}
                  <BtnIcon size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${card.btnStyle}`}
                >
                  {card.btnText}
                  <BtnIcon size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
