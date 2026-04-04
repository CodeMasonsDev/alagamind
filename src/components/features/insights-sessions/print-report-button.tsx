"use client";

import { Printer } from "lucide-react";

export default function PrintReportButton({
  label = "Export weekly report",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
