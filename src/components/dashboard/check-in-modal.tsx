"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { submitCheckIn } from "@/services/check-in";

const EMOTIONS = [
  {
    label: "Stressed",
    state: 0,
    image: "/stressed_emoji.png",
    alt: "Stressed emotion",
  },
  {
    label: "Tired",
    state: 1,
    image: "/tired_emoji.png",
    alt: "Tired emotion",
  },
  {
    label: "Focused",
    state: 2,
    image: "/focused_emoji.png",
    alt: "Focused emotion",
  },
  {
    label: "Calm",
    state: 3,
    image: "/calm_emoji.png",
    alt: "Calm emotion",
  },
  {
    label: "Energized",
    state: 4,
    image: "/energized_emoji.png",
    alt: "Energized emotion",
  },
];

type CheckInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: (state: number, intensity: number) => void;
};

export function CheckInModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: CheckInModalProps) {
  const [state, setState] = useState(2); // Default: Focused
  const [intensity, setIntensity] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await submitCheckIn(userId, state, intensity);

    if (!res) {
      setError("You can check in once per hour only. Please try again later.");
      setIsSubmitting(false);
      return;
    }

    onSuccess(state, intensity);
    onClose();
    setIsSubmitting(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-in-modal-title"
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            id="check-in-modal-title"
            className="text-xs font-bold tracking-widest text-slate-900 uppercase"
          >
            Quick Check-In
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
              Current Emotional State
            </p>
            <div className="grid grid-cols-5 gap-2">
              {EMOTIONS.map(({ label, image, alt, state: s }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setState(s)}
                  aria-pressed={state === s}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                    state === s
                      ? "border-teal-400 bg-teal-50 text-teal-600 shadow-sm"
                      : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <Image
                    src={image}
                    alt={alt}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Intensity
              </span>
              <span className="text-sm font-bold text-teal-500">
                {intensity}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Saving..." : "Submit Check-In"}
          </button>
        </form>
      </div>
    </div>
  );
}
