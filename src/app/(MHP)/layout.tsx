"use client";

import { usePathname } from "next/navigation";
import MHPSidebar from "./components/mhp-sidebar";

export default function MHPLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      <MHPSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
