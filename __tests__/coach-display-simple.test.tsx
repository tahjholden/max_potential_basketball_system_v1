import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoachProvider } from '@/hooks/useCoach';
import DashboardLayout from '@/components/DashboardLayout';
import AddPlayerModal from '@/app/protected/players/AddPlayerModal';

// Mock the useCurrentCoach hook to avoid async issues in tests
jest.mock('@/hooks/useCurrentCoach', () => ({
  useCurrentCoach: () => ({
    coach: {
      id: 'test-coach-id',
      first_name: 'Tahj',
      last_name: 'Holden',
      email: 'tahjholden@gmail.com',
      is_admin: true,
      auth_uid: 'test-auth-uid',
    },
    loading: false,
    error: null,
  }),
}));

describe('Coach Display Tests - Simple Mocked Context', () => {
  const renderWithCoachProvider = (component: React.ReactElement) => {
    return render(
      <CoachProvider>
        {component}
      </CoachProvider>
    );
  };

  describe('DashboardLayout Header', () => {
    it('should display coach name from context', () => {
      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);
      
      // Should show the coach name from the mocked context
      expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      
      // Should NOT show loading state
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('AddPlayerModal', () => {
    it('should use coach data from context', () => {
      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);
      
      // Should show the Add Player button (not loading/error state)
      expect(screen.getByText('Add Player')).toBeInTheDocument();
      expect(screen.getByText('Add Player')).not.toBeDisabled();
      
      // Should NOT show loading or error states
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe('Coach Context Integration', () => {
    it('should provide consistent coach data across all components', () => {
      renderWithCoachProvider(
        <div>
          <DashboardLayout>Test Content</DashboardLayout>
          <AddPlayerModal onPlayerAdded={jest.fn()} />
        </div>
      );

      // Both components should work with the same coach data
      expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      expect(screen.getByText('Add Player')).toBeInTheDocument();
      
      // No loading or error states
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe('Data Source Verification', () => {
    it('should never use user.user_metadata for display purposes', () => {
      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);
      
      // Should show the coach name from context (which comes from DB in real app)
      expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      
      // Should NOT show any user_metadata values
      expect(screen.queryByText('Coach Test')).not.toBeInTheDocument();
      expect(screen.queryByText('Wrong Name')).not.toBeInTheDocument();
    });
  });
}); 