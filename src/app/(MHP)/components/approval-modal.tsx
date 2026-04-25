"use client";

import { useState } from "react";
import { Calendar, Link2, Mail, Phone, Video, X } from "lucide-react";
import type { MHPClient } from "./mock-data";

type ApprovalModalProps = {
  client: MHPClient;
  onClose: () => void;
  onConfirm: (details: ApprovalDetails) => void;
  initialContactEmail?: string;
  initialContactPhone?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export type ApprovalDetails = {
  message: string;
  sessionType: "online" | "in-person";
  meetLink: string;
  appointmentDate: string;
  appointmentTime: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

export default function ApprovalModal({
  client,
  onClose,
  onConfirm,
  initialContactEmail = "dr.sample@alagamind.com",
  initialContactPhone = "+63 912 345 6789",
  isSubmitting = false,
  errorMessage = null,
}: ApprovalModalProps) {
  const [form, setForm] = useState<ApprovalDetails>({
    message: `Hello ${client.name},\n\nI have reviewed your profile and I'm pleased to inform you that your session request has been approved. Looking forward to working with you on your wellness journey.\n\nPlease confirm your availability for our scheduled session.`,
    sessionType: "online",
    meetLink: "https://meet.google.com/abc-defg-hij",
    appointmentDate: "",
    appointmentTime: "",
    contactEmail: initialContactEmail,
    contactPhone: initialContactPhone,
    notes: "",
  });

  function patch(fields: Partial<ApprovalDetails>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  const isValid =
    form.message.trim().length > 0 &&
    form.appointmentDate.trim().length > 0 &&
    form.appointmentTime.trim().length > 0 &&
    (form.sessionType === "in-person" || form.meetLink.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
        aria-busy={isSubmitting}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Approve Session Request
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Sending approval to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {client.name}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Message to Client
            </label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => patch({ message: e.target.value })}
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Session Type
            </label>
            <div className="flex gap-3">
              {(["online", "in-person"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => patch({ sessionType: type })}
                  disabled={isSubmitting}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors capitalize ${
                    form.sessionType === type
                      ? "border-teal-400 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-400"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {type === "online" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Google Meet Link */}
          {form.sessionType === "online" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Google Meet Link
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={form.meetLink}
                  onChange={(e) => patch({ meetLink: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Appointment Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Date
              </label>
              <input
                type="date"
                value={form.appointmentDate}
                onChange={(e) => patch({ appointmentDate: e.target.value })}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Time
              </label>
              <input
                type="time"
                value={form.appointmentTime}
                onChange={(e) => patch({ appointmentTime: e.target.value })}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Your Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => patch({ contactEmail: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Your Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => patch({ contactPhone: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Additional Notes{" "}
              <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              disabled={isSubmitting}
              placeholder="Any pre-session instructions, documents to prepare, etc."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="px-6 pb-1">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {errorMessage}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValid || isSubmitting}
            onClick={() => onConfirm(form)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending...
              </>
            ) : (
              "Send Approval"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
