import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Menu, Users, ClipboardList, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";

const navItems = [
  { text: "Dashboard", path: "/protected/dashboard", icon: <Menu className="w-5 h-5" /> },
  { text: "Players", path: "/protected/players", icon: <Users className="w-5 h-5" /> },
  { text: "Observations", path: "/protected/observations", icon: <ClipboardList className="w-5 h-5" /> },
];

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Auth check (server-side)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch coach's name from coaches table using auth_uid
  let coachName = "";
  if (user?.id) {
    const { data: coach } = await supabase
      .from("coaches")
      .select("first_name, last_name")
      .eq("auth_uid", user.id)
      .single();
    if (coach) {
      coachName = `${coach.first_name || ""} ${coach.last_name || ""}`.trim();
    }
  }

  // TODO: Implement mobile sidebar toggle state with useState in a client component if needed

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800 p-4">
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.text}>
                <Link
                  href={item.path}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gold/10 transition-colors [&.active]:bg-gold/10 [&.active]:border-r-4 [&.active]:border-gold"
                >
                  <span className="text-gold">{item.icon}</span>
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
          <div className="relative flex items-center" style={{ height: 128 }}>
            <Image src="/maxsM.png" alt="Logo" width={128} height={128} className="object-contain" />
            <span
              className="absolute left-32 top-1/2 -translate-y-1/2 text-3xl font-bold text-gold"
              style={{ whiteSpace: 'nowrap' }}
            >
              MP Player Development
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {coachName && (
              <span className="block text-sm text-white/90 font-semibold">{coachName}</span>
            )}
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
