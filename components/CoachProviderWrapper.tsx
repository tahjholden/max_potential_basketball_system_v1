"use client";

import { ReactNode } from "react";
import { CoachProvider } from "@/hooks/useCoach";

interface CoachProviderWrapperProps {
  children: ReactNode;
}

export default function CoachProviderWrapper({ children }: CoachProviderWrapperProps) {
  return (
    <CoachProvider>
      {children}
    </CoachProvider>
  );
} 