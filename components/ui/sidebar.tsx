import Link from "next/link";

export default function Sidebar({ missingPDPCount = 0 }) {
  return (
    <nav className="p-4">
      <ul className="space-y-2">
        <li>
          <Link href="/protected/dashboard" className="block px-3 py-2 rounded hover:bg-zinc-800 text-white">
            Dashboard
          </Link>
        </li>
        <li className="flex items-center gap-2">
          <Link href="/protected/players" className="block px-3 py-2 rounded hover:bg-zinc-800 text-white flex-1">
            Players
          </Link>
          {missingPDPCount > 0 && (
            <span className="ml-1 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">{missingPDPCount}</span>
          )}
        </li>
        <li>
          <Link href="/protected/observations" className="block px-3 py-2 rounded hover:bg-zinc-800 text-white">
            Observations
          </Link>
        </li>
        <li>
          <Link href="/protected/teams" className="block px-3 py-2 rounded hover:bg-zinc-800 text-white">
            Teams
          </Link>
        </li>
      </ul>
    </nav>
  );
} 