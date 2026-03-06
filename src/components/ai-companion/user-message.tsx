import { User } from "lucide-react";

export default function UserMessage({ text }: { text: string }) {
  return (
    <div className="ml-auto flex max-w-2xl items-end gap-2">
      <p className="rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
        {text}
      </p>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <User size={14} />
      </span>
    </div>
  );
}
