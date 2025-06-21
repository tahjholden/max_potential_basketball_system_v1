import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import { Toaster } from "sonner";
import { Navigation } from "@/components/Navigation";

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
        <Navigation />
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gold">
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
      <Toaster position="top-right" richColors />
    </div>
  );
}
