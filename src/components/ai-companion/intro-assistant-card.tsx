import AssistantCard from "./assistant-card";

export default function IntroAssistantCard() {
  return (
    <AssistantCard>
      <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
        Thank you for sharing that so honestly. Carrying this much stress for a
        while can feel exhausting, especially when your mind keeps running even
        when your body wants rest.
      </p>
      <p className="text-[15px] font-bold leading-relaxed text-slate-900 dark:text-white">
        What feels most stressful right now-your workload, your thoughts, or how
        your body feels?
      </p>
    </AssistantCard>
  );
}
