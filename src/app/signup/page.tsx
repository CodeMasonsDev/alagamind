'use client';

import React, { useState } from 'react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Signup logic would go here
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-white via-teal-50 to-blue-50 flex items-center justify-center p-4 font-sans">
      {/* Soft Radial Highlight behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Layout Container */}
      <div className="w-full max-w-7xl flex justify-center lg:justify-end lg:pr-[10%] relative z-10">
        <section className="w-full max-w-[460px]">
          {/* Auth Card */}
          <div className="bg-white/90 backdrop-blur-xs rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/40 p-8 md:p-10 transition-all duration-500">
            {/* Brand Row */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 text-teal-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  <path d="M19 3v4" />
                  <path d="M21 5h-4" />
                </svg>
              </div>
              <span className="text-xl tracking-tight text-slate-800">
                <span className="font-bold">Alaga</span>
                <span className="font-light">Mind</span>
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Begin Your Journey</h1>
              <p className="text-slate-500 text-sm font-medium">Step into a space of clarity and resilience.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Jordan Henderson"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@organization.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-3 py-1">
                <div className="flex justify-between items-center text-[11px] font-bold tracking-[0.2em] uppercase">
                  <span className="text-slate-400">Security Integrity</span>
                  <span className="text-teal-600">85% — Strong</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full w-[85%] transition-all duration-500" />
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-3 py-2">
                <div className="relative flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 rounded-md border-slate-200 text-teal-500 focus:ring-teal-500/20 cursor-pointer accent-teal-500"
                    required
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-slate-500 leading-tight cursor-pointer select-none">
                  I acknowledge the{' '}
                  <a href="#" className="text-teal-600 font-bold hover:underline">
                    Terms of Resilience
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-teal-600 font-bold hover:underline">
                    Privacy Protocol
                  </a>
                  .
                </label>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] text-white font-semibold py-4 rounded-xl shadow-xl shadow-teal-500/25 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Begin Resilience Journey
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-slate-400">Already part of the network? </span>
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">
                Sign In
              </a>
            </div>
          </div>

          {/* Compliance Footer */}
          <div className="mt-10 flex items-center justify-between px-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              HIPAA READY
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              AES-256
            </div>
            <div>© 2024 ALGMND</div>
          </div>
        </section>
      </div>
    </main>
  );
}
