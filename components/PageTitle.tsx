import React from "react";

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PageTitle = ({ children, className = "" }: PageTitleProps) => {
  return (
    <h1
      className={`text-white text-2xl font-bold tracking-tight mb-6 ${className}`}
    >
      {children}
    </h1>
  );
};

export default PageTitle; 