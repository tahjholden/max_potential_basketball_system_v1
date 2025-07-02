import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Eye, Users2 } from "lucide-react";

const navItems = [
  {
    href: "/protected/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/protected/players",
    label: "Players",
    icon: Users,
  },
  {
    href: "/protected/observations",
    label: "Observations",
    icon: Eye,
  },
  {
    href: "/protected/teams",
    label: "Teams",
    icon: Users2,
  },
];

export default function Sidebar({ missingPDPCount = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <nav className={`h-full flex flex-col ${expanded ? 'w-56' : 'w-20'} bg-zinc-950 transition-all duration-200`}> 
      <div className="flex items-center justify-between px-4 py-3">
        {expanded && <span className="text-lg font-bold text-gold">MPB</span>}
        <button
          className="text-zinc-400 hover:text-gold focus:outline-none"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={expanded ? "M19 12H5" : "M12 5v14"} />
          </svg>
        </button>
      </div>
      <ul className="flex-1 space-y-2 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded transition-colors duration-100
                  ${isActive ? "bg-zinc-900" : "hover:bg-zinc-800 text-white"}
                `}
                style={
                  isActive
                    ? { color: "#C2B56B", fontWeight: 600 }
                    : undefined
                }
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? "text-gold" : "text-white"}`}
                  style={{ margin: expanded ? undefined : "auto" }}
                />
                {expanded && (
                  <span className={`font-semibold text-base ${isActive ? "text-gold" : "text-white"}`}>{label}</span>
                )}
                {href === "/protected/players" && missingPDPCount > 0 && expanded && (
                  <span className="ml-1 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">{missingPDPCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 