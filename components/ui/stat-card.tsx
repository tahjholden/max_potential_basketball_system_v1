import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="bg-[#121212] border border-gold rounded-xl shadow flex flex-col items-center py-6 px-4 min-w-[120px]">
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 text-gold text-2xl">{icon}</span>}
        <span className="text-white text-lg font-semibold">{label}</span>
      </div>
      <span className="text-4xl font-bold text-gold">{value}</span>
    </div>
  );
} 