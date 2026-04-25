"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/api/auth/auth";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  rightSlot,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUpVariants} className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all ${
            error
              ? "border-rose-300 bg-rose-50/50 text-slate-900 placeholder-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-slate-100 dark:placeholder-rose-400 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
              : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-white/5 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
          }`}
        />
        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AdminLoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegistered = searchParams.has("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password, clientId: "Client1" });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit}
      className="w-full space-y-6"
    >
      {isRegistered && (
        <motion.div
          variants={fadeUpVariants}
          className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/50 px-4 py-3 text-sm text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
        >
          <div className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
          Account created. Welcome aboard!
        </motion.div>
      )}

      {error && (
        <motion.div
          variants={fadeUpVariants}
          className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </motion.div>
      )}

      <Field
        label="Email Address"
        type="email"
        placeholder="admin@example.com"
        value={email}
        onChange={setEmail}
        error={!!error && !email}
      />

      <Field
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={setPassword}
        error={!!error && !password}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        }
      />

      <motion.button
        variants={fadeUpVariants}
        type="submit"
        disabled={isLoading}
        className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div
          className="absolute inset-0 translate-x-full transition-transform duration-500 group-hover:translate-x-0 bg-white/20"
          aria-hidden
        />
        <div className="relative flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign In"}
        </div>
      </motion.button>
    </motion.form>
  );
}
