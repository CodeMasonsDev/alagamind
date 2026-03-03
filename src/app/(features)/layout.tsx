import Sidebar from "@/components/sidebar/sidebar";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 'flex' puts them side-by-side; 'h-screen' ensures the layout fills the window
    <div className="flex h-screen bg-white">
      <aside className="h-full">
        <Sidebar />
      </aside>

      {/* 'flex-1' makes this section grow to fill all remaining space */}
      {/* 'overflow-y-auto' allows the dashboard to scroll independently of the sidebar */}
      <main className="flex-1 h-full overflow-y-auto  ">{children}</main>
    </div>
  );
}
