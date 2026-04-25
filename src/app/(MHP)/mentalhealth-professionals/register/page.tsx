"use client";

import { login } from "@/api/auth/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useId, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ArrowLeft, Monitor, Moon, Sun } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";

let mhpRegisterThemeToggleHydrated = false;

function subscribeHydration(callback: () => void) {
  if (!mhpRegisterThemeToggleHydrated) {
    queueMicrotask(() => {
      mhpRegisterThemeToggleHydrated = true;
      callback();
    });
  }
  return () => {};
}

function getHydrationSnapshot() {
  return mhpRegisterThemeToggleHydrated;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    () => false,
  );

  const themes = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "System", Icon: Monitor },
  ] as const;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/60 bg-white/70 text-slate-700 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/85 dark:border-white/14 dark:bg-white/10 dark:text-white/80 dark:shadow-none dark:hover:bg-white/16"
        aria-label="Toggle theme"
      >
        {!hydrated ? (
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
          y: isOpen ? 0 : -10,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-12 w-36 overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/12 dark:bg-slate-950/95"
      >
        {themes.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTheme(id);
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
              hydrated && theme === id
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

function BackgroundBlur({ x, y }: { x: number; y: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[#03080f]" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]" />
      <div className="absolute -left-[14%] top-[10%] hidden h-[46rem] w-[46rem] rounded-full bg-teal-500/14 blur-[155px] dark:block" />
      <div className="absolute left-[18%] top-[40%] hidden h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[165px] dark:block" />
      <div className="absolute right-[-12%] top-[14%] hidden h-[40rem] w-[40rem] rounded-full bg-indigo-500/18 blur-[170px] dark:block" />
      <div className="absolute right-[6%] bottom-[-16%] hidden h-[34rem] w-[34rem] rounded-full bg-violet-500/14 blur-[160px] dark:block" />
      <div
        className="absolute inset-0 hidden opacity-0 transition-opacity duration-700 dark:block dark:opacity-80"
        style={{
          background: `radial-gradient(820px circle at ${x}px ${y}px, rgba(20,184,166,0.18), transparent 42%)`,
        }}
      />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.34)_56%,rgba(2,6,23,0.78)_100%)]" />
      <div className="login-grain absolute inset-0 opacity-[0.06] dark:opacity-[0.12]" />
      <div className="absolute inset-0 backdrop-blur-[18px] dark:backdrop-blur-[86px]" />
    </div>
  );
}

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export default function MHPRegisterPage() {
  const router = useRouter();
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const termsId = useId();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post(
        `${BASEURLDOTNETAPI}api/MHPSeekControllers/Register`,
        {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        },
      );

      if (!res.data) {
        throw new Error("Registration failed");
      }

      try {
        await login({
          email: formData.email,
          password: formData.password,
          clientId: "Client1",
        });
        router.replace("/mentalhealth-professionals");
        router.refresh();
      } catch {
        router.replace("/mentalhealth-professionals/login?registered=1");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputRing = (key: string) =>
    focusedField === key
      ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.10)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
      : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]";

  return (
    <main
      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      className="relative flex min-h-screen w-full overflow-x-hidden overflow-y-auto bg-transparent font-sans text-slate-900 dark:text-white transition-colors duration-700 lg:overflow-hidden"
    >
      <BackgroundBlur x={mousePosition.x} y={mousePosition.y} />

      <div className="absolute left-6 top-6 z-50 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex  items-center gap-3 rounded-full border border-slate-200/60 bg-white/65 px-5.5 py-1 text-sm text-slate-800 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/80 dark:border-white/12 dark:bg-white/8 dark:text-white/86 dark:shadow-none dark:hover:bg-white/12"
        >
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl">
            <Image
              src="/alagamind_logo.png"
              alt="AlagaMind logo"
              width={32}
              height={32}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="tracking-tight">
            <span className="font-semibold">Alaga</span>
            <span className="font-light">Mind</span>
          </span>
        </Link>
      </div>

      <div className="absolute right-6 top-6 z-50 flex  gap-3">
        <Link
          href="/mentalhealth-professionals/login"
          className="hidden items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/65 px-3.5 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/80 dark:border-white/12 dark:bg-white/8 dark:text-white/78 dark:shadow-none dark:hover:bg-white/12 sm:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full justify-center px-6 py-10">
        <div className="flex w-full max-w-3xl flex-col justify-center">
          <section className="mb-10 text-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.p
                variants={fadeUp}
                className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-teal-300"
              >
                Mental Health Professional
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-white lg:text-[3rem]"
              >
                Register your practice
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-[52ch] mx-auto text-[15px] leading-relaxed text-slate-600 dark:text-slate-400/90"
              >
                Join AlagaMind as a mental health professional. Manage your
                clients, track progress, and provide exceptional care through
                our professional platform.
              </motion.p>
            </motion.div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            className="relative w-full rounded-[2.25rem] border border-white/14 bg-white/68 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.03),0_0_20px_rgba(255,255,255,0.72)_inset] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-800/42 dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] sm:p-12"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[2.25rem] bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/[0.08]"
            />
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            >
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <motion.div
                  variants={fadeUp}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div className="space-y-2.5">
                    <label
                      htmlFor={firstNameId}
                      className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400"
                    >
                      First Name
                    </label>
                    <div
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${inputRing("firstName")}`}
                    >
                      <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          focusedField === "firstName"
                            ? "opacity-100"
                            : "opacity-0"
                        } bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`}
                      />
                      <input
                        id={firstNameId}
                        type="text"
                        placeholder="Dr. Alex"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label
                      htmlFor={lastNameId}
                      className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400"
                    >
                      Last Name
                    </label>
                    <div
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${inputRing("lastName")}`}
                    >
                      <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          focusedField === "lastName"
                            ? "opacity-100"
                            : "opacity-0"
                        } bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`}
                      />
                      <input
                        id={lastNameId}
                        type="text"
                        placeholder="Rodriguez"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => setFocusedField(null)}
                        className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label
                    htmlFor={emailId}
                    className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400"
                  >
                    Professional Email
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${inputRing("email")}`}
                  >
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        focusedField === "email" ? "opacity-100" : "opacity-0"
                      } bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`}
                    />
                    <input
                      id={emailId}
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2.5">
                  <label
                    htmlFor={passwordId}
                    className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400"
                  >
                    Password
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${inputRing("password")}`}
                  >
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        focusedField === "password"
                          ? "opacity-100"
                          : "opacity-0"
                      } bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`}
                    />
                    <input
                      id={passwordId}
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      minLength={6}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="relative w-full bg-white px-5 py-4 text-sm font-medium tracking-widest text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="flex items-start gap-4 px-2 py-2"
                >
                  <div className="relative flex h-5 items-center">
                    <input
                      id={termsId}
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700/50"
                      required
                    />
                  </div>
                  <label
                    htmlFor={termsId}
                    className="cursor-pointer text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400"
                  >
                    I acknowledge the{" "}
                    <Link
                      href="#"
                      className="font-bold text-teal-600 transition-colors hover:text-teal-700 hover:underline dark:text-teal-300 dark:hover:text-teal-200"
                    >
                      Professional Terms
                    </Link>{" "}
                    and agree to the platform guidelines.
                  </label>
                </motion.div>

                {error ? (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-700 backdrop-blur-md dark:bg-rose-500/[0.08] dark:text-rose-300"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300">
                      !
                    </span>
                    {error}
                  </motion.p>
                ) : null}

                <motion.div variants={fadeUp} className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreed}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {isSubmitting ? "REGISTERING..." : "CREATE ACCOUNT"}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {"->"}
                    </span>
                  </button>
                </motion.div>
              </form>

              <motion.div
                variants={fadeUp}
                className="mt-10 text-center text-xs font-semibold tracking-wider"
              >
                <span className="text-slate-500">
                  ALREADY HAVE AN ACCOUNT?{" "}
                </span>
                <Link
                  href="/mentalhealth-professionals/login"
                  className="text-teal-600 transition-colors hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                >
                  SIGN IN
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/42">
            <span className="flex justify-center items-center ">
              <span className="text-2xl">©</span> 2026 AlagaMind
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-400/40 dark:bg-white/20" />
            <Link
              href="#"
              className="transition-colors hover:text-slate-700 dark:hover:text-white/70"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-slate-700 dark:hover:text-white/70"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
