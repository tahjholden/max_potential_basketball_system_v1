"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ClipboardList, BarChart3, Settings, Smartphone, Monitor } from "lucide-react";

const navItems = [
  { text: "Dashboard", path: "/protected/dashboard", icon: <Users className="w-5 h-5" /> },
  { text: "Observations", path: "/protected/observations", icon: <ClipboardList className="w-5 h-5" /> },
];

const testItems = [
  { text: "Test Dashboard", path: "/protected/test-dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { text: "Test Players", path: "/protected/test-players", icon: <Settings className="w-5 h-5" /> },
  { text: "Test Observations", path: "/protected/test-observations", icon: <Settings className="w-5 h-5" /> },
];

const mobileTestItems = [
  { text: "Test Dashboard Mobile", path: "/protected/test-dashboard-mobile", icon: <Smartphone className="w-5 h-5" /> },
  { text: "Test Players Mobile", path: "/protected/test-players-mobile", icon: <Smartphone className="w-5 h-5" /> },
  { text: "Test Observations Mobile", path: "/protected/test-observations-mobile", icon: <Smartphone className="w-5 h-5" /> },
];

export function Navigation() {
  const pathname = usePathname();

  const renderNavItems = (items: typeof navItems) => {
    return items.map((item) => {
      const isActive = pathname === item.path;
      return (
        <li key={item.text}>
          <Link
            href={item.path}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              isActive 
                ? "bg-gold/10 border-r-4 border-gold text-gold" 
                : "hover:bg-gold/10 text-white"
            }`}
          >
            <span className="text-gold">{item.icon}</span>
            <span className="font-medium">{item.text}</span>
          </Link>
        </li>
      );
    });
  };

  return (
    <nav className="flex-1">
      <ul className="space-y-2">
        <li className="mb-4">
          <h2 className="text-gold text-lg font-bold px-3 whitespace-nowrap">MP Player Development</h2>
        </li>
        {renderNavItems(navItems)}
        
        {/* Test Pages Section */}
        <li className="pt-4 border-t border-zinc-700">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 py-2">
            Test Pages
          </h3>
        </li>
        {renderNavItems(testItems)}
        
        {/* Mobile Test Pages Section */}
        <li className="pt-4 border-t border-zinc-700">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 py-2">
            Mobile Test
          </h3>
        </li>
        {renderNavItems(mobileTestItems)}
      </ul>
    </nav>
  );
} 