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
} from "lucide-react";

const mainNavLinks = [
  { href: "/protected/test-dashboard", label: "Dashboard", icon: BarChart2 },
  {
    href: "/protected/test-observations",
    label: "Observations",
    icon: Shield,
  },
  { href: "/protected/players", label: "Players", icon: Users },
];

const testNavLinks: typeof mainNavLinks = [];

const mobileTestNavLinks = [
  {
    href: "/protected/test-dashboard-mobile",
    label: "Test Dashboard Mobile",
    icon: Smartphone,
  },
  {
    href: "/protected/test-players-mobile",
    label: "Test Players Mobile",
    icon: Smartphone,
  },
  {
    href: "/protected/test-observations-mobile",
    label: "Test Observations Mobile",
    icon: Smartphone,
  },
];

const legacyNavLinks = [
  { href: "/dashboard", label: "Legacy Dashboard", icon: Home },
  {
    href: "/protected/observations",
    label: "Legacy Observations",
    icon: ClipboardList,
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

        <div className="pt-4">
          <h4 className="px-2 mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Test Pages
          </h4>
          <div className="space-y-2">{testNavLinks.map(renderLink)}</div>
        </div>

        <div className="pt-4">
          <h4 className="px-2 mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Mobile Test
          </h4>
          <div className="space-y-2">
            {mobileTestNavLinks.map(renderLink)}
          </div>
        </div>
      </div>

      {/* New Legacy section at the bottom */}
      <div className="pt-4">
        <h4 className="px-2 mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          Legacy
        </h4>
        <div className="space-y-2">{legacyNavLinks.map(renderLink)}</div>
      </div>
    </nav>
  );
} 