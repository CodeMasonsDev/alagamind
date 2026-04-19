import BehavioralActivationPanel from "@/components/exercises/behavioral-activation-panel";

export default function BehavioralActivationPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60 dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      <main className="mx-auto w-full max-w-[1320px] px-2 py-2">
        <BehavioralActivationPanel />
      </main>
    </div>
  );
}
