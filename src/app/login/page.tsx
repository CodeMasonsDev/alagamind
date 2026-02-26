'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic would go here
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-white via-teal-50 to-blue-50 flex items-center justify-center p-4 font-sans">
      {/* Soft Radial Highlight behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Layout Container */}
      <div className="w-full max-w-7xl flex justify-center lg:justify-end lg:pr-[10%] relative z-10">
        <section className="w-full max-w-[460px]">
          {/* Main Auth Card */}
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Welcome Back</h1>
              <p className="text-slate-500 text-sm font-medium">Elevate your practice with intelligence.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                    Security Key
                  </label>
                  <a href="#" className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                    Recovery access?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] text-white font-semibold py-4 rounded-xl shadow-xl shadow-teal-500/25 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Enter Workspace
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                <span className="bg-white/0 px-4 text-slate-400 font-bold backdrop-blur-xs">Federated Identity</span>
              </div>
            </div>

            {/* SSO Button */}
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl bg-white/50 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 text-slate-700 font-bold text-sm tracking-tight">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with SSO
            </button>

            {/* Footer Navigation */}
            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-slate-400">New to the network? </span>
              <a href="/signup" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">
                Create Account
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
