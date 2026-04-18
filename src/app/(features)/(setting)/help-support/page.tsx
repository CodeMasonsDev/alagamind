import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  HelpCircle,
  LifeBuoy,
  MessageSquareHeart,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";
import {
  SettingsBadge,
  SettingsHero,
  SettingsPageShell,
  SettingsPanel,
  SettingsPanelBody,
  SettingsSectionHeading,
} from "@/components/settings/settings-page-shell";

const quickPaths = [
  {
    title: "Account and preferences",
    description:
      "Update profile details, language, consent choices, and session settings.",
    href: "/settings",
    icon: Wrench,
  },
  {
    title: "AI companion",
    description:
      "Continue a conversation, review tone and language behavior, or inspect session flow.",
    href: "/ai-companion",
    icon: MessageSquareHeart,
  },
  {
    title: "Journals and reflections",
    description:
      "Review entries, archives, and sentiment-related journaling surfaces.",
    href: "/journals-reflections/archive",
    icon: BookOpen,
  },
  {
    title: "Exercises and protocols",
    description:
      "Open grounding, breathing, reframing, and behavioral activation tools.",
    href: "/exercises",
    icon: Sparkles,
  },
];

const supportChannels = [
  {
    title: "Product support",
    detail:
      "Best for broken UI, route issues, failed saves, and confusing workflow behavior.",
    expectation: "Target response window: within 1 business day.",
    tone: "teal" as const,
  },
  {
    title: "Privacy requests",
    detail:
      "Use when the concern involves account access, data boundaries, or deletion/export handling.",
    expectation:
      "Route through the privacy workflow before making irreversible changes.",
    tone: "violet" as const,
  },
  {
    title: "Clinical safety boundary",
    detail:
      "The app can support reflection, but it should not present itself as emergency or crisis care.",
    expectation:
      "Escalate to real human services for urgent risk or immediate danger.",
    tone: "rose" as const,
  },
];

const faqItems = [
  {
    question: "Where should users change language and privacy preferences?",
    answer:
      "Those controls belong in Account & Preferences, not inside feature-specific screens. That keeps consent and language boundaries easy to find and easy to audit.",
  },
  {
    question: "Why is my export or delete option not on the privacy page yet?",
    answer:
      "Destructive flows should not be front-end-only decorations. They need verified ownership checks, backend confirmation, and a recovery story before they are exposed as real product actions.",
  },
  {
    question: "Can the AI companion replace professional care?",
    answer:
      "No. It can help with reflection and structured exercises, but it should not be framed as emergency support, diagnosis, or therapist replacement.",
  },
  {
    question: "What should I include when reporting a bug?",
    answer:
      "Share the page, the exact action you took, what you expected, what happened instead, and whether the issue is reproducible. Screenshots help, but remove personal identifiers first.",
  },
  {
    question: "What if a user feels unsafe while using the app?",
    answer:
      "The product should direct them to local emergency services or crisis resources immediately. In the U.S. and Canada, people can call or text 988. In all other regions, use the appropriate local emergency or crisis line.",
  },
];

const supportChecklist = [
  "The route or feature where the problem happened.",
  "The exact step that triggered the issue.",
  "What the user expected to happen.",
  "What actually happened instead.",
  "Whether the issue affects login, journals, sessions, insights, or exercises.",
];

export default function HelpSupportPage() {
  return (
    <SettingsPageShell>
      <SettingsPanel>
        <SettingsSectionHeading
          eyebrow="Quick paths"
          title="Take users to the right surface fast"
          description="Support gets lighter when the app itself routes people to the correct place instead of forcing them to guess."
        />

        <SettingsPanelBody className="grid gap-4 lg:grid-cols-2">
          {quickPaths.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-5 transition-colors hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:text-slate-300 shadow-sm dark:shadow-none dark:border dark:border-slate-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 dark:text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>

                <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </SettingsPanelBody>
      </SettingsPanel>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SettingsPanel>
          <SettingsSectionHeading
            eyebrow="Support channels"
            title="What help can cover"
            description="Separate ordinary product support from privacy handling and urgent safety guidance."
          />

          <SettingsPanelBody className="space-y-4">
            {supportChannels.map((channel) => (
              <article
                key={channel.title}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-5"
              >
                <div className="flex items-center gap-3">
                  <SettingsBadge tone={channel.tone}>
                    {channel.title}
                  </SettingsBadge>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {channel.detail}
                </p>
                <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {channel.expectation}
                </p>
              </article>
            ))}
          </SettingsPanelBody>
        </SettingsPanel>

        <SettingsPanel>
          <SettingsSectionHeading
            eyebrow="FAQ"
            title="Common questions"
            description="Use native disclosure patterns so the page stays readable without pushing everything into a client-side accordion."
          />

          <SettingsPanelBody className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-5 open:bg-white dark:open:bg-slate-800/80"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-left text-base font-semibold text-slate-950 dark:text-slate-100">
                    {item.question}
                  </span>
                  <HelpCircle className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 dark:text-slate-400 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </SettingsPanelBody>
        </SettingsPanel>
      </div>

        <SettingsPanel>
          <SettingsSectionHeading
            eyebrow="Reporting template"
            title="What a useful support message includes"
            description="Good support UI teaches users what information helps fix the issue instead of just giving them a blank inbox."
          />

          <SettingsPanelBody className="space-y-4">
            {supportChecklist.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none dark:border dark:border-slate-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{item}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-teal-100 dark:border-teal-900/30 bg-teal-50/80 dark:bg-teal-900/10 p-5">
              <p className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                Reusable rule of thumb
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Help pages work best when they reduce support demand in two ways
                at once: route users to the right place immediately, and teach
                them the minimum context needed for a useful request.
              </p>
            </div>
          </SettingsPanelBody>
        </SettingsPanel>
    </SettingsPageShell>
  );
}
