"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { getMe } from "@/api/auth/auth";
import AdminSidebar from "@/app/(admin)/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.includes("/login");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(!isAuthPage);

  useEffect(() => {
    if (isAuthPage) return;

    const checkAuth = async () => {
      try {
        const user = await getMe();
        const hasAdminRole = user.roles?.some(
          (role: string) => role.toLowerCase() === "admin"
        );

        if (!hasAdminRole) {
          router.replace("/admin/login");
          return;
        }

        setIsAuthorized(true);
      } catch {
        router.replace("/admin/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
