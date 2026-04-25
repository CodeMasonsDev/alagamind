"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Eye,
  EyeOff,
  LoaderCircle,
  LogOut,
  Mail,
  Save,
  X,
} from "lucide-react";
import {
  getMe,
  logout,
  removeProfilePicture,
  uploadProfilePicture,
  updateProfile,
  updatePassword,
  type SessionUser,
} from "@/api/auth/auth";
import LanguagePreferenceSelector, {
  getSupportedLanguageLabel,
  getSupportedLanguagePreview,
} from "@/components/settings/language-preference-selector";
import ThemePreferenceSelector from "@/components/settings/theme-preference-selector";
import { useLanguage } from "@/components/providers/language-provider";
import ProfileAvatar from "@/components/shared/profile-avatar";
import {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/lib/language";
import { DEFAULT_PROFILE_PICTURE_URL } from "@/lib/profile-picture-constants";

type PreferenceState = {
  language: SupportedLanguage;
  productUpdates: boolean;
  supportAnnouncements: boolean;
  anonymizedInsights: boolean;
};

export default function MHPSettingsPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaveError, setPasswordSaveError] = useState<string | null>(
    null,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const hasCustomProfilePicture = Boolean(
    profile?.profileImageUrl &&
    !profile.profileImageUrl.startsWith(DEFAULT_PROFILE_PICTURE_URL),
  );

  function broadcastProfileUpdate() {
    window.dispatchEvent(new CustomEvent("alagamind:profile-updated"));
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSuccess(null);
    setProfileSaveError(null);

    if (!profile) {
      setProfileSaveError("Load your profile first before saving changes.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setProfileSaveError("First name and last name are required.");
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await updateProfile({
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email,
      });

      if (response.user) {
        setProfile(response.user);
        setFirstName(response.user.firstname);
        setLastName(response.user.lastname);
        setEmail(response.user.email);
      }

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

  async function handlePasswordSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSuccess(null);
    setPasswordSaveError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordSaveError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordSaveError("New password and confirmation do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);

      const response = await updatePassword({
        email,
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(response.message || "Password updated successfully.");
    } catch (error) {
      setPasswordSaveError(
        error instanceof Error
          ? error.message
          : "Failed to update password right now.",
      );
    } finally {
      setIsSavingPassword(false);
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
      router.replace("/mentalhealth-professionals/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-full w-full bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Theme Section at Top */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-500 dark:bg-teal-400" />
                MHP Portal
              </span>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:mt-6 sm:text-3xl">
                Account & Preferences
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Keep your profile details current, choose your preferred
                language, and manage privacy controls from one calm settings
                surface.
              </p>
            </div>

            <div className="flex-shrink-0">
              <ThemePreferenceSelector />
            </div>
          </div>
        </section>

        {/* Main Grid: Account Snapshot & Language Preferences Side by Side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account Snapshot */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Account Snapshot
            </p>

            <div className="mt-4 flex items-start gap-4">
              <div className="relative">
                {isLoadingProfile ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800 text-xl font-bold text-white">
                    <LoaderCircle className="h-5 w-5 animate-spin text-slate-300 dark:text-slate-500" />
                  </div>
                ) : (
                  <ProfileAvatar
                    src={profile?.profileImageUrl}
                    alt={`${firstName || "User"} profile picture`}
                    initials={initials}
                    className="h-16 w-16 rounded-2xl"
                    iconClassName="h-5 w-5"
                  />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {isLoadingProfile
                    ? "Loading profile..."
                    : `${firstName} ${lastName}`.trim() || "Your profile"}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {email || "No email loaded"}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
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

            <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Profile picture
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Upload a square photo. We store it locally using your user
                    ID as the filename.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-900 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-500">
                  {isUploadingAvatar ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Upload photo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={isUploadingAvatar || isLoadingProfile}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.currentTarget.value = "";

                      if (!file) {
                        return;
                      }

                      void (async () => {
                        try {
                          setIsUploadingAvatar(true);
                          setAvatarStatus(null);
                          setAvatarError(null);

                          const response = await uploadProfilePicture(file);
                          setProfile((current) =>
                            current
                              ? {
                                  ...current,
                                  profileImageUrl:
                                    response.user?.profileImageUrl ??
                                    response.profileImageUrl,
                                }
                              : current,
                          );
                          setAvatarStatus(
                            response.message ||
                              "Profile picture uploaded successfully.",
                          );
                          broadcastProfileUpdate();
                        } catch (error) {
                          setAvatarError(
                            error instanceof Error
                              ? error.message
                              : "Failed to upload profile picture.",
                          );
                        } finally {
                          setIsUploadingAvatar(false);
                        }
                      })();
                    }}
                  />
                </label>

                <button
                  type="button"
                  disabled={
                    isUploadingAvatar ||
                    isRemovingAvatar ||
                    isLoadingProfile ||
                    !hasCustomProfilePicture
                  }
                  onClick={() => {
                    void (async () => {
                      try {
                        setIsRemovingAvatar(true);
                        setAvatarStatus(null);
                        setAvatarError(null);

                        const response = await removeProfilePicture();
                        setProfile((current) =>
                          current
                            ? {
                                ...current,
                                profileImageUrl:
                                  response.user?.profileImageUrl ??
                                  response.profileImageUrl,
                              }
                            : current,
                        );
                        setAvatarStatus(
                          response.message ||
                            "Profile picture removed successfully.",
                        );
                        broadcastProfileUpdate();
                      } catch (error) {
                        setAvatarError(
                          error instanceof Error
                            ? error.message
                            : "Failed to remove profile picture.",
                        );
                      } finally {
                        setIsRemovingAvatar(false);
                      }
                    })();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRemovingAvatar ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Removing
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Remove photo
                    </>
                  )}
                </button>
              </div>

              {avatarError ? (
                <p className="mt-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
                  {avatarError}
                </p>
              ) : null}
              {avatarStatus ? (
                <p className="mt-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                  {avatarStatus}
                </p>
              ) : null}
            </div>

            {profileError ? (
              <p className="mt-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
                {profileError}
              </p>
            ) : null}
          </section>

          {/* Language Preferences */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Language preferences
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Choose your interface language
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Preview copy
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {getSupportedLanguageLabel(preferences.language)}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-900 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* Update Account & Change Password Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Update Account */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Update account
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Profile details
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update your display name. Email stays read-only as it is the
                account lookup key.
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
              />

              {profileSaveError ? (
                <StatusBanner tone="error" message={profileSaveError} />
              ) : null}
              {profileSuccess ? (
                <StatusBanner tone="success" message={profileSuccess} />
              ) : null}

              <button
                type="submit"
                disabled={isSavingProfile || isLoadingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Change Password */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Security
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Change password
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your current password and choose a new one.
              </p>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-5 px-6 py-6">
              <Field
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                showPasswordToggle
                passwordVisible={showCurrentPassword}
                onTogglePassword={() => setShowCurrentPassword((v) => !v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  showPasswordToggle
                  passwordVisible={showNewPassword}
                  onTogglePassword={() => setShowNewPassword((v) => !v)}
                />
                <Field
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  showPasswordToggle
                  passwordVisible={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                />
              </div>

              {passwordSaveError ? (
                <StatusBanner tone="error" message={passwordSaveError} />
              ) : null}
              {passwordSuccess ? (
                <StatusBanner tone="success" message={passwordSuccess} />
              ) : null}

              <button
                type="submit"
                disabled={isSavingPassword || isLoadingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPassword ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Updating
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-3xl border border-rose-200 dark:border-rose-900/30 bg-white dark:bg-slate-900 shadow-sm">
          <div className="border-b border-rose-100 dark:border-rose-900/30 px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500 dark:text-rose-400">
              Sign out
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm dark:border dark:border-slate-700">
                  <LogOut className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Sign out
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    End the current session and return to the login screen.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </section>
      </main>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-slate-100">
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
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  icon?: ReactNode;
  helper?: string;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="relative mt-2">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 dark:bg-slate-800/50 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-teal-200 dark:focus:border-teal-400/50 focus:bg-white dark:focus:bg-slate-800 ${
            icon ? "pl-11" : ""
          } ${showPasswordToggle ? "pr-11" : ""} ${disabled ? "cursor-not-allowed text-slate-400" : ""}`}
        />
        {showPasswordToggle ? (
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {passwordVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : null}
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
      ? "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"
      : "border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400";

  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      {message}
    </p>
  );
}
