"use client";

import DevNavigation from "@/components/DevNavigation";
import { LogoutButton } from "@/components/logout-button";

export default function DevNavigationPage() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-[240px] bg-zinc-950 border-r border-zinc-800 z-40 p-4 overflow-y-auto">
        <DevNavigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-[240px] flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 bg-black border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-white font-semibold">Development Navigation</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>Dev Mode</span>
            <LogoutButton />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold text-white mb-4">
                Development Navigation
              </h2>
              <p className="text-zinc-400 mb-6">
                This page contains all the development and test navigation items that have been moved from the main navigation.
                Use the sidebar to navigate between different test pages and legacy components.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Player Development</h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Player Development</li>
                    <li>• Player Development V2</li>
                  </ul>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Test Pages</h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Test Dashboard</li>
                    <li>• Test Players</li>
                    <li>• Test Observations</li>
                  </ul>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Mobile Test</h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Test Dashboard Mobile</li>
                    <li>• Test Players Mobile</li>
                    <li>• Test Observations Mobile</li>
                  </ul>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Legacy</h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Legacy Dashboard</li>
                    <li>• Legacy Observations</li>
                  </ul>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Other Dev Pages</h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Legacy Dashboard 2</li>
                    <li>• Legacy Players</li>
                    <li>• Legacy Observations</li>
                    <li>• Showcase</li>
                    <li>• Bulk Archive Test</li>
                    <li>• Edit PDP Test</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 