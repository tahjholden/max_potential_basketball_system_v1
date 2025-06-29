import React from "react";

export default function ThreePaneLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 h-full w-full">
      <div className="flex-1 min-w-0">{left}</div>
      <div className="flex-[2] min-w-0 flex flex-col gap-4">{center}</div>
      <div className="flex-1 min-w-0">{right}</div>
    </div>
  );
} 