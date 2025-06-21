import React from 'react';

interface ThreePaneLayoutProps {
  leftPane: React.ReactNode;
  mainPane: React.ReactNode;
  rightPane?: React.ReactNode;
  leftPaneClassName?: string;
  mainPaneClassName?: string;
  rightPaneClassName?: string;
}

export default function ThreePaneLayout({ 
  leftPane, 
  mainPane, 
  rightPane,
  leftPaneClassName = "w-[25%] bg-[#1f1f1f] rounded-lg p-4",
  mainPaneClassName = "flex-1 bg-[#1f1f1f] rounded-lg p-4",
  rightPaneClassName = "w-[35%] bg-[#1f1f1f] rounded-lg p-4"
}: ThreePaneLayoutProps) {
  return (
    <div className="flex h-full w-full gap-4 text-white">
      <div className={leftPaneClassName}>
        {leftPane}
      </div>
      <div className={mainPaneClassName}>
        {mainPane}
      </div>
      {rightPane && (
        <div className={rightPaneClassName}>
          {rightPane}
        </div>
      )}
    </div>
  );
} 