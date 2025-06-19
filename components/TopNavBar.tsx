import Image from "next/image";

export default function TopNavBar({ userName }: { userName: string }) {
  return (
    <header className="w-full bg-black px-6 py-4 flex justify-between items-center border-b border-slate-700">
      <div className="flex items-center gap-3">
        <Image src="/maxsM.png" alt="Logo" width={36} height={36} />
        <h1 className="text-lg font-bold text-gold">MP Player Development</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white">{userName}</span>
        <button className="text-white text-sm hover:underline">Logout</button>
      </div>
    </header>
  );
} 