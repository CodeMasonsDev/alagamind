import Link from "next/link";
import {
  CheckCircle2,
  Database,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  SettingsBadge,
  SettingsHero,
  SettingsPageShell,
  SettingsPanel,
  SettingsPanelBody,
  SettingsSectionHeading,
} from "@/components/settings/settings-page-shell";

const protectionLayers = [
  {
    title: "Authenticated routes",
    description:
      "Protected feature pages stay behind the active session middleware boundary before the workspace shell renders.",
    icon: ShieldCheck,
    tone: "teal" as const,
  },
  {
    title: "Local preference storage",
    description:
      "Language and consent preferences are currently saved per device, which keeps them scoped to the current browser profile.",
    icon: Database,
    tone: "violet" as const,
  },
  {
    title: "Session-aware access",
    description:
      "Settings, privacy, support, and core wellness flows all assume a signed-in account before sensitive surfaces open.",
    icon: KeyRound,
    tone: "amber" as const,
  },
  {
    title: "Share by intent",
    description:
      "Insights are designed to be reviewed in-app first instead of automatically broadcast to third parties.",
    icon: EyeOff,
    tone: "rose" as const,
  },
];

const dataLifecycle = [
  {
    label: "Journals",
    purpose: "Reflection history, sentiment analysis, and reframing support.",
    boundary:
      "Lives within the signed-in account context and should only be exposed through explicit user navigation.",
  },
  {
    label: "Check-ins",
    purpose: "Mood timeline, hourly intensity patterns, and RQ contribution.",
    boundary:
      "Used for personal trend views and should stay tied to the same account identity that created them.",
  },
  {
    label: "Reframes",
    purpose: "Saved cognitive shifts, distortion tracking, and recurrence reporting.",
    boundary:
      "Should remain editable and reviewable by the user, with any export flow staying deliberate and visible.",
  },
  {
    label: "AI sessions",
    purpose: "Conversation continuity, session themes, and dominant emotion previews.",
    boundary:
      "Needs the clearest retention and deletion story because this is the highest-density sensitive text surface.",
  },
];

const userSafeguards = [
  "Use a unique password and avoid shared-device auto-fill when accessing private journals or sessions.",
  "Sign out when using a school, clinic, or family computer, especially before leaving the dashboard open.",
  "Avoid placing full names, phone numbers, or school IDs inside screenshots when sharing reports for feedback.",
  "Treat export and deletion actions as verified backend flows, not front-end-only buttons, to prevent accidental data loss.",
];

const roadmapActions = [
  {
    title: "Privacy controls",
    detail:
      "Language preference and anonymized-insights settings already live under Account & Preferences.",
    href: "/settings",
    cta: "Open settings",
  },
  {
    title: "Session sign-out",
    detail:
      "The current account screen is still the correct place for ending the active session safely.",
    href: "/settings",
    cta: "Review session actions",
  },
  {
    title: "Deletion & export",
    detail:
      "These flows should stay support-assisted or backend-verified until destructive operations are fully implemented.",
    href: "/help-support",
    cta: "View support options",
  },
];

export default function PrivacyPage() {
  return (
    <SettingsPageShell>
      <SettingsHero
        badge="Privacy & Security"
        title="Trust boundaries, safeguards, and data lifecycle"
        description="This page explains how the current product surfaces sensitive information, where privacy choices belong, and which areas should stay behind verified backend actions instead of front-end-only controls."
        actions={
          <>
            <SettingsBadge tone="teal">Live route</SettingsBadge>
            <SettingsBadge tone="amber">Informational surface</SettingsBadge>
          </>
        }
        metrics={[
          {
            label: "Route protection",
            value: "Authenticated",
            detail: "Feature pages are gated before the app shell renders.",
            tone: "teal",
          },
          {
            label: "Consent controls",
            value: "In settings",
            detail: "Language and anonymized-insight choices live on the account screen.",
            tone: "violet",
          },
          {
            label: "Sensitive actions",
            value: "Verified",
            detail: "Deletion and export should stay backend-driven, not cosmetic.",
            tone: "amber",
          },
          {
            label: "Support path",
            value: "Available",
            detail: "Users need a clear escalation route for privacy requests and account issues.",
            tone: "rose",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <SettingsPanel>
          <SettingsSectionHeading
            eyebrow="Protection layers"
            title="What the current product posture communicates well"
            description="These are the trust signals already visible in the app structure and should stay consistent as the backend grows."
          />

          <SettingsPanelBody className="grid gap-4 sm:grid-cols-2">
            {protectionLayers.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <SettingsBadge tone={item.tone}>{item.title}</SettingsBadge>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </SettingsPanelBody>
        </SettingsPanel>

        <SettingsPanel>
          <SettingsSectionHeading
            eyebrow="Next best actions"
            title="Where privacy controls should live"
            description="Keep privacy choices route-specific and deliberate. Avoid burying them inside unrelated feature screens."
          />

          <SettingsPanelBody className="space-y-4">
            {roadmapActions.map((action) => (
              <article
                key={action.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {action.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {action.detail}
                </p>
                <Link
                  href={action.href}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ScanSearch className="h-4 w-4" />
                  {action.cta}
                </Link>
              </article>
            ))}
          </SettingsPanelBody>
        </SettingsPanel>
      </div>

      <SettingsPanel>
        <SettingsSectionHeading
          eyebrow="Data lifecycle"
          title="How each sensitive surface should be framed"
          description="Different data types need different retention and deletion expectations. Journals and AI session logs should not be treated like simple UI preferences."
        />

        <SettingsPanelBody className="grid gap-4 lg:grid-cols-2">
          {dataLifecycle.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-950">
                  {item.label}
                </p>
                <SettingsBadge tone="slate">Sensitive</SettingsBadge>
              </div>

              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Purpose
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {item.purpose}
              </p>

              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Boundary
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {item.boundary}
              </p>
            </article>
          ))}
        </SettingsPanelBody>
      </SettingsPanel>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <SettingsPanel>
          <SettingsSectionHeading
            eyebrow="Security habits"
            title="User-facing safeguards worth reinforcing"
            description="A mental health product should teach protective behavior, not just expose controls."
          />

          <SettingsPanelBody className="space-y-4">
            {userSafeguards.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-7 text-slate-600">{item}</p>
              </div>
            ))}
          </SettingsPanelBody>
        </SettingsPanel>

        <SettingsPanel className="border-rose-200">
          <SettingsSectionHeading
            eyebrow="High-risk actions"
            title="Keep destructive flows explicit"
            description="Delete, export, and retention changes matter more than cosmetic toggles. These actions should remain highly visible and verified."
          />

          <SettingsPanelBody className="space-y-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    Export and delete should not be fake buttons
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    If the backend cannot verify ownership, queue the request or
                    route it through support instead of simulating a completed
                    destructive action.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    Rule of thumb
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Privacy UI should describe boundaries clearly, but any action
                    that changes real access or real data must be backed by a
                    trustworthy server flow.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/help-support"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Contact support for privacy requests
            </Link>
          </SettingsPanelBody>
        </SettingsPanel>
      </div>
    </SettingsPageShell>
  );
}
