import { Bot } from "lucide-react";

export default function AssistantCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="relative max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 pl-14 shadow-sm">
      <span className="absolute left-4 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-teal-600">
        <Bot size={16} />
      </span>
      <div className="flex flex-col gap-5">{children}</div>
    </article>
  );
}
