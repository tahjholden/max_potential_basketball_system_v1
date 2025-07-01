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
    <div className="flex gap-6 h-full w-full">
      <div className="flex-1 min-w-0 flex flex-col h-full">{leftPane}</div>
      <div className="flex-[2] min-w-0 flex flex-col h-full">{centerPane}</div>
      <div className="flex-1 min-w-0 flex flex-col h-full">{rightPane}</div>
    </div>
  );
} 