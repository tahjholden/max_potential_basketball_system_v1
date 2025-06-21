"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ClipboardList, BarChart3, Settings } from "lucide-react";

const navItems = [
  { text: "Dashboard", path: "/protected/dashboard", icon: <Users className="w-5 h-5" /> },
  { text: "Observations", path: "/protected/observations", icon: <ClipboardList className="w-5 h-5" /> },
  { text: "Legacy Dashboard", path: "/protected/legacy-dashboard", icon: <BarChart3 className="w-5 h-5" /> },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex-1">
      <ul className="space-y-2">
        {navItems.map((item) => {
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
        })}
      </ul>
    </nav>
  );
} 