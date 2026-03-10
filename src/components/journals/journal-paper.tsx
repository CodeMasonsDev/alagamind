import { GetUserJournal } from "@/api/journal";
import { useEffect, useMemo, useState } from "react";

type JournalPaperProps = {
  user_id: string;
  journal_id: string;
};

type Journal = {
  title?: string;
  content?: string;
};

export default function JournalPaper({
  user_id,
  journal_id,
}: JournalPaperProps) {
  const [journal, setJournal] = useState<Journal | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchJournal = async () => {
      const fetchedJournal = await GetUserJournal(user_id, journal_id);
      if (!isCancelled) {
        setJournal(fetchedJournal ?? null);
      }
    };

    fetchJournal();

    return () => {
      isCancelled = true;
    };
  }, [user_id, journal_id]);

  const formattedContent = useMemo(
    () => sanitizeJournalHtml(journal?.content ?? ""),
    [journal?.content],
  );

  return (
    <section className="p-10">
      <header>
        <h1 className="text-[45px]">{journal?.title}</h1>
      </header>

      <main
        data-journal-content
        className="mt-6"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </section>
  );
}

function sanitizeJournalHtml(content: string) {
  return content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");
}
