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
    <div className="flex gap-6 min-h-0 w-full">
      <div className="flex-1 min-w-0 flex flex-col">{leftPane}</div>
      <div className="flex-[2] min-w-0 flex flex-col">{centerPane}</div>
      <div className="flex-1 min-w-0 flex flex-col">{rightPane}</div>
    </div>
  );
} 