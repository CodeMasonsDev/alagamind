"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  Shield,
  Smile,
  X,
  Bot,
  BookOpen,
  Dumbbell,
  MessageSquare,
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
import { getMe, SessionUser } from "@/api/auth/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  return (
    <div className="flex w-full min-h-full flex-col bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 2xl:max-w-[1600px] overflow-visible">
        <WellnessIntelligence />
        <IntegratedWellnessSuite />
      </div>
    </div>
  );
}

function WellnessIntelligence() {
  const emotions = [
    { label: "Stressed", intensity: 3.2 },
    { label: "Tired", intensity: 4.8 },
    { label: "Focused", intensity: 0 },
    { label: "Calm", intensity: 6.4 },
    { label: "Energized", intensity: 8.6 },
  ];

  const [profile, setProfile] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getMe();
        console.log("from dashboard", currentUser);

        if (isMounted) setProfile(currentUser);
      } catch {
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
  const [resilienceError, setResilienceError] = useState(false);

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
    if (!res) {
      setResilienceError(true);
      return null;
    }
    setResilienceError(false);
    setResilienceData(res);
  };

  useEffect(() => {
    if (!userId) return;

    const run = async () => {
      try {
        await Promise.all([
          GetUserState(userId),
          FetchRQScore(userId, true),
          refreshFocusMomentum(userId),
        ]);
      } catch {
        setResilienceError(true);
      }
    };

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshFocusMomentum]);

  const activeEmotion =
    emotions.find((emotion) => emotion.label === selectedEmotion) ??
    emotions[2];
  const greeting = getTimeGreeting();
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
    if (userId) {
      void Promise.allSettled([
        CalculateRQ(userId),
        refreshFocusMomentum(userId),
      ]).then((results) => {
        if (results.some((r) => r.status === "rejected")) {
          setResilienceError(true);
        }
      });
    }
  };

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showToast, toastKey]);

  return (
    <>
      <section className="flex flex-col gap-6 ">
        <div>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="shrink-0">
              <Image
                src="/greeting.png"
                alt="Greeting illustration"
                width={144}
                height={144}
                className="h-25 w-25 object-contain sm:h-28 sm:w-28 lg:h-36 lg:w-36"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
                {formatGreetingDate()}
              </p>
              <h1 className="mt-1 text-xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-100 sm:mt-2 sm:text-[2rem] lg:text-[2.4rem]">
                Good {greeting.toLowerCase()}
                {profile?.firstname ? `, ${profile.firstname}` : ""}!
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Here&apos;s your current wellbeing snapshot across check-ins,
                resilience, and focus momentum.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
            className="col-span-1 lg:col-span-2 flex cursor-pointer flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm transition-colors hover:border-teal-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold tracking-widest text-slate-900 dark:text-slate-100 uppercase">
                Quick Check-In
              </h3>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
              <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Current Emotional State
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {emotions.map(({ label }) => (
                  <EmotionBtn
                    key={label}
                    label={label}
                    isActive={selectedEmotion === label}
                    onClick={() => setShowCheckInModal(true)}
                  />
                ))}
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                    Intensity
                  </span>
                  <span className="text-sm font-bold text-teal-500">
                    {displayIntensity.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-400 transition-all duration-300"
                    style={{ width: intensityProgress }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Resilience Quotient */}
          <div
            className={`flex flex-col rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm ${resilienceTier.surface}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold tracking-widest text-slate-900 dark:text-slate-100 uppercase">
                Resilience Quotient
              </h3>
              <Shield size={16} className={resilienceTier.icon} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative my-4 min-h-[22px]">
              {resilienceError && !resilienceData ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Unable to load score
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-slate-600">
                    Check your connection and try again
                  </span>
                </div>
              ) : (
                <>
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
                    <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {resilienceScore}
                    </span>
                    <span className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-400 uppercase">
                      Score
                    </span>
                    <span
                      className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${resilienceTier.soft}`}
                    >
                      {resilienceTier.label}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
                  Adaptive Capacity
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {resilienceProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${resilienceTier.accent}`}
                  style={{ width: `${resilienceProgress}%` }}
                ></div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <span>{resilienceUpdatedLabel}</span>
                {hasDeferredExercises ? <span></span> : null}
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
          className={`pointer-events-auto w-[min(92vw,420px)] rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 shadow-lg transition-all duration-300 ${
            showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
              <Check size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-teal-800">Success</p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
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
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  const emotionAsset = EMOTION_IMAGE_MAP[label];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border py-4 transition-all ${
        isActive
          ? "border-teal-400 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shadow-sm"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
      }`}
    >
      {emotionAsset ? (
        <Image
          src={emotionAsset.src}
          alt={emotionAsset.alt}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <Smile size={24} strokeWidth={isActive ? 2.5 : 2} />
      )}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

const EMOTION_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  Stressed: { src: "/stressed_emoji.png", alt: "Stressed emotion" },
  Tired: { src: "/tired_emoji.png", alt: "Tired emotion" },
  Focused: { src: "/focused_emoji.png", alt: "Focused emotion" },
  Calm: { src: "/calm_emoji.png", alt: "Calm emotion" },
  Energized: { src: "/energized_emoji.png", alt: "Energized emotion" },
};

const SUITE_DATA = [
  {
    title: "AI Companion",
    description:
      "Continue your supportive session with AlagaMind AI for real-time guidance.",
    icon: Bot,
    badge: "AI-LIVE",
    badgeColor:
      "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50",
    iconBg: "bg-teal-50 dark:bg-teal-900/20 text-teal-500 dark:text-teal-400",
    stats: [
      { label: "Mode", value: "Empathetic" },
      { label: "Support", value: "Emotional" },
      { label: "Language", value: "Multilingual" },
    ],
    btnText: "CHAT NOW",
    href: "/ai-companion",
    btnIcon: MessageSquare,
    btnStyle:
      "bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-500",
  },
  {
    title: "Journal & Reflections",
    description:
      "Review your insights or start a new reflection session to offload cognitive load.",
    icon: BookOpen,
    badge: "REFLECT",
    badgeColor:
      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800",
    iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400",
    stats: [
      { label: "Sentiment", value: "Auto-Analyzed" },
      { label: "Analysis", value: "Sentiment" },
      { label: "Reframe", value: "Suggested" },
    ],
    btnText: "WRITE NOW",
    href: "/journals-reflections/write",
    btnIcon: PenLine,
    btnStyle:
      "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800",
  },
  {
    title: "Exercises",
    description:
      "Browse the full library of mindfulness and grounding tools for nervous system care.",
    icon: Dumbbell,
    badge: "WELLNESS",
    badgeColor:
      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800",
    iconBg:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400",
    stats: [
      { label: "Available", value: "Grounding & More" },
      { label: "Duration", value: "5–15 min" },
      { label: "Difficulty", value: "All Levels" },
    ],
    btnText: "EXPLORE LIBRARY",
    href: "/exercises",
    btnIcon: LayoutGrid,
    btnStyle:
      "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800",
  },
];

function IntegratedWellnessSuite() {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Integrated Wellness Suite
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Core clinical pathways for personalized mental optimization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {SUITE_DATA.map((card, idx) => {
          const Icon = card.icon;
          const BtnIcon = card.btnIcon;
          const handleNavigate = () => {
            if (card.href) {
              router.push(card.href);
            }
          };

          return (
            <article
              key={idx}
              role={card.href ? "link" : undefined}
              tabIndex={card.href ? 0 : undefined}
              onClick={card.href ? handleNavigate : undefined}
              onKeyDown={
                card.href
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleNavigate();
                      }
                    }
                  : undefined
              }
              className={`flex h-full min-h-[320px] flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors ${
                card.href
                  ? "cursor-pointer hover:border-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2"
                  : ""
              }`}
            >
              <div className="mb-6 flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon size={24} />
                </div>
                <span
                  className={`rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                {card.title}
              </h3>

              <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {card.description}
              </p>

              <div className="mb-8 grid grid-cols-3 gap-4">
                {card.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="flex min-w-0 flex-col gap-1">
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                      {stat.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                aria-hidden="true"
                className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold tracking-widest uppercase pointer-events-none select-none ${card.btnStyle}`}
              >
                {card.btnText}
                <BtnIcon size={16} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getTimeGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Morning";
  }

  if (currentHour < 18) {
    return "Afternoon";
  }

  return "Evening";
}

function formatGreetingDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
