import AssistantCard from "./assistant-card";
import { Loader2 } from "lucide-react";
export default function TypingIndicator() {
  return (
    <AssistantCard>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={14} className="animate-spin text-teal-600" />
        AlagaMind AI is typing...
      </div>
    </AssistantCard>
  );
}
