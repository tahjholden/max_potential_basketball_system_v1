import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Menu, Users, ClipboardList, FileText, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { text: "Dashboard", path: "/protected/dashboard", icon: <Menu className="w-5 h-5" /> },
  { text: "Players", path: "/protected/players", icon: <Users className="w-5 h-5" /> },
  { text: "Observations", path: "/protected/observations", icon: <ClipboardList className="w-5 h-5" /> },
  { text: "Development Plans", path: "/protected/pdps", icon: <FileText className="w-5 h-5" /> },
];

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Auth check (server-side)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Get user initials for avatar
  const getUserInitials = (email: string | null) => {
    if (!email) return "?";
    return email.substring(0, 2).toUpperCase();
  };

  // TODO: Implement mobile sidebar toggle state with useState in a client component if needed

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800 p-4">
        <div className="mb-8 text-2xl font-bold text-oldgold">Player Development</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.text}>
                <Link
                  href={item.path}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-yellow-900/20 transition-colors [&.active]:bg-yellow-900/20 [&.active]:border-r-4 [&.active]:border-oldgold"
                >
                  <span className="text-oldgold">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile sidebar toggle (non-functional placeholder) */}
            <button className="text-oldgold focus:outline-none">
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-oldgold font-bold">PD</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-oldgold flex items-center justify-center text-black font-bold">
              {getUserInitials(user?.email ?? null)}
            </div>
            <span className="hidden sm:block text-sm text-white/80">{user?.email}</span>
            <div className="ml-2">
              <LogoutButton />
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
