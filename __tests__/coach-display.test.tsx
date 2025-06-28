/// <reference types="jest" />

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createClient } from '@/lib/supabase/client';
import { CoachProvider } from '@/hooks/useCoach';
import DashboardLayout from '@/components/DashboardLayout';
import AddPlayerModal from '@/app/protected/players/AddPlayerModal';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

describe('Coach Display Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  const mockCoach = {
    id: 'test-coach-id',
    first_name: 'Tahj',
    last_name: 'Holden',
    email: 'tahjholden@gmail.com',
    is_admin: true,
    auth_uid: 'test-auth-uid',
  };

  const mockUser = {
    id: 'test-auth-uid',
    email: 'tahjholden@gmail.com',
    user_metadata: {
      first_name: 'Coach', // This should be ignored
      last_name: 'Test',   // This should be ignored
    },
  };

  const renderWithCoachProvider = (component: React.ReactElement) => {
    return render(
      <CoachProvider>
        {component}
      </CoachProvider>
    );
  };

  describe('DashboardLayout Header', () => {
    it('should display coach name from database, not from user_metadata', async () => {
      // Mock the auth response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the coach query response
      mockSupabase.from.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockCoach,
            error: null,
          }),
        }),
      });

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Wait for the loading state to disappear and the coach name to appear
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Now check for the actual coach name
      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify that the old "Coach Test" from user_metadata is NOT displayed
      expect(screen.queryByText('Coach Test')).not.toBeInTheDocument();
    });

    it('should handle loading state gracefully', () => {
      // Mock a slow response
      mockSupabase.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { user: mockUser },
          error: null,
        }), 100))
      );

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle error state gracefully', async () => {
      // Mock an error response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('User not authenticated')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('AddPlayerModal', () => {
    it('should use coach data from context for team creation', async () => {
      // Mock the auth response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the coach query response
      mockSupabase.from.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockCoach,
            error: null,
          }),
        }),
      });

      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);

      // Wait for the coach data to load and the button to be enabled
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Add Player')).not.toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should show loading state when coach data is loading', () => {
      // Mock a slow response
      mockSupabase.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { user: mockUser },
          error: null,
        }), 100))
      );

      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state when coach data fails to load', async () => {
      // Mock an error response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Coach Context Integration', () => {
    it('should provide consistent coach data across all components', async () => {
      // Mock the auth response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the coach query response
      mockSupabase.from.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockCoach,
            error: null,
          }),
        }),
      });

      renderWithCoachProvider(
        <div>
          <DashboardLayout>Test Content</DashboardLayout>
          <AddPlayerModal onPlayerAdded={jest.fn()} />
        </div>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Both components should show the same coach name
      await waitFor(() => {
        const coachNames = screen.getAllByText('Tahj Holden');
        expect(coachNames).toHaveLength(1); // DashboardLayout shows it
      }, { timeout: 3000 });

      // Verify no components show the old user_metadata values
      expect(screen.queryByText('Coach Test')).not.toBeInTheDocument();
    });

    it('should handle coach data updates correctly', async () => {
      // Mock the auth response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the coach query response
      mockSupabase.from.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockCoach,
            error: null,
          }),
        }),
      });

      const { rerender } = renderWithCoachProvider(
        <DashboardLayout>Test Content</DashboardLayout>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Simulate coach data update (in real app, this would be triggered by a context update)
      const updatedCoach = { ...mockCoach, first_name: 'Updated', last_name: 'Name' };
      
      mockSupabase.from.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: updatedCoach,
            error: null,
          }),
        }),
      });

      // Re-render with updated data
      rerender(
        <CoachProvider>
          <DashboardLayout>Test Content</DashboardLayout>
        </CoachProvider>
      );

      // Should show updated name
      await waitFor(() => {
        expect(screen.getByText('Updated Name')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Data Source Verification', () => {
    it('should never use user.user_metadata for display purposes', async () => {
      // Mock the auth response with conflicting user_metadata
      const conflictingUser = {
        ...mockUser,
        user_metadata: {
          first_name: 'Wrong',
          last_name: 'Name',
        },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: conflictingUser },
        error: null,
      });

      // Mock the coach query response with correct database data
      mockSupabase.from.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockCoach, // This should be used, not user_metadata
            error: null,
          }),
        }),
      });

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Should show database data, not user_metadata
      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should NOT show user_metadata values
      expect(screen.queryByText('Wrong Name')).not.toBeInTheDocument();
    });

    it('should verify database queries are made with correct auth_uid', async () => {
      // Mock the auth response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the coach query response
      const mockEq = jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockCoach,
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        eq: mockEq,
      });

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify the database query was made with the correct auth_uid
      expect(mockSupabase.from).toHaveBeenCalledWith('coaches');
      expect(mockEq).toHaveBeenCalledWith('auth_uid', mockUser.id);
    });
  });
}); 