"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookHeart,
  MessageCircleHeart,
  Moon,
  Sun,
  Monitor,
  Menu,
  X,
  CheckCircle2,
  Globe,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";

let hydrated = false;

function subscribeHydration(callback: () => void) {
  if (!hydrated) {
    queueMicrotask(() => {
      hydrated = true;
      callback();
    });
  }
  return () => {};
}

function getHydrationSnapshot() {
  return hydrated;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    () => false,
  );

  const themes = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "System", Icon: Monitor },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/60 bg-white/70 text-slate-700 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/85 dark:border-white/14 dark:bg-white/10 dark:text-white/80 dark:shadow-none dark:hover:bg-white/16"
        aria-label="Toggle theme"
      >
        {!isHydrated ? (
          <Monitor className="h-4 w-4 opacity-70" />
        ) : theme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : theme === "light" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
      </button>

      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -8,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 top-11 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white/85 p-1 shadow-2xl backdrop-blur-2xl dark:border-white/12 dark:bg-slate-950/95"
      >
        {themes.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTheme(id);
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isHydrated && theme === id
                ? "bg-teal-50 text-teal-700 dark:bg-teal-400/12 dark:text-teal-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function BackgroundGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <div
      className="pointer-events-none fixed inset-0"
      onMouseMove={(e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Light mode - clean professional SAAS background */}
      <div className="absolute inset-0 bg-white dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:hidden" />

      {/* Dark mode */}
      <div className="hidden absolute inset-0 dark:block bg-[#03080f]" />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]" />
      <div className="hidden dark:block absolute -left-[14%] top-[10%] h-184 w-184 rounded-full bg-teal-500/14 blur-[155px]" />
      <div className="hidden dark:block absolute left-[18%] top-[40%] h-136 w-136 rounded-full bg-cyan-500/10 blur-[165px]" />
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-700 dark:block dark:opacity-60"
        style={{
          background: `radial-gradient(820px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20,184,166,0.12), transparent 40%)`,
        }}
      />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.34)_56%,rgba(2,6,23,0.78)_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[18px] dark:backdrop-blur-[86px]" />
    </div>
  );
}

function getImagePath(baseName: string, theme: string | undefined) {
  // Determine if dark mode based on theme
  let isDark = false;

  if (theme === "dark") {
    isDark = true;
  } else if (theme === "system" || !theme) {
    // For system or undefined, check preference
    if (typeof window !== "undefined") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  }

  if (isDark) {
    return `/homepage-assests/${baseName}`;
  }

  // Light mode filename mapping (some files have different names)
  const lightModeFileNameMap: { [key: string]: string } = {
    "journals.png": "journal.png",
    "insights.png": "insights.png", // fallback to same name if it exists
  };

  const lightFileName = lightModeFileNameMap[baseName] || baseName;
  return `/homepage-assests/feature-lightmode/${lightFileName}`;
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-white/8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"
          >
            <img
              src="/alagamind.png?v=2"
              alt="AlagaMind logo"
              className="h-7 w-7 object-contain"
            />
            <span className="hidden sm:inline">AlagaMind</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="relative text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300 hover:text-slate-900 dark:hover:text-white group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-full transition-all duration-300 ease-out" />
            </Link>
            <Link
              href="#showcase"
              className="relative text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300 hover:text-slate-900 dark:hover:text-white group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-full transition-all duration-300 ease-out" />
            </Link>
            <Link
              href="#developers"
              className="relative text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300 hover:text-slate-900 dark:hover:text-white group"
            >
              Developers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-full transition-all duration-300 ease-out" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
            >
              Register Now
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-200/60 dark:border-white/10 py-4 space-y-3"
          >
            <Link
              href="#features"
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#showcase"
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Product
            </Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const { theme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    () => false,
  );

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-teal-600" />
            <span className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              AI-Powered Mental Wellness
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
            Your personal AI companion for mental wellness
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            AlagaMind combines AI Companion intelligent, journaling, and
            Exercises, to help you build lasting mental health and resilience.
          </p>

          <p className="text-base text-slate-600 dark:text-slate-400 mb-10">
            Available in English, Tagalog, and Bisaya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-8 py-4 font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
            >
              Start Today
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#showcase"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/50 px-8 py-4 font-semibold text-slate-900 backdrop-blur transition-all hover:bg-white/70 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Explore Alagamind
            </Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-8 text-sm">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Always Available
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                24/7 Emotional Support
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Personalized
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Tailored to Your Needs
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                3 Languages
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                English, Tagalog, Bisaya
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white shadow-lg dark:bg-slate-950 dark:shadow-2xl dark:shadow-teal-500/10 overflow-hidden hover:shadow-xl dark:hover:shadow-teal-500/20 transition-shadow duration-300">
            {isHydrated && (
              <Image
                src={getImagePath("dashboard.png", theme)}
                alt="AlagaMind Dashboard"
                width={500}
                height={600}
                className="w-full h-auto hover:scale-105 transition-transform duration-300"
                priority
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: MessageCircleHeart,
      title: "AI Companion",
      description: "24/7 supportive conversations powered by advanced AI",
      cta: "Chat Now",
    },
    {
      icon: BookHeart,
      title: "Smart Journaling",
      description: "Track emotions with AI-powered sentiment analysis",
      cta: "Start Writing",
    },
    {
      icon: Zap,
      title: "CBT Exercises",
      description: "Evidence-based exercises tailored to your needs",
      cta: "Explore",
    },
    {
      icon: TrendingUp,
      title: "Pattern Insights",
      description: "Understand your emotional trends over time",
      cta: "View Insights",
    },
    {
      icon: Globe,
      title: "Multilingual",
      description: "Support in English, Tagalog, and Bisaya",
      cta: "Select Language",
    },
    {
      icon: Sparkles,
      title: "Resilience Score",
      description: "Track your mental health progress with RQ metrics",
      cta: "Track Progress",
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Powerful Features
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Everything you need for comprehensive mental wellness support
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            viewport={{ once: true, margin: "-100px" }}
            className="group relative rounded-2xl border border-slate-200/60 bg-white/70 p-8 backdrop-blur transition-all hover:border-teal-200/60 hover:shadow-xl hover:shadow-teal-500/10 dark:border-white/10 dark:bg-white/10 dark:hover:border-teal-400/30"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300 group-hover:scale-110 transition-transform">
              <feature.icon className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {feature.description}
            </p>

            <button className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:gap-3 transition-all">
              {feature.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ProductShowcase() {
  const { theme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    () => false,
  );

  const showcases = [
    {
      title: "Chat with Your AI Companion",
      description:
        "Get supportive, empathetic conversations tailored to your emotional state",
      image: "chat.png",
      features: [
        "Real-time responses",
        "Emotional understanding",
        "Multilingual support",
      ],
    },
    {
      title: "Guided Exercises",
      description:
        "Step-by-step CBT exercises proven to help manage stress and anxiety",
      image: "exercises.png",
      features: [
        "30+ exercises",
        "All difficulty levels",
        "5-15 minute sessions",
      ],
    },
    {
      title: "Journal & Track",
      description: "Record thoughts privately with AI sentiment analysis",
      image: "journals.png",
      features: ["Secure storage", "Privacy first", "Easy organization"],
    },
    {
      title: "Pattern Insights",
      description: "Understand your emotional trends with intelligent analysis",
      image: "insights.png",
      features: [
        "Auto-analyzed patterns",
        "Progress tracking",
        "Visual charts",
      ],
    },
    {
      title: "Sentiment Analysis",
      description: "AI-powered emotional analysis of your journal entries",
      image: "journal_sentiment_analysis.png",
      features: ["Emotion detection", "Trend analysis", "Historical data"],
    },
    {
      title: "Cognitive Reframing",
      description: "Learn techniques to reframe negative thought patterns",
      image: "reframing.png",
      features: ["Guided reframing", "CBT techniques", "Progress tracking"],
    },
  ];

  return (
    <section
      id="showcase"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Explore Alagamind
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          A comprehensive platform designed for your mental wellness journey
        </p>
      </motion.div>

      <div className="space-y-20">
        {showcases.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              i % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {item.title}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {item.description}
              </p>

              <div className="space-y-3">
                {item.features.map((feature, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: j * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className={`relative ${i % 2 === 1 ? "lg:order-1" : ""}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white shadow-lg dark:bg-slate-950 dark:shadow-2xl dark:shadow-teal-500/10 overflow-hidden hover:shadow-xl dark:hover:shadow-teal-500/20 transition-all duration-300">
                {isHydrated && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Image
                      src={getImagePath(item.image, theme)}
                      alt={item.title}
                      width={500}
                      height={600}
                      className="w-full h-auto"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const developers = [
  { name: "Edriane Diaz", role: "Project Manager", image: "/devs/dev1.png" },
  {
    name: "Carl Conrad Declaro",
    role: "Full-Stack Developer",
    image: "/devs/dev2.png",
  },
  { name: "Edrian Sangco", role: "QA Tester", image: "/devs/dev3.png" },
  {
    name: "Evan Gabriel Batac",
    role: "Front-End Developer",
    image: "/devs/dev4.png",
  },
];

function DevelopersSection() {
  return (
    <section
      id="developers"
      className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-14"
      >
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
          The People Behind It
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Meet the Developers
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          A dedicated team building tools for better mental wellness in the
          Philippines.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {developers.map((dev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            viewport={{ once: true, margin: "-80px" }}
            className="group flex flex-col items-center text-center"
          >
            <div className="relative mb-4 h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-3xl border-2 border-slate-200/60 shadow-lg transition-all duration-300 group-hover:border-teal-300 group-hover:shadow-xl group-hover:shadow-teal-500/10 dark:border-white/10 dark:group-hover:border-teal-500/50">
              <Image
                src={dev.image}
                alt={dev.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">
              {dev.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {dev.role}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white/70 to-white/50 p-12 text-center backdrop-blur dark:border-white/10 dark:from-white/10 dark:to-white/5"
      >
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Start Your Wellness Journey Today
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Join thousands of people building resilience and mental wellness with
          AlagaMind.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-8 py-4 font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/50 px-8 py-4 font-semibold text-slate-900 backdrop-blur transition-all hover:bg-white/70 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200/60 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/8">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2026 AlagaMind. All rights reserved.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Available in English, Tagalog, and Bisaya.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <BackgroundGradient />

      <div className="relative z-20">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <ProductShowcase />
        <DevelopersSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
