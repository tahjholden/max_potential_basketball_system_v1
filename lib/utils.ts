import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Shared button styling for consistency - matches ArchiveAndReplaceButton with standard sizing
export const actionButtonClass = "border border-[#C2B56B] text-sm px-4 py-2 rounded font-semibold text-[#C2B56B] hover:bg-[#C2B56B]/10 transition disabled:opacity-50";

// Helper function to format coach names
export const getCoachName = (coach: any) => {
  if (!coach) return "Unknown Coach";
  return `${coach.first_name || ""} ${coach.last_name || ""}`.trim() || "Unknown Coach";
};
