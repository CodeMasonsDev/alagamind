import GuidedCbtWorkflow from "@/components/exercises/guided-cbt-workflow";

export default function CognitiveReframing() {
  return (
    <div className="flex min-h-full w-full flex-col bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      <main className="mx-auto w-full max-w-[1320px] px-2 py-2 ">
        <GuidedCbtWorkflow />
      </main>
    </div>
  );
}
