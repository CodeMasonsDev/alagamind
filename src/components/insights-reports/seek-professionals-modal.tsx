"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail, Phone, Zap, MessageSquare } from "lucide-react";
import { getMe } from "@/api/auth/auth";
import { createSeekRequest, type MHPInfo } from "@/app/(MHP)/api/mhp";

type SeekProfessionalsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mhps?: MHPInfo[];
  userId: string;
  inline?: boolean;
};

export default function SeekProfessionalsModal({
  isOpen,
  onClose,
  mhps = [],
  userId,
  inline = false,
}: SeekProfessionalsModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMhp, setSelectedMhp] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const sendSeqRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      const loadUserEmail = async () => {
        try {
          const user = await getMe();
          if (user?.email) {
            setEmail(user.email);
          }
        } catch {
          console.error("Failed to load user email");
        }
      };
      loadUserEmail();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Invalidate any in-flight send, and ensure the UI isn't stuck "Sending..."
    sendSeqRef.current += 1;
    setIsSending(false);
    onClose();
  };

  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    const timeout = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error("Request timed out. Please try again."));
      }, ms);
    });
    return Promise.race([promise, timeout]);
  };

  async function handleSend() {
    if (!selectedMhp || isSending) return;

    const seq = (sendSeqRef.current += 1);
    setIsSending(true);
    try {
      await withTimeout(
        createSeekRequest({
          id: 0,
          userId,
          email,
          phoneNumber: phone,
          message,
          mhpId: selectedMhp,
          inSession: false,
          inFollowUp: false,
        }),
        15000,
      );
      if (sendSeqRef.current !== seq) return;
      setSent(true);
    } catch (error) {
      if (sendSeqRef.current !== seq) return;
      console.error("Failed to send seek request:", error);
      alert(error instanceof Error ? error.message : "Failed to send request.");
    } finally {
      if (sendSeqRef.current === seq) setIsSending(false);
    }
  }

  function handleCloseAfterSend() {
    sendSeqRef.current += 1;
    setIsSending(false);
    setSent(false);
    setEmail("");
    setPhone("");
    setMessage("");
    setSelectedMhp(null);
    onClose();
  }

  if (sent) {
    const sentContent = (
      <div
        className="w-full max-w-lg rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
          <div className="flex flex-col items-center justify-center px-6 py-12">
            <button
              type="button"
              onClick={handleCloseAfterSend}
              className="absolute right-6 top-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-400 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-300"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white">
              <Zap className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Seek is OTW
            </h2>
            <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
              Your request has been sent successfully!
            </p>
            <div className="mt-6 rounded-xl border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 p-4">
              <p className="text-sm font-semibold text-teal-900 dark:text-teal-300">
                ⏱️ Expect an email within 2-4 hours
              </p>
              <p className="mt-2 text-xs text-teal-800 dark:text-teal-400">
                A mental health professional will reach out to you shortly to confirm your session and discuss your needs.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseAfterSend}
              className="mt-8 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Got it
            </button>
          </div>
        </div>
    );

    if (inline) {
      return sentContent;
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/40 p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            handleCloseAfterSend();
          }
        }}
        role="dialog"
        aria-modal="true"
      >
        {sentContent}
      </div>
    );
  }

  const formContent = (
    <div
      className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 shadow-2xl shadow-slate-200/50 dark:shadow-black/50"
      onClick={(event) => event.stopPropagation()}
    >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-teal-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-500/15 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  New Request
                </span>
              </div>
              <h2
                id="seek-professionals-title"
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Seek a Professional
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Connect with a mental health professional for support
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2.5 text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-700 dark:text-slate-300"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* MHP Selection */}
          {mhps.length > 0 && (
            <div>
              <label className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <div className="h-1 w-1 rounded-full bg-teal-600 dark:bg-teal-400" />
                Select a Professional
              </label>
              <div className="grid gap-3">
                {mhps.map((mhp) => (
                  <button
                    key={mhp.id}
                    type="button"
                    onClick={() => setSelectedMhp(mhp.id)}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                      selectedMhp === mhp.id
                        ? "border-teal-400 bg-teal-50/50 dark:border-teal-500/40 dark:bg-teal-500/15"
                        : "border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-bold text-white shadow-md">
                      {mhp.firstName.charAt(0)}{mhp.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {mhp.firstName} {mhp.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {mhp.email}
                      </p>
                    </div>
                    {selectedMhp === mhp.id && (
                      <div className="h-6 w-6 shrink-0 rounded-full border-2 border-teal-600 bg-teal-600 dark:border-teal-400 dark:bg-teal-400 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="mb-2.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 py-3 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500/40 dark:focus:ring-teal-500/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 py-3 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500/40 dark:focus:ring-teal-500/20"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-2.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the professional about your concerns and what support you're looking for..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500/40 dark:focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 px-8 py-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!email.trim() || !message.trim() || !selectedMhp || isSending}
            className="inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:shadow-teal-600/50 hover:from-teal-700 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {isSending ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    );

  if (inline) {
    return formContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="seek-professionals-title"
    >
      {formContent}
    </div>
  );
}
