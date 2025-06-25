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
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-[240px] bg-zinc-950 border-r border-zinc-800 z-40 p-4 overflow-y-auto">
        <Navigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-[240px] flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 bg-black border-b border-zinc-800 px-6 py-4 flex justify-end items-center">
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>{coachName}</span>
            <LogoutButton />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 