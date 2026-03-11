"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  ArrowUpRight,
  Download,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
  Zap,
} from "lucide-react";

// ----------------------------------------------------------------------
// MAIN MOOD & TRENDS PAGE
// ----------------------------------------------------------------------

export default function MoodTrendsPage() {
  return (
    <div className="flex flex-col w-full min-h-full pb-10 bg-white">
      <TopBar />

      <div className="flex flex-col gap-8 max-w-7xl 2xl:max-w-[1600px] p-8">
        {/* Summary Cards Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            label="CURRENT EMOTIONAL STATE"
            value="Stable / Reflective"
            subtext="Correlates with high-frequency journaling sessions."
            icon={<Activity size={20} className="text-slate-400" />}
          />
          <SummaryCard
            label="EMOTIONAL VARIANCE"
            value="-12%"
            subtext="Consistent improvement over the last 30 days."
            icon={<TrendingDown size={20} className="text-teal-500" />}
            valueColor="text-teal-500"
            valueSuffix="REDUCTION IN VOLATILITY"
          />
          <SummaryCard
            label="DOMINANT THEME"
            value="Self-Compassion"
            subtext="Appeared in 68% of reflections this week."
            icon={<Layers size={20} className="text-slate-400" />}
          />
        </section>

        {/* Main Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LineChartCard />
          </div>
          <div>
            <DonutChartCard />
          </div>
        </section>

        {/* Predictive Banner */}
        <ForecastBanner />

        {/* Footer Security Strip */}
        <FooterStrip />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: HEADER & TOP BAR
// ----------------------------------------------------------------------

function TopBar() {
  const [activeFilter, setActiveFilter] = useState("30 DAYS");

  const filters = ["7 DAYS", "30 DAYS", "YEAR"];

  return (
    <header className="flex sticky top-0 z-10 items-center justify-between border-b bg-white border-slate-200 px-8 py-4">
      <div className="flex items-center gap-6">
        <h1 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
          MOOD INTELLIGENCE & TRENDS
        </h1>

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 text-[10px] font-bold tracking-wider rounded-md transition-all ${
                activeFilter === filter
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-teal-700 transition-colors shadow-sm">
          <Sparkles size={14} />
          ANALYZE PATTERNS
        </button>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: SUMMARY CARDS
// ----------------------------------------------------------------------

interface SummaryCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  valueColor?: string;
  valueSuffix?: string;
}

function SummaryCard({
  label,
  value,
  subtext,
  icon,
  valueColor = "text-slate-900",
  valueSuffix,
}: SummaryCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden group hover:border-teal-100 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </span>
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50 transition-colors">
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`text-2xl font-bold tracking-tight ${valueColor}`}>
            {value}
          </span>
          {valueSuffix && (
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              {valueSuffix}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed italic">{subtext}</p>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: ANALYZE PATTERNS / LINE CHART
// ----------------------------------------------------------------------

function LineChartCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col h-full min-h-[440px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
            LONGITUDINAL SENTIMENT ANALYSIS
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Real-time mood fluctuation mapping over 30 days
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              MOOD SCORE
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              BASELINE
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative mt-4">
        {/* Y-axis (hidden or simplified) */}

        {/* Static Baseline */}
        <div className="absolute top-[60%] left-0 w-full border-t border-dashed border-slate-200 z-0"></div>

        {/* SVG Chart Area */}
        <div className="w-full h-full min-h-[220px] relative z-10">
          <svg
            viewBox="0 0 1000 300"
            className="w-full h-full overflow-visible"
          >
            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 100}
                x2="1000"
                y2={i * 100}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}

            {/* Smooth Teal Line Path */}
            <path
              d="M0,200 C100,210 150,120 250,140 C350,160 400,240 500,210 C600,180 650,80 750,110 C850,140 900,160 1000,150"
              fill="none"
              stroke="#0d9488"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {[
              { x: 0, y: 200 },
              { x: 250, y: 140 },
              { x: 500, y: 210 },
              { x: 750, y: 110 },
              { x: 1000, y: 150 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="6"
                fill="white"
                stroke="#0d9488"
                strokeWidth="3"
              />
            ))}
          </svg>
        </div>

        {/* X-axis Labels */}
        <div className="flex justify-between mt-8">
          {["WK 1", "WK 2", "WK 3", "WK 4"].map((label) => (
            <span
              key={label}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: MOOD DISTRIBUTION / DONUT CHART
// ----------------------------------------------------------------------

function DonutChartCard() {
  const data = [
    { label: "Focused", value: 42, color: "bg-teal-500", stroke: "#0d9488" },
    { label: "Calm", value: 31, color: "bg-teal-300", stroke: "#5eead4" },
    {
      label: "High-Arousal",
      value: 15,
      color: "bg-slate-300",
      stroke: "#cbd5e1",
    },
    {
      label: "Low-Energy",
      value: 12,
      color: "bg-slate-200",
      stroke: "#e2e8f0",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col h-full min-h-[440px]">
      <div className="mb-10">
        <h2 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
          MOOD DISTRIBUTION
        </h2>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          Percentage of time in emotional zones
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {/* SVG Donut */}
        <div className="relative w-48 h-48 mb-8">
          <svg
            viewBox="0 0 36 36"
            className="w-full h-full transform -rotate-90"
          >
            {/* Background Circle */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="3.5"
            />

            {/* Slices (simplified static) */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#0d9488"
              strokeWidth="3.5"
              strokeDasharray="42, 100"
              strokeDashoffset="0"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#5eead4"
              strokeWidth="3.5"
              strokeDasharray="31, 100"
              strokeDashoffset="-42"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="3.5"
              strokeDasharray="15, 100"
              strokeDashoffset="-73"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.5"
              strokeDasharray="12, 100"
              strokeDashoffset="-88"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              42%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FOCUSED
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full flex flex-col gap-3">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between group cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: FORECAST BANNER
// ----------------------------------------------------------------------

function ForecastBanner() {
  return (
    <section className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-900/20">
          <Zap className="text-white fill-white" size={28} />
        </div>

        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            Predictive Emotional Forecast
          </h3>
          <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
            Based on current trends, your emotional stability is projected to
            increase by 8% next week. AlagaMind AI recommends maintaining your
            current focus routine.
          </p>
        </div>
      </div>

      <button className="relative z-10 px-8 py-3.5 bg-white text-slate-900 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-slate-100 transition-all flex items-center gap-2 group whitespace-nowrap">
        VIEW PREDICTION DETAILS
        <ArrowUpRight
          size={16}
          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
        />
      </button>
    </section>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS: FOOTER STRIP
// ----------------------------------------------------------------------

function FooterStrip() {
  return (
    <footer className="mt-8 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-6 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
        <div className="flex items-center gap-1.5">
          <Shield size={10} className="text-teal-500" />
          ENTERPRISE SECURITY CORE
        </div>
        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
        <div>END-TO-END ENCRYPTION</div>
        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
        <div>HIPAA COMPLIANT ENVIRONMENT</div>
      </div>
    </footer>
  );
}
