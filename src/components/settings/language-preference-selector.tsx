import { Check, Languages } from "lucide-react";
import type { SupportedLanguage } from "@/lib/language";

const LANGUAGE_OPTIONS: Array<{
  value: SupportedLanguage;
  label: string;
  subtitle: string;
  preview: string;
}> = [
  {
    value: "english",
    label: "English",
    subtitle: "Default product language",
    preview: "How are you feeling today?",
  },
  {
    value: "tagalog",
    label: "Tagalog",
    subtitle: "Filipino interface copy",
    preview: "Kumusta ang pakiramdam mo ngayon?",
  },
  {
    value: "bisaya",
    label: "Bisaya",
    subtitle: "Cebuano-friendly interface",
    preview: "Kumusta imong gibati karon?",
  },
];

export function getSupportedLanguageLabel(value: SupportedLanguage) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.value === value)?.label ??
    "English"
  );
}

export function getSupportedLanguagePreview(value: SupportedLanguage) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.value === value)?.preview ??
    LANGUAGE_OPTIONS[0].preview
  );
}

export default function LanguagePreferenceSelector({
  value,
  onChange,
}: {
  value: SupportedLanguage;
  onChange: (value: SupportedLanguage) => void;
}) {
  return (
    <div className="grid gap-3">
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`rounded-2xl border p-4 text-left transition-all ${
              isActive
                ? "border-teal-300 dark:border-teal-500/50 bg-teal-50/80 dark:bg-teal-900/20 shadow-[0_10px_30px_-24px_rgba(13,148,136,0.45)] dark:shadow-[0_10px_30px_-24px_rgba(13,148,136,0.25)]"
                : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isActive
                      ? "bg-white dark:bg-teal-500/20 text-teal-600 dark:text-teal-400"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  } shadow-sm dark:shadow-none dark:border dark:border-slate-700`}
                >
                  <Languages className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {option.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {option.subtitle}
                  </p>
                  <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-500">
                    Preview: {option.preview}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  isActive
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
