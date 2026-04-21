"use client";

import { useState } from "react";

const PROMPT_CATEGORIES = [
  {
    label: "English",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    prompts: [
      "What was the most meaningful moment of your day, and why did it stand out?",
      "What emotion stayed with you the longest today, and what triggered it?",
      "What did today teach you about yourself that you did not notice before?",
      "What boundary did you keep (or wish you kept), and how did it affect you?",
      "What are three small wins from today, no matter how quiet they seem?",
      "If today had a title, what would it be and why?",
    ],
  },
  {
    label: "Tagalog",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    prompts: [
      "Ano ang pinaka-mabigat o pinaka-magaan na naramdaman mo ngayon, at bakit?",
      "Ano ang isang maliit na bagay na ipinagpapasalamat mo ngayong araw?",
      "Kung kakausapin mo ang sarili mo na parang kaibigan, ano ang sasabihin mo?",
      "Anong sitwasyon ngayon ang nagturo sa iyo ng mahalagang aral?",
      "Ano ang isang bagay na gusto mong bitawan bago matapos ang araw?",
      "Kung bibigyan mo ng pamagat ang araw mo, ano ito at bakit?",
    ],
  },
  {
    label: "Bisaya",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    prompts: [
      "Unsa man imong gibati karon, ug asa nimo na pinakabati?",
      "Unsa ang usa ka butang nga mapasalamaton ka karong adlawa?",
      "Kung imong estoryahon imong kaugalingon isip higala, unsa imong iingon?",
      "Unsa nga hitabo karon nga adlaw ang nakapahinumdom nimo sa imong kusog?",
      "Unsa ang gusto nimo buhian sa imong hunahuna karong gabii?",
      "Kung hatagan nimo ug title ang imong adlaw, unsa man ug ngano?",
    ],
  },
];

interface JournalPromptsProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

export default function JournalPrompts({ onSelect, onClose }: JournalPromptsProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:w-96">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/40">
                <svg
                  className="h-4 w-4 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Journal Prompts
              </p>
            </div>
            <p className="mt-1 pl-9 text-xs text-slate-400 dark:text-slate-500">
              English, Tagalog, and Bisaya prompt sets
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 px-4 py-2 dark:border-slate-800">
          {PROMPT_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveIdx(i)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeIdx === i
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompts list */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-xs font-medium text-slate-400 dark:text-slate-500">
            {PROMPT_CATEGORIES[activeIdx].prompts.length} prompts
          </p>
          <div className="flex flex-col gap-2.5">
            {PROMPT_CATEGORIES[activeIdx].prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(prompt);
                  onClose();
                }}
                className="group w-full rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left transition-all hover:border-teal-200 hover:bg-teal-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-teal-700/50 dark:hover:bg-teal-950/30"
              >
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">
                  {prompt}
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-xs font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-teal-400">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Use this prompt
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400 dark:text-slate-600">
            Prompts are inserted at your cursor position
          </p>
        </div>
      </div>
    </>
  );
}
