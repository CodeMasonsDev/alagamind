import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — AlagaMind",
  description: "AlagaMind Privacy Policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)] text-slate-900 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">

        {/* Back */}
        <Link
          href="/login"
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
            AlagaMind
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Effective date: January 1, 2026 &nbsp;·&nbsp; Last updated: April 27, 2026
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            This Privacy Policy explains how AlagaMind collects, uses, stores, and protects your personal information when you use our platform.
          </p>
        </div>

        <div className="space-y-10">

          {/* 1 */}
          <Section title="1. Information We Collect">
            <p>We collect the following categories of information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Account information:</strong> Your first name, last name, and email address provided during registration.</li>
              <li><strong>Authentication data:</strong> Securely hashed passwords and session tokens stored in HTTP-only cookies.</li>
              <li><strong>Journal entries:</strong> Text content you write in the journaling feature, stored privately to your account.</li>
              <li><strong>Exercise records:</strong> Your progress and responses within guided therapeutic exercises.</li>
              <li><strong>AI Companion conversations:</strong> Session history maintained to provide continuity across conversations.</li>
              <li><strong>Profile picture:</strong> If uploaded, stored using your user ID as a reference and accessible only to you.</li>
              <li><strong>Emotional check-ins:</strong> Mood and sentiment data recorded through platform features.</li>
            </ul>
          </Section>

          {/* 2 */}
          <Section title="2. How We Use Your Information">
            <p>Your information is used to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provide and personalize your mental wellness experience on AlagaMind.</li>
              <li>Maintain your session history and journal entries across devices.</li>
              <li>Enable your connected Mental Health Professional (MHP) to view relevant session data (with your consent).</li>
              <li>Improve AI model responses using <strong>anonymized and aggregated data</strong> — only if you have opted in via Privacy Settings.</li>
              <li>Ensure platform security and prevent unauthorized access.</li>
              <li>Comply with legal obligations where required by Philippine law.</li>
            </ul>
          </Section>

          {/* 3 */}
          <Section title="3. Data Sharing">
            <p>
              AlagaMind does <strong>not sell</strong> your personal data to third parties. We share data only in these limited circumstances:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>With your MHP:</strong> Relevant session information (emotional check-ins, exercise progress) is visible to a licensed MHP you have connected with on the platform.</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government authority under Philippine jurisdiction.</li>
              <li><strong>Service providers:</strong> Infrastructure and hosting providers who process data strictly on our behalf under data processing agreements.</li>
            </ul>
          </Section>

          {/* 4 */}
          <Section title="4. Data Security">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Authentication tokens are stored in secure, HTTP-only cookies to prevent JavaScript access.</li>
              <li>Passwords are hashed using a strong one-way algorithm and are never stored in plain text.</li>
              <li>All data transmission occurs over HTTPS/TLS encrypted connections.</li>
              <li>Access to personal data is restricted to authorized personnel only.</li>
            </ul>
          </Section>

          {/* 5 */}
          <Section title="5. Your Rights & Data Control">
            <p>You have the following rights regarding your personal data:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Access:</strong> You may request a full export of your personal data at any time through your account settings.</li>
              <li><strong>Correction:</strong> You may update your profile information at any time through your account settings.</li>
              <li><strong>Deletion:</strong> You may permanently delete your account and all associated data through your account settings. Deletion is processed within 30 days.</li>
              <li><strong>Consent withdrawal:</strong> You may opt out of anonymized data contribution at any time via the Privacy & Consent section in your settings.</li>
            </ul>
          </Section>

          {/* 6 */}
          <Section title="6. Cookies & Local Storage">
            <p>
              AlagaMind uses the following browser storage mechanisms:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>HTTP-only cookies:</strong> Store your authentication token securely. These cookies are not accessible by JavaScript and expire with your session or after a set period.</li>
              <li><strong>Local storage:</strong> Stores your interface preferences such as language selection for the AI Companion. No sensitive data is stored in local storage.</li>
            </ul>
          </Section>

          {/* 7 */}
          <Section title="7. AI Companion & Data Training">
            <p>
              Your conversations with the AI Companion are stored to maintain session continuity. By default, your conversation data is <strong>not used</strong> to train or improve AI models.
            </p>
            <p className="mt-3">
              You may choose to opt in to contributing anonymized conversation data for model improvement through the <strong>Privacy & Consent</strong> section in your account settings. You can withdraw this consent at any time.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Data Retention">
            <p>
              We retain your personal data for as long as your account is active. Upon account deletion:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Your personal data is permanently removed from our systems within <strong>30 days</strong>.</li>
              <li>Anonymized or aggregated data (if you opted in) may be retained for research purposes in a form that cannot identify you.</li>
              <li>Data required to be retained by Philippine law may be kept for the legally mandated period.</li>
            </ul>
          </Section>

          {/* 9 */}
          <Section title="9. Children's Privacy">
            <p>
              AlagaMind is not directed at children under 13. Users between 13 and 17 should obtain parental or guardian consent before using the platform. We do not knowingly collect personal data from children under 13 without verifiable parental consent.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated via the platform. Your continued use of AlagaMind after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Governing Law">
            <p>
              This Privacy Policy is governed by the <strong>Republic Act No. 10173</strong> (Data Privacy Act of 2012) of the Republic of the Philippines and other applicable Philippine laws. Any disputes shall be resolved in the courts of competent jurisdiction in the Philippines.
            </p>
          </Section>

          {/* Contact */}
          <div className="rounded-3xl border border-teal-100 dark:border-teal-900/30 bg-teal-50/60 dark:bg-teal-900/10 px-6 py-6">
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
              Questions about this Privacy Policy?
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
            href="/login"
            className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
          >
            Back to Sign In
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
