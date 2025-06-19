import Link from "next/link";

export default function Sidebar({ missingPDPCount = 0 }) {
  <nav>
    <ul>
      <li>
        <Link href="/protected/dashboard">Dashboard</Link>
      </li>
      <li className="flex items-center gap-2">
        <Link href="/protected/players">Players</Link>
        {missingPDPCount > 0 && (
          <span className="ml-1 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">{missingPDPCount}</span>
        )}
      </li>
      <li>
        <Link href="/protected/observations">Observations</Link>
      </li>
    </ul>
  </nav>
} 