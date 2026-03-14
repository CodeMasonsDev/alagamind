import Sidebar from "@/components/sidebar/sidebar";
import { ReflectionsProvider } from "@/components/providers/reflections-provider";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReflectionsProvider>
      <div className="flex h-screen bg-white">
        <aside className="h-full">
          <Sidebar />
        </aside>

        <main className="flex-1 h-full overflow-y-auto  ">{children}</main>
      </div>
    </ReflectionsProvider>
  );
}
