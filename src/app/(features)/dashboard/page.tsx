"use client";

import React from "react";
import {
  Bell,
  Clock,
  Shield,
  Zap,
  Frown,
  Meh,
  Smile,
  Target,
  Bot,
  BookOpen,
  Dumbbell,
  MessageSquare,
  Lock,
  LayoutGrid,
  PenLine,
} from "lucide-react";

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
    <header className="flex items-center justify-between pb-4 border-b border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
        <span className="flex items-center gap-2 text-teal-500">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          System Status: Nominal
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-500 bg-slate-100 rounded-md">
          <Clock size={14} />
          Secure Session: 14:22 Remaining
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------------
// SECTION 1: WELLNESS INTELLIGENCE
// ----------------------------------------------------------------------

function WellnessIntelligence() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Wellness Intelligence
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time emotional tracking and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Card 1: Quick Check-In */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col col-span-2">
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
              <EmotionBtn icon={Frown} label="Stressed" />
              <EmotionBtn icon={Meh} label="Tired" />
              <EmotionBtn icon={Smile} label="Focused" isActive />
              <EmotionBtn icon={Smile} label="Calm" />
              <EmotionBtn icon={Zap} label="Energized" />
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Intensity
                </span>
                <span className="text-sm font-bold text-teal-500">7.5</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Resilience Quotient */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
              Resilience Quotient
            </h3>
            <Shield size={16} className="text-slate-300" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative my-4">
            {/* SVG Circular Progress */}
            <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400"
                strokeDasharray="82, 100"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                82
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                Score
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-semibold text-slate-400">
                Activity Completion
              </span>
              <span className="text-xs font-bold text-slate-900">94%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: "94%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Focus Momentum */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
              Focus Momentum
            </h3>
            <Target size={16} className="text-slate-300" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                12
              </span>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Day Streak
              </span>
            </div>
            <p className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-teal-600 uppercase mt-1">
              <Zap size={10} /> Top 5% Enterprise Wide
            </p>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 mt-8">
            {/* Simple Bar Chart */}
            {[40, 60, 50, 70, 60, 20, 30].map((height, i) => {
              const isCurrent = i === 4; // Friday in this example
              const labels = ["M", "T", "W", "T", "F", "S", "S"];
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="w-full h-24 bg-slate-50 rounded-sm relative flex items-end">
                    <div
                      className={`w-full rounded-sm ${isCurrent ? "bg-teal-500" : "bg-teal-200 opacity-60"}`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <span
                    className={`text-[10px] font-bold ${isCurrent ? "text-teal-600" : "text-slate-400"}`}
                  >
                    {labels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmotionBtn({
  icon: Icon,
  label,
  isActive,
}: {
  icon: any;
  label: string;
  isActive?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
        isActive
          ? "border-teal-400 bg-teal-50/30 text-teal-600 shadow-sm"
          : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
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
        <div className="text-xs font-bold tracking-widest text-slate-900 uppercase border-b-2 border-slate-900 pb-1">
          Hub Status: Optimized
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

              <button
                className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${card.btnStyle}`}
              >
                {card.btnText}
                <BtnIcon size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
