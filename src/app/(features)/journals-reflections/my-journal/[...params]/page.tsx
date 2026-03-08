"use client";
import JournalPaper from "@/components/journals/journal-paper";
import Link from "next/link";
import { use } from "react";

// type MyJournalProps = {
//   params: Promise<{
//     user_id: string;
//     journal_id: string;
//   }>;
// };

type MyJournalProps = {
  params: Promise<{
    params: string[];
  }>;
};
export default function MyJournal({ params }: MyJournalProps) {
  const resolved = use(params);

  const user_id = resolved.params[0];
  const journal_id = resolved.params[1];

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar />
      <main className="flex w-full">
        <div className="w-[75%]">
          <JournalPaper
            user_id={user_id as string}
            journal_id={journal_id as string}
          />
        </div>

        <div className="w-[25%]">
          <h1>AI insights</h1>
        </div>
      </main>
    </div>
  );
}

const TopBar = () => {
  return (
    <header className="flex sticky top-0 z-10 bg-white px-4  py-3 border-b border-slate-200 ">
      <Link
        href={"/journals-reflections"}
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </Link>
    </header>
  );
};
