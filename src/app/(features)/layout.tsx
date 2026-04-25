import SidebarShell from "@/components/sidebar/sidebar-shell";
import MobileTopBar from "@/components/sidebar/mobile-top-bar";
import { SidebarProvider } from "@/components/sidebar/sidebar-context";
import { DashboardMetricsProvider } from "@/components/providers/dashboard-metrics-provider";
import { ReflectionsProvider } from "@/components/providers/reflections-provider";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { hasRole } from "@/lib/auth-roles";
import { getJwtRoles } from "@/lib/auth-token";
import { redirect } from "next/navigation";

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const roles = getJwtRoles(accessToken);

  if (hasRole(roles, "MHP")) {
    redirect("/mentalhealth-professionals");
  }

  return (
    <ReflectionsProvider>
      <DashboardMetricsProvider>
        <SidebarProvider>
          <div className="flex h-screen bg-white dark:bg-slate-950">
            <SidebarShell />

            {/* Main column: top bar on mobile + scrollable content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <MobileTopBar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </DashboardMetricsProvider>
    </ReflectionsProvider>
  );
}
