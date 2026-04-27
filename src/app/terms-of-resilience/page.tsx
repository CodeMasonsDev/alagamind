import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Resilience — AlagaMind",
  description: "AlagaMind Terms of Resilience — the conditions under which you use our mental wellness platform.",
};

export default function TermsOfResiliencePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)] text-slate-900 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">

        {/* Back */}
        <Link
          href="/signup"
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign Up
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
            AlagaMind
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Terms of Resilience
          </h1>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Effective date: January 1, 2026 &nbsp;·&nbsp; Last updated: April 27, 2026
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            By creating an account on AlagaMind, you agree to these Terms of Resilience. Please read them carefully before proceeding.
          </p>
        </div>

        <div className="space-y-10">

          {/* 1 */}
          <Section title="1. About AlagaMind">
            <p>
              AlagaMind is a mental wellness support platform that provides AI-powered companionship, guided therapeutic exercises, reflective journaling, and access to licensed Mental Health Professionals (MHPs). AlagaMind is designed to <strong>complement</strong> — not replace — professional mental health care.
            </p>
            <p className="mt-3">
              Nothing on this platform constitutes a clinical diagnosis, medical advice, or a therapeutic relationship in the legal or professional sense unless explicitly established between you and a licensed MHP on the platform.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Eligibility">
            <ul className="list-disc space-y-2 pl-5">
              <li>You must be at least <strong>13 years old</strong> to use AlagaMind. Users under 18 should obtain parental or guardian consent.</li>
              <li>You must provide accurate and truthful information when creating your account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>
          </Section>

          {/* 3 */}
          <Section title="3. Use of the AI Companion">
            <p>
              The AI Companion is powered by a large language model and is intended for supportive, reflective conversation only. You acknowledge that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>The AI is <strong>not a licensed therapist or psychologist</strong>.</li>
              <li>AI responses are generated automatically and may not always be accurate, appropriate, or complete.</li>
              <li>In a mental health crisis or emergency, you should contact a licensed professional or emergency services immediately.</li>
              <li>Conversations with the AI are stored to maintain session history and improve your experience.</li>
            </ul>
          </Section>

          {/* 4 */}
          <Section title="4. Journaling & Personal Data">
            <p>
              Journal entries, exercise records, and session history are private to your account. AlagaMind will not share your personal journal content with third parties without your explicit consent, except where required by law.
            </p>
            <p className="mt-3">
              You own your personal data. You may request a full export or deletion of your data at any time through your account settings.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Mental Health Professional (MHP) Interactions">
            <p>
              If you choose to connect with an MHP through the platform:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Session scheduling and approval are managed within the platform.</li>
              <li>MHPs are independently licensed professionals. AlagaMind facilitates connection but does not employ or supervise MHPs.</li>
              <li>You consent to relevant session information (such as emotional check-ins and exercise progress) being visible to your connected MHP.</li>
            </ul>
          </Section>

          {/* 6 */}
          <Section title="6. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Use AlagaMind to harm, harass, or threaten others.</li>
              <li>Attempt to reverse-engineer, scrape, or disrupt any part of the platform.</li>
              <li>Impersonate another person or provide false information.</li>
              <li>Use the platform for any unlawful purpose.</li>
            </ul>
          </Section>

          {/* 7 */}
          <Section title="7. Privacy & Data Protection">
            <p>
              Your data is protected under our Privacy Policy. Key points:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Authentication tokens are stored in secure, HTTP-only cookies.</li>
              <li>Passwords are hashed and never stored in plain text.</li>
              <li>Profile pictures are stored using your user ID as the filename and are accessible only to you.</li>
              <li>Anonymized insights may be used to improve AI models if you opt in via your privacy settings.</li>
            </ul>
          </Section>

          {/* 8 */}
          <Section title="8. Crisis & Emergency Situations">
            <Callout>
              AlagaMind is not a crisis intervention service. If you are experiencing thoughts of self-harm or suicide, please contact your local emergency services or a crisis hotline immediately.
            </Callout>
            <p className="mt-3">
              <strong>Philippines:</strong> National Center for Mental Health Crisis Hotline — <strong>1553</strong>
              <br />
              <strong>International:</strong> Crisis Text Line — Text HOME to 741741
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Termination">
            <p>
              You may delete your account at any time through your account settings. AlagaMind reserves the right to suspend or terminate accounts that violate these Terms.
            </p>
            <p className="mt-3">
              Upon account deletion, your personal data will be permanently removed from our systems within 30 days, except where retention is required by law.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Changes to These Terms">
            <p>
              AlagaMind may update these Terms from time to time. Significant changes will be communicated via the platform. Continued use after changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Governing Law">
            <p>
              These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of competent jurisdiction in the Philippines.
            </p>
          </Section>

          {/* Contact */}
          <div className="rounded-3xl border border-teal-100 dark:border-teal-900/30 bg-teal-50/60 dark:bg-teal-900/10 px-6 py-6">
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
              Questions about these Terms?
            </p>
            <p className="mt-1 text-sm text-teal-700 dark:text-teal-400">
              Contact us at{" "}
              <a
                href="mailto:support@alagamind.app"
                className="font-bold underline underline-offset-2 hover:text-teal-900 dark:hover:text-teal-200"
              >
                support@alagamind.app
              </a>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-400 dark:text-slate-500">
          <span>© 2026 AlagaMind</span>
          <Link
            href="/signup"
            className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="text-sm leading-7 text-slate-600 dark:text-slate-400">
        {children}
      </div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 px-5 py-4 text-sm font-semibold leading-relaxed text-rose-700 dark:text-rose-300">
      {children}
    </div>
  );
}
