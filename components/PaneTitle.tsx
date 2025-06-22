import React from "react";

interface PaneTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PaneTitle = ({ children, className = "" }: PaneTitleProps) => {
  return (
    <h2
      className={`text-zinc-100 text-lg font-semibold mb-2 ${className}`}
    >
      {children}
    </h2>
  );
};

export default PaneTitle; 