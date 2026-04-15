"use client";

import { login, register } from "@/api/auth/auth";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

/* ── Shared Theme Toggle ── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute right-6 top-6 h-10 w-10 rounded-xl border border-slate-200/50 bg-white/30 dark:border-white/[0.06] dark:bg-white/[0.02]" />
    );
  }

  const themes = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "System", Icon: Monitor },
  ];

  return (
    <div className="absolute right-6 top-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Moon className="h-[18px] w-[18px]" strokeWidth={2.5} />
        ) : theme === "light" ? (
          <Sun className="h-[18px] w-[18px]" strokeWidth={2.5} />
        ) : (
          <Monitor className="h-[18px] w-[18px]" strokeWidth={2.5} />
        )}
      </button>

      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10, pointerEvents: isOpen ? "auto" : "none" }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-3 flex w-[140px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.05)] backdrop-blur-3xl dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      >
        {themes.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTheme(id);
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              theme === id
                ? "bg-white text-teal-700 shadow-sm dark:bg-white/10 dark:text-teal-400 dark:shadow-none"
                : "text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            }`}
          >
            <Icon className="h-[14px] w-[14px]" strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </motion.div>
      
      {/* Invisible overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Shared Stardust ── */
const Stardust = () => {
  const [stars, setStars] = useState<{ top: number; left: number; duration: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    setStars(
      [...Array(30)].map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 20,
        delay: Math.random() * 5,
        size: Math.random() * 2 + 1,
      }))
    );
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white dark:bg-teal-200"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            opacity: 0.1,
            boxShadow: "0 0 8px 2px rgba(255,255,255,0.4)",
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 0.4, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

/* ── animation helpers ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await register(formData);

      try {
        await login({
          email: formData.email,
          password: formData.password,
        });

        router.replace("/dashboard");
        router.refresh();
      } catch {
        router.replace("/login?registered=1");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] font-sans dark:bg-none dark:bg-[#030612] transition-colors duration-700"
    >
      <ThemeToggle />

      {/* ── Interactive Cursor Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-700 dark:opacity-100"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 184, 166, 0.12), transparent 40%)`,
        }}
      />

      {/* ── Background Layers ── */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block transition-colors duration-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(11,48,56,0.8)_0%,transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.15)_0%,transparent_50%)] opacity-0 dark:opacity-100 transition-opacity duration-700" />
      </div>

      <div className="hidden opacity-60 dark:block dark:opacity-100 transition-opacity duration-700">
        <Stardust />
      </div>

      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden mix-blend-multiply dark:block dark:mix-blend-normal transition-all duration-700">
        <div className="animate-login-orb-1 absolute -left-32 top-1/4 h-[600px] w-[600px] rounded-full bg-cyan-200/40 blur-[130px] dark:bg-teal-500/15" />
        <div className="animate-login-orb-2 absolute -right-24 bottom-1/4 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[110px] dark:bg-indigo-900/40" />
        <div className="animate-login-orb-3 absolute left-1/2 top-1/5 h-[300px] w-[300px] -translate-x-1/3 rounded-full bg-teal-100/50 blur-[100px] dark:bg-cyan-600/15" />
      </div>

      {/* ── Left hero panel ── */}
      <div className="relative z-10 hidden w-[55%] flex-col justify-center px-16 lg:flex xl:px-24">
        <motion.div>
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm dark:bg-gradient-to-br dark:from-teal-500/20 dark:to-cyan-500/20 dark:text-teal-400 dark:shadow-[0_0_15px_rgba(20,184,166,0.15)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 h-5 w-5"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                <path d="M19 3v4" />
                <path d="M21 5h-4" />
              </svg>
            </div>
            <span className="text-xl tracking-tight text-slate-800 drop-shadow-sm dark:text-white/90">
              <span className="font-extrabold">Alaga</span>
              <span className="font-light">Mind</span>
            </span>
          </div>

          <div className="max-w-[480px]">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-teal-400">
              Mental Wellness Intelligence
            </p>
            <h1 className="text-[3.2rem] font-medium leading-[1.1] tracking-tight text-slate-900 drop-shadow-sm dark:text-white xl:text-[4rem]">
              Your journey
              <br />
              <span className="font-bold text-slate-900 dark:bg-gradient-to-r dark:from-teal-300 dark:via-cyan-300 dark:to-indigo-300 dark:bg-clip-text dark:text-transparent">
                starts here.
              </span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400/90">
              Join thousands improving their cognitive wellbeing through
              AI-guided exercises and precise resilience tracking.
            </p>

            <div className="mt-12 flex flex-col gap-4">
              {[
                { icon: "🛡️", label: "Private & Secure Architecture" },
                { icon: "⚡", label: "Instant Access to Features" },
                { icon: "🌐", label: "Available Anywhere" },
              ].map((f, idx) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 + 0.5 }}
                  className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300/50 text-base shadow-sm backdrop-blur-sm dark:bg-white/5">
                    {f.icon}
                  </span>
                  {f.label}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right side — Signup form area ── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center bg-transparent px-6 py-12 transition-colors duration-700 lg:w-[45%] lg:px-12">
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-600 shadow-[0_0_15px_rgba(20,184,166,0.3)] dark:text-teal-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              <path d="M19 3v4" />
              <path d="M21 5h-4" />
            </svg>
          </div>
          <span className="text-2xl tracking-tight text-slate-900 drop-shadow-sm dark:text-white/90">
            <span className="font-extrabold">Alaga</span>
            <span className="font-light">Mind</span>
          </span>
        </div>

        <section className="w-full max-w-[480px]">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full rounded-[2.5rem] border border-slate-200 bg-white/60 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.03),0_0_20px_rgba(255,255,255,0.8)_inset] backdrop-blur-3xl transition-colors duration-700 dark:border-slate-700/50 dark:bg-slate-800/40 dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] sm:p-12"
          >
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="mb-10 text-center">
                <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-800 drop-shadow-sm dark:text-white">
                  Join AlagaMind
                </h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Create your account in seconds.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <label className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                      First Name
                    </label>
                    <div
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                        focusedField === "firstName"
                          ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                          : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
                      }`}
                    >
                      <div className={`absolute inset-0 transition-opacity duration-500 ${focusedField === "firstName" ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`} />
                      <input
                        type="text"
                        placeholder="Jordan"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                      Last Name
                    </label>
                    <div
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                        focusedField === "lastName"
                          ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                          : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
                      }`}
                    >
                      <div className={`absolute inset-0 transition-opacity duration-500 ${focusedField === "lastName" ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`} />
                      <input
                        type="text"
                        placeholder="Henderson"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Email
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                      focusedField === "email"
                        ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                        : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
                    }`}
                  >
                    <div className={`absolute inset-0 transition-opacity duration-500 ${focusedField === "email" ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`} />
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                      focusedField === "password"
                        ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                        : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
                    }`}
                  >
                    <div className={`absolute inset-0 transition-opacity duration-500 ${focusedField === "password" ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      minLength={6}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="relative w-full bg-white px-5 py-4 text-sm font-medium tracking-widest text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-start gap-4 px-2 py-2">
                  <div className="relative flex h-5 items-center">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700/50"
                      required
                    />
                  </div>
                  <label htmlFor="terms" className="cursor-pointer text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                    I acknowledge to the{" "}
                    <a href="#" className="font-bold text-teal-600 transition-colors hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300">
                      Terms of Resilience
                    </a>
                  </label>
                </motion.div>

                {error ? (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-700 backdrop-blur-md dark:bg-rose-500/[0.08] dark:text-rose-400"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      !
                    </span>
                    {error}
                  </motion.p>
                ) : null}

                <motion.div variants={fadeUp} className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {isSubmitting ? "CREATING..." : "CREATE ACCOUNT"}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </motion.div>
              </form>

              <motion.div variants={fadeUp} className="mt-10 text-center text-xs font-semibold tracking-wider">
                <span className="text-slate-500">ALREADY HAVE AN ACCOUNT? </span>
                <a
                  href="/login"
                  className="text-teal-600 transition-colors hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  SIGN IN
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5 opacity-80 mix-blend-overlay">
            <svg className="h-3 w-3 text-slate-500 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            HIPAA READY
          </div>
          <div className="flex items-center gap-1.5 opacity-80 mix-blend-overlay">
            <svg className="h-3 w-3 text-slate-500 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            AES-256
          </div>
          <div className="opacity-80 mix-blend-overlay">© 2026 ALGMND</div>
        </div>
      </div>
    </main>
  );
}
