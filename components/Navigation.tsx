"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Smartphone,
  Monitor,
  Home,
  Shield,
  BarChart2,
  Building2,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const mainNavLinks = [
  { href: "/protected/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/protected/teams", label: "Teams", icon: Building2 },
  { href: "/protected/coaches", label: "Coaches", icon: UserCheck },
  { href: "/protected/players", label: "Players", icon: Users },
  {
    href: "/protected/observations",
    label: "Observations",
    icon: Shield,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const renderLink = (link: any, index: number) => {
    const isActive = pathname === link.href;
    return (
      <Link href={link.href} key={index}>
        <div
          className={`flex items-center p-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? "bg-gold text-black"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <link.icon className="w-5 h-5 mr-3" />
          {link.label}
        </div>
      </Link>
    );
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-grow space-y-2">
        {mainNavLinks.map(renderLink)}
      </div>
    </nav>
  );
} 