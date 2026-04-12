"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Languages,
  LoaderCircle,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  getMe,
  logout,
  updateProfile,
  type SessionUser,
} from "@/api/auth/auth";
import LanguagePreferenceSelector, {
  getSupportedLanguageLabel,
  getSupportedLanguagePreview,
} from "@/components/settings/language-preference-selector";
import { useLanguage } from "@/components/providers/language-provider";
import {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/lib/language";

type PreferenceState = {
  language: SupportedLanguage;
  productUpdates: boolean;
  supportAnnouncements: boolean;
  anonymizedInsights: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [preferences, setPreferences] = useState<PreferenceState>({
    language,
    productUpdates: true,
    supportAnnouncements: true,
    anonymizedInsights: false,
  });

  useEffect(() => {
    setPreferences((current) =>
      current.language === language
        ? current
        : {
            ...current,
            language,
          },
    );
  }, [language]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getMe();

        if (!isMounted) {
          return;
        }

        setProfile(currentUser);
        setFirstName(currentUser.firstname ?? "");
        setLastName(currentUser.lastname ?? "");
        setEmail(currentUser.email ?? "");
        setProfileError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProfile(null);
        setProfileError(
          error instanceof Error
            ? error.message
            : "Failed to load your account.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<PreferenceState>;

      setPreferences((current) => ({
        language: isSupportedLanguage(parsed.language)
          ? parsed.language
          : language,
        productUpdates: parsed.productUpdates ?? current.productUpdates,
        supportAnnouncements:
          parsed.supportAnnouncements ?? current.supportAnnouncements,
        anonymizedInsights:
          parsed.anonymizedInsights ?? current.anonymizedInsights,
      }));
    } catch {
      return;
    }
  }, [language]);

  const initials = useMemo(() => {
    const first = firstName.trim().charAt(0);
    const last = lastName.trim().charAt(0);
    return `${first}${last}`.trim().toUpperCase() || "AM";
  }, [firstName, lastName]);

  const roleSummary =
    profile?.roles?.length && profile.roles.length > 0
      ? profile.roles.join(", ")
      : "Authenticated session";

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSuccess(null);
    setProfileSaveError(null);

    if (!profile) {
      setProfileSaveError("Load your profile first before saving changes.");
      return;
    }

    if (password.length < 3) {
      setProfileSaveError("Enter a password with at least 3 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setProfileSaveError("Password confirmation does not match.");
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await updateProfile({
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email,
        password,
      });

      if (response.user) {
        setProfile(response.user);
        setFirstName(response.user.firstname);
        setLastName(response.user.lastname);
        setEmail(response.user.email);
      }

      setPassword("");
      setConfirmPassword("");
      setProfileSuccess(response.message || "Profile updated successfully.");
    } catch (error) {
      setProfileSaveError(
        error instanceof Error
          ? error.message
          : "Failed to update profile right now.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePreferencesSave() {
    if (typeof window === "undefined") {
      return;
    }

    setIsSavingPreferences(true);
    setPreferencesSuccess(null);

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify(preferences),
    );

    setPreferencesSuccess("Language and consent preferences saved.");
    setIsSavingPreferences(false);
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-full w-full bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.45fr_0.95fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Profile Settings
              </span>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  Account & Preferences
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Keep your profile details current, choose your preferred
                  language, and manage privacy controls from one calm settings
                  surface.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="View account"
                  value={isLoadingProfile ? "..." : "Ready"}
                  detail="Live profile connected"
                  icon={<UserRound className="h-5 w-5" />}
                />
                <MetricCard
                  label="Language preference"
                  value={getSupportedLanguageLabel(preferences.language)}
                  detail="English, Tagalog, or Bisaya"
                  icon={<Languages className="h-5 w-5" />}
                />
                <MetricCard
                  label="Privacy & consent"
                  value={preferences.anonymizedInsights ? "Custom" : "Standard"}
                  detail="Local preference controls"
                  icon={<ShieldCheck className="h-5 w-5" />}
                />
              </div>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Account Snapshot
              </p>

              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                  {isLoadingProfile ? (
                    <LoaderCircle className="h-5 w-5 animate-spin text-slate-300" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                    {isLoadingProfile
                      ? "Loading profile..."
                      : `${firstName} ${lastName}`.trim() || "Your profile"}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {email || "No email loaded"}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {roleSummary}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <SnapshotRow
                  label="Preferred language"
                  value={getSupportedLanguageLabel(preferences.language)}
                />
                <SnapshotRow label="Email" value={email || "No email loaded"} />
                <SnapshotRow label="Roles" value={roleSummary} />
              </div>

              {profileError ? (
                <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {profileError}
                </p>
              ) : null}
            </section>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Update account
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Profile details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update your first name, last name, and password with the live
                profile endpoint. Email stays read-only because the current
                backend update flow still uses it as the account lookup key.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={firstName}
                  onChange={setFirstName}
                  autoComplete="given-name"
                />
                <Field
                  label="Last name"
                  value={lastName}
                  onChange={setLastName}
                  autoComplete="family-name"
                />
              </div>

              <Field
                label="Email address"
                value={email}
                onChange={setEmail}
                disabled
                autoComplete="email"
                icon={<Mail className="h-4 w-4" />}
                helper="Read-only until the backend supports safe email updates."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  autoComplete="new-password"
                  helper="Required by the current update endpoint."
                />
                <Field
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type="password"
                  autoComplete="new-password"
                />
              </div>

              {profileSaveError ? (
                <StatusBanner tone="error" message={profileSaveError} />
              ) : null}
              {profileSuccess ? (
                <StatusBanner tone="success" message={profileSuccess} />
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Saving applies your profile update immediately and replaces
                  your password with the new value above.
                </p>
                <button
                  type="submit"
                  disabled={isSavingProfile || isLoadingProfile}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save account changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Language preferences
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Choose your interface language
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select the language you want AlagaMind to prioritize on this
                  device.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <LanguagePreferenceSelector
                  value={preferences.language}
                  onChange={(language) => {
                    setPreferencesSuccess(null);
                    setLanguage(language);
                    setPreferences((current) => ({
                      ...current,
                      language,
                    }));
                  }}
                />

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Preview copy
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {getSupportedLanguageLabel(preferences.language)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {getSupportedLanguagePreview(preferences.language)}
                  </p>
                </div>

                {preferencesSuccess ? (
                  <StatusBanner tone="success" message={preferencesSuccess} />
                ) : null}

                <button
                  type="button"
                  onClick={() => void handlePreferencesSave()}
                  disabled={isSavingPreferences}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingPreferences ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save language preference
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-3xl border border-rose-200 bg-white shadow-sm">
          <div className="border-b border-rose-100 px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500">
              Danger zone
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Session and account actions
            </h2>
          </div>

          <div className="grid gap-4 px-6 py-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                  <LogOut className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Sign out
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    End the current session and return to the login screen.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Signing out
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Sign out now
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Delete account
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    The current backend still has no delete-account endpoint, so
                    this action stays locked rather than faking a destructive
                    flow in the client.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-100 bg-white px-3 py-3 text-sm text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Wire this area only after the backend exposes a real account
                  deletion endpoint.
                </span>
              </div>

              <button
                type="button"
                disabled
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
                Delete account unavailable
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
          {icon}
        </span>
        <span className="text-right text-lg font-semibold tracking-tight text-slate-950">
          {value}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  disabled,
  icon,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  icon?: ReactNode;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <div className="relative mt-2">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 outline-none transition-colors focus:border-teal-200 focus:bg-white ${
            icon ? "pl-11" : ""
          } ${disabled ? "cursor-not-allowed text-slate-400" : ""}`}
        />
      </div>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </label>
  );
}

function StatusBanner({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : "border-rose-100 bg-rose-50 text-rose-700";

  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      {message}
    </p>
  );
}
