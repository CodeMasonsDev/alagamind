import SidebarShell from "@/components/sidebar/sidebar-shell";
import { DashboardMetricsProvider } from "@/components/providers/dashboard-metrics-provider";
import { ReflectionsProvider } from "@/components/providers/reflections-provider";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
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

  return (
    <ReflectionsProvider>
      <DashboardMetricsProvider>
        <div className="flex h-screen bg-white">
          <SidebarShell />

          <main className="flex-1 h-full overflow-y-auto">{children}</main>
        </div>
      </DashboardMetricsProvider>
    </ReflectionsProvider>
  );
}

