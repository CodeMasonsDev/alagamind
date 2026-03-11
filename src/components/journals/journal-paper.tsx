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
  const sanitized = content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");

  return normalizedQuillHtml(sanitized);
}

function normalizedQuillHtml(content: string) {
  return content
    .replace(
      /<span[^>]*class=(['"])[^'"]*\bql-ui\b[^'"]*\1[^>]*>[\s\S]*?<\/span>/gi,
      "",
    )
    .replace(
      /<(p|blockquote|h[1-6]|li)>\s*(?:<br\s*\/?>|&nbsp;|\s)*<\/\1>/gi,
      "",
    )
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, (fullMatch, listBody: string) => {
      const listItems = listBody.match(/<li[\s\S]*?<\/li>/gi);

      if (!listItems?.length) {
        return fullMatch;
      }

      const isBulletOnlyList = listItems.every((item) =>
        /data-list\s*=\s*['"]bullet['"]/i.test(item),
      );

      if (!isBulletOnlyList) {
        return fullMatch;
      }

      const cleanedListBody = listBody.replace(
        /\sdata-list\s*=\s*(['"])bullet\1/gi,
        "",
      );

      return `<ul>${cleanedListBody}</ul>`;
    })
    .trim();
}
