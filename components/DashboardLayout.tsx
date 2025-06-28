"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { LogoutButton } from "@/components/logout-button";
import { useCoachName } from "@/hooks/useCoach";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const coachName = useCoachName();

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* HEADER (spans entire page, sticky) */}
      <header className="sticky top-0 left-0 right-0 z-40 h-16 w-full bg-zinc-900 border-b border-zinc-800 flex items-center px-6">
        <div className="flex items-center gap-4 text-lg font-bold text-[#C2B56B]">
          MP Player Development
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500 ml-auto">
          <span>{coachName}</span>
          <LogoutButton />
        </div>
      </header>
      {/* SIDEBAR + MAIN AREA */}
      <div className="flex flex-1 min-h-0">
        {/* SIDEBAR */}
        <aside className="group/sidebar flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-200 w-[56px] hover:w-[220px] min-w-[56px] h-screen overflow-x-hidden">
          <Navigation />
        </aside>
        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 min-h-0 overflow-y-auto p-6">
            <div className="flex gap-6 min-h-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 