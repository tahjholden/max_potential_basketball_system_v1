import { ReactNode } from "react";
import { LucideIcon, Users, FileText, Archive, Search, AlertCircle, Plus } from "lucide-react";
import EntityButton from "../EntityButton";
import Image from "next/image";
import maxsM from "@/public/maxsM.png";

type EmptyStateVariant = "default" | "search" | "no-data" | "welcome" | "error" | "loading";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    color?: "gold" | "danger" | "archive" | "gray";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    color?: "gold" | "danger" | "archive" | "gray";
  };
  children?: ReactNode;
  className?: string;
  showIcon?: boolean;
}

const variantDefaults: Record<EmptyStateVariant, {
  icon: LucideIcon;
  title: string;
  description: string;
}> = {
  default: {
    icon: Users,
    title: "No Items Found",
    description: "There are no items to display at the moment."
  },
  search: {
    icon: Search,
    title: "No Results Found",
    description: "Try adjusting your search terms or filters."
  },
  "no-data": {
    icon: FileText,
    title: "No Data Available",
    description: "There is no data to display yet."
  },
  welcome: {
    icon: Users,
    title: "Welcome",
    description: "Get started by adding your first item."
  },
  error: {
    icon: AlertCircle,
    title: "Something Went Wrong",
    description: "An error occurred while loading the data."
  },
  loading: {
    icon: Users,
    title: "Loading...",
    description: "Please wait while we load your data."
  }
};

export default function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  action,
  secondaryAction,
  children,
  className = "",
  showIcon = true
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const IconComponent = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center ${className}`}>
      {showIcon && (
        <div className="flex justify-center mb-4">
          <IconComponent 
            className={`w-12 h-12 ${
              variant === "error" ? "text-red-400" :
              variant === "loading" ? "text-zinc-400 animate-pulse" :
              "text-zinc-400"
            }`} 
          />
        </div>
      )}
      
      <h3 className={`text-lg font-semibold mb-2 ${
        variant === "error" ? "text-red-300" : "text-zinc-300"
      }`}>
        {displayTitle}
      </h3>
      
      <p className={`text-sm mb-4 ${
        variant === "error" ? "text-red-400" : "text-zinc-400"
      }`}>
        {displayDescription}
      </p>

      {children && (
        <div className="mb-4">
          {children}
        </div>
      )}

      {(action || secondaryAction) && (
        <div className={`flex gap-2 ${secondaryAction ? "justify-center" : "justify-center"}`}>
          {action && (
            <EntityButton
              color={action.color || "gold"}
              onClick={action.onClick}
            >
              {action.label}
            </EntityButton>
          )}
          {secondaryAction && (
            <EntityButton
              color={secondaryAction.color || "gray"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </EntityButton>
          )}
        </div>
      )}
    </div>
  );
}

// Convenience components for common empty states
export function NoPlayersEmptyState({ onAddPlayer }: { onAddPlayer: () => void }) {
  return (
    <EmptyState
      variant="no-data"
      title="No Players Found"
      description="There are no players in your team yet. Add your first player to get started."
      icon={Users}
      action={{
        label: "Add Player",
        onClick: onAddPlayer,
        color: "gold"
      }}
    />
  );
}

export function NoCoachesEmptyState({ onAddCoach }: { onAddCoach: () => void }) {
  return (
    <EmptyState
      variant="no-data"
      title="No Coaches Found"
      description="There are no coaches in your team yet. Add your first coach to get started."
      icon={Users}
      action={{
        label: "Add Coach",
        onClick: onAddCoach,
        color: "gold"
      }}
    />
  );
}

export function NoTeamsEmptyState({ onAddTeam }: { onAddTeam: () => void }) {
  return (
    <EmptyState
      variant="no-data"
      title="No Teams Found"
      description="There are no teams in your organization yet. Add your first team to get started."
      icon={Users}
      action={{
        label: "Add Team",
        onClick: onAddTeam,
        color: "gold"
      }}
    />
  );
}

export function NoObservationsEmptyState({ onAddObservation }: { onAddObservation: () => void }) {
  return (
    <EmptyState
      variant="no-data"
      title="No Observations"
      description="No observations have been recorded yet. Add your first observation to get started."
      icon={FileText}
      action={{
        label: "Add Observation",
        onClick: onAddObservation,
        color: "gold"
      }}
    />
  );
}

export function NoPDPsEmptyState({ onCreatePDP }: { onCreatePDP: () => void }) {
  return (
    <EmptyState
      variant="no-data"
      title="No Development Plan Yet"
      description="Get started by adding a new development plan for this player."
      showIcon={false}
      action={{
        label: "Add PDP",
        onClick: onCreatePDP,
        color: "gold"
      }}
    >
      <Image src={maxsM} alt="No PDP" width={240} height={240} className="mx-auto opacity-80 mb-4" />
    </EmptyState>
  );
}

export function NoArchivedPDPsEmptyState() {
  return (
    <EmptyState
      variant="no-data"
      title="No Archived Plans"
      description="Archived development plans will appear here once you create and archive PDPs."
      icon={Archive}
      className="py-12 text-lg font-semibold text-zinc-300"
    />
  );
}

export function SearchEmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      variant="search"
      title="No Results Found"
      description={`No items found matching "${searchTerm}". Try adjusting your search terms.`}
      icon={Search}
    />
  );
}

export function WelcomeEmptyState({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <EmptyState
      variant="welcome"
      title="Welcome to MP Player Development"
      description="To get started, select a player from the list or add a new one."
      icon={Users}
      action={{
        label: "Get Started",
        onClick: onGetStarted,
        color: "gold"
      }}
    />
  );
}

export function ErrorEmptyState({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title="Something Went Wrong"
      description={error}
      icon={AlertCircle}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        color: "gold"
      } : undefined}
    />
  );
}

export function LoadingEmptyState({ message }: { message?: string }) {
  return (
    <EmptyState
      variant="loading"
      title="Loading..."
      description={message || "Please wait while we load your data."}
      icon={Users}
      showIcon={true}
    />
  );
} 