import AssistantCard from "./assistant-card";

export default function AssistantTextCard({
  text,
}: {
  text: string;
}) {
  return (
    <AssistantCard>
      <p className="text-[15px] leading-relaxed text-slate-600">{text}</p>
    </AssistantCard>
  );
}
