import React from "react";

export default function SectionLabel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`uppercase tracking-widest font-bold text-sm text-zinc-400 mb-2 ${className}`}>
      {children}
    </h2>
  );
} 