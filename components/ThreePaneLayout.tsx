import { ReactNode } from "react";

interface ThreePaneLayoutProps {
  leftPane: ReactNode;
  centerPane: ReactNode;
  rightPane: ReactNode;
}

export default function ThreePaneLayout({
  leftPane,
  centerPane,
  rightPane,
}: ThreePaneLayoutProps) {
  return (
    <div className="flex w-full px-6 gap-4 mt-6">
      <div className="w-[260px] shrink-0">{leftPane}</div>
      <div className="flex-1 flex flex-col h-full">{centerPane}</div>
      <div className="w-[260px] shrink-0">{rightPane}</div>
    </div>
  );
} 