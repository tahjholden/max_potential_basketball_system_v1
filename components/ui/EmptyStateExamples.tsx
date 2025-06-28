"use client";

import { useState } from "react";
import EmptyState, { 
  NoPlayersEmptyState,
  NoCoachesEmptyState,
  NoTeamsEmptyState,
  NoObservationsEmptyState,
  NoPDPsEmptyState,
  NoArchivedPDPsEmptyState,
  SearchEmptyState,
  WelcomeEmptyState,
  ErrorEmptyState,
  LoadingEmptyState
} from "./EmptyState";
import EntityButton from "../EntityButton";

export function EmptyStateExamples() {
  const [searchTerm, setSearchTerm] = useState("test search");

  const handleAddPlayer = () => {
    console.log("Add player clicked");
  };

  const handleAddCoach = () => {
    console.log("Add coach clicked");
  };

  const handleAddTeam = () => {
    console.log("Add team clicked");
  };

  const handleAddObservation = () => {
    console.log("Add observation clicked");
  };

  const handleCreatePDP = () => {
    console.log("Create PDP clicked");
  };

  const handleGetStarted = () => {
    console.log("Get started clicked");
  };

  const handleRetry = () => {
    console.log("Retry clicked");
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gold">Empty State System Examples</h2>
      <p className="text-gray-300 mb-6">Comprehensive examples of all empty state variants and convenience components</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Base EmptyState Component */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Base EmptyState</h3>
          <EmptyState
            variant="default"
            title="Custom Title"
            description="This is a custom empty state with default styling."
            action={{
              label: "Custom Action",
              onClick: () => console.log("Custom action"),
              color: "gold"
            }}
          />
        </div>

        {/* No Data Variant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No Data Variant</h3>
          <EmptyState
            variant="no-data"
            title="No Items Available"
            description="There are no items to display at this time."
            action={{
              label: "Create First Item",
              onClick: () => console.log("Create item"),
              color: "gold"
            }}
          />
        </div>

        {/* Search Variant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Search Variant</h3>
          <EmptyState
            variant="search"
            title="No Search Results"
            description="Try adjusting your search terms or filters."
            action={{
              label: "Clear Search",
              onClick: () => console.log("Clear search"),
              color: "gray"
            }}
          />
        </div>

        {/* Welcome Variant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Welcome Variant</h3>
          <EmptyState
            variant="welcome"
            title="Welcome to the App"
            description="Get started by creating your first item."
            action={{
              label: "Get Started",
              onClick: () => console.log("Get started"),
              color: "gold"
            }}
          />
        </div>

        {/* Error Variant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Error Variant</h3>
          <EmptyState
            variant="error"
            title="Something Went Wrong"
            description="Failed to load data. Please try again."
            action={{
              label: "Try Again",
              onClick: () => console.log("Retry"),
              color: "gold"
            }}
          />
        </div>

        {/* Loading Variant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Loading Variant</h3>
          <EmptyState
            variant="loading"
            title="Loading Data"
            description="Please wait while we fetch your information."
          />
        </div>

        {/* Convenience Components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No Players</h3>
          <NoPlayersEmptyState onAddPlayer={handleAddPlayer} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No Coaches</h3>
          <NoCoachesEmptyState onAddCoach={handleAddCoach} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No Teams</h3>
          <NoTeamsEmptyState onAddTeam={handleAddTeam} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No Observations</h3>
          <NoObservationsEmptyState onAddObservation={handleAddObservation} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No PDPs</h3>
          <NoPDPsEmptyState onCreatePDP={handleCreatePDP} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">No Archived PDPs</h3>
          <NoArchivedPDPsEmptyState />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Search Results</h3>
          <SearchEmptyState searchTerm={searchTerm} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Welcome</h3>
          <WelcomeEmptyState onGetStarted={handleGetStarted} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Error with Retry</h3>
          <ErrorEmptyState 
            error="Failed to connect to the server. Please check your internet connection." 
            onRetry={handleRetry}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Error without Retry</h3>
          <ErrorEmptyState 
            error="This feature is not available in your current plan." 
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Loading</h3>
          <LoadingEmptyState message="Loading player data..." />
        </div>

        {/* Custom Empty State with Multiple Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Multiple Actions</h3>
          <EmptyState
            variant="no-data"
            title="No Data Available"
            description="You can either import existing data or create new items."
            action={{
              label: "Import Data",
              onClick: () => console.log("Import data"),
              color: "gold"
            }}
            secondaryAction={{
              label: "Create New",
              onClick: () => console.log("Create new"),
              color: "gray"
            }}
          />
        </div>

        {/* Custom Empty State with Children */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">With Custom Content</h3>
          <EmptyState
            variant="welcome"
            title="Welcome to the Dashboard"
            description="Here's what you can do to get started:"
            action={{
              label: "Get Started",
              onClick: () => console.log("Get started"),
              color: "gold"
            }}
          >
            <div className="text-left space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gold rounded-full"></span>
                <span>Add your first player</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gold rounded-full"></span>
                <span>Create a development plan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gold rounded-full"></span>
                <span>Record your first observation</span>
              </div>
            </div>
          </EmptyState>
        </div>

        {/* Custom Empty State without Icon */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Without Icon</h3>
          <EmptyState
            variant="default"
            title="Minimal Empty State"
            description="This empty state doesn't show an icon."
            showIcon={false}
            action={{
              label: "Take Action",
              onClick: () => console.log("Take action"),
              color: "gold"
            }}
          />
        </div>
      </div>

      {/* Usage Guide */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gold mb-4">Empty State Usage Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="text-white font-medium">Base Component</h4>
            <p className="text-gray-400">Use <code className="text-gold">EmptyState</code> for custom empty states with full control over styling and content.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">Convenience Components</h4>
            <p className="text-gray-400">Use pre-built components like <code className="text-gold">NoPlayersEmptyState</code> for common scenarios.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">Variants</h4>
            <p className="text-gray-400">Choose from: <code className="text-gold">default</code>, <code className="text-gold">search</code>, <code className="text-gold">no-data</code>, <code className="text-gold">welcome</code>, <code className="text-gold">error</code>, <code className="text-gold">loading</code></p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">Actions</h4>
            <p className="text-gray-400">Provide primary and secondary actions with customizable colors and labels.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 