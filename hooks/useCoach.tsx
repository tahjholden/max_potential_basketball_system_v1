"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useCurrentCoach, Coach } from "./useCurrentCoach";

interface CoachContextType {
  coach: Coach | null;
  loading: boolean;
  error: string | null;
  coachName: string;
  isAdmin: boolean;
  isSuperadmin: boolean;
}

const CoachContext = createContext<CoachContextType | undefined>(undefined);

interface CoachProviderProps {
  children: ReactNode;
}

export function CoachProvider({ children }: CoachProviderProps) {
  const { coach, loading, error } = useCurrentCoach();

  const coachName = coach 
    ? `${coach.first_name || ""} ${coach.last_name || ""}`.trim() || coach.email || "Unknown Coach"
    : "Loading...";

  const isAdmin = coach?.is_admin || false;
  const isSuperadmin = coach?.is_superadmin || false;

  const value: CoachContextType = {
    coach,
    loading,
    error,
    coachName,
    isAdmin,
    isSuperadmin,
  };

  return (
    <CoachContext.Provider value={value}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  const context = useContext(CoachContext);
  if (context === undefined) {
    throw new Error("useCoach must be used within a CoachProvider");
  }
  return context;
}

// Convenience hooks for common use cases
export function useCoachName() {
  const { coachName } = useCoach();
  return coachName;
}

export function useIsAdmin() {
  const { isAdmin } = useCoach();
  return isAdmin;
}

export function useIsSuperadmin() {
  const { isSuperadmin } = useCoach();
  return isSuperadmin;
}

export function useCoachId() {
  const { coach } = useCoach();
  return coach?.id;
} 