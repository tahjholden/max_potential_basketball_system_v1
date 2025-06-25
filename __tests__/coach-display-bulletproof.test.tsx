import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CoachProvider } from '@/hooks/useCoach';
import DashboardLayout from '@/components/DashboardLayout';
import AddPlayerModal from '@/app/protected/players/AddPlayerModal';

// Mock the entire Supabase client to avoid async issues
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { 
          user: {
            id: 'test-auth-uid',
            email: 'tahjholden@gmail.com',
            user_metadata: {
              first_name: 'Coach', // This should be ignored
              last_name: 'Test',   // This should be ignored
            },
          }
        },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 'test-coach-id',
            first_name: 'Tahj',
            last_name: 'Holden',
            email: 'tahjholden@gmail.com',
            is_admin: true,
            auth_uid: 'test-auth-uid',
          },
          error: null,
        }),
      })),
    })),
  })),
}));

describe('Coach Display Tests - Bulletproof', () => {
  const renderWithCoachProvider = (component: React.ReactElement) => {
    return render(
      <CoachProvider>
        {component}
      </CoachProvider>
    );
  };

  describe('DashboardLayout Header', () => {
    it('should display coach name from database, not from user_metadata', async () => {
      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Wait for the loading state to disappear and the coach name to appear
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Now check for the actual coach name
      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify that the old "Coach Test" from user_metadata is NOT displayed
      expect(screen.queryByText('Coach Test')).not.toBeInTheDocument();
    });

    it('should handle loading state gracefully', async () => {
      // Mock a slow response
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      mockSupabase.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { 
            user: {
              id: 'test-auth-uid',
              email: 'tahjholden@gmail.com',
            }
          },
          error: null,
        }), 100))
      );

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle error state gracefully', async () => {
      // Mock an error response
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('User not authenticated')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('AddPlayerModal', () => {
    it('should use coach data from context for team creation', async () => {
      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);

      // Wait for the coach data to load and the button to be enabled
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.getByText('Add Player')).not.toBeDisabled();
      }, { timeout: 5000 });
    });

    it('should show loading state when coach data is loading', async () => {
      // Mock a slow response
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      mockSupabase.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { 
            user: {
              id: 'test-auth-uid',
              email: 'tahjholden@gmail.com',
            }
          },
          error: null,
        }), 100))
      );

      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state when coach data fails to load', async () => {
      // Mock an error response
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      renderWithCoachProvider(<AddPlayerModal onPlayerAdded={jest.fn()} />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Coach Context Integration', () => {
    it('should provide consistent coach data across all components', async () => {
      renderWithCoachProvider(
        <div>
          <DashboardLayout>Test Content</DashboardLayout>
          <AddPlayerModal onPlayerAdded={jest.fn()} />
        </div>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Both components should show the same coach name
      await waitFor(() => {
        const coachNames = screen.getAllByText('Tahj Holden');
        expect(coachNames).toHaveLength(1); // DashboardLayout shows it
      }, { timeout: 5000 });

      // Verify no components show the old user_metadata values
      expect(screen.queryByText('Coach Test')).not.toBeInTheDocument();
    });
  });

  describe('Data Source Verification', () => {
    it('should never use user.user_metadata for display purposes', async () => {
      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show database data, not user_metadata
      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should NOT show user_metadata values
      expect(screen.queryByText('Coach Test')).not.toBeInTheDocument();
    });

    it('should verify database queries are made with correct auth_uid', async () => {
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      const mockEq = mockSupabase.from().eq;

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.getByText('Tahj Holden')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify the database query was made with the correct auth_uid
      expect(mockSupabase.from).toHaveBeenCalledWith('coaches');
      expect(mockEq).toHaveBeenCalledWith('auth_uid', 'test-auth-uid');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing coach record gracefully', async () => {
      // Mock no coach found
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      mockSupabase.from().eq().maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Coach record not found')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const { createClient } = require('@/lib/supabase/client');
      const mockSupabase = createClient();
      mockSupabase.from().eq().maybeSingle.mockRejectedValue(
        new Error('Network error')
      );

      renderWithCoachProvider(<DashboardLayout>Test Content</DashboardLayout>);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch coach data')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });
}); 