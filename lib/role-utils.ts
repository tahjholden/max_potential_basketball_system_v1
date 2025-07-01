import { Coach } from "@/hooks/useCurrentCoach";

export type UserRole = 'coach' | 'admin' | 'superadmin';

/**
 * Get the user's role based on their coach record
 */
export function getUserRole(coach: Coach | null): UserRole {
  if (!coach) return 'coach';
  if (coach.is_superadmin) return 'superadmin';
  if (coach.is_admin) return 'admin';
  return 'coach';
}

/**
 * Check if user has admin or higher privileges
 */
export function isAdminOrHigher(coach: Coach | null): boolean {
  const role = getUserRole(coach);
  return role === 'admin' || role === 'superadmin';
}

/**
 * Check if user has superadmin privileges
 */
export function isSuperadmin(coach: Coach | null): boolean {
  return getUserRole(coach) === 'superadmin';
}

/**
 * Check if user can access data from a specific organization
 */
export function canAccessOrg(coach: Coach | null, orgId: string | null): boolean {
  if (!coach || !orgId) return false;
  
  const role = getUserRole(coach);
  
  // Superadmin can access all organizations
  if (role === 'superadmin') return true;
  
  // Admin and Coach can only access their own organization
  return coach.org_id === orgId;
}

/**
 * Check if user can manage coaches (admin or superadmin)
 */
export function canManageCoaches(coach: Coach | null): boolean {
  return isAdminOrHigher(coach);
}

/**
 * Check if user can manage teams (admin or superadmin, or team owner)
 */
export function canManageTeam(coach: Coach | null, teamCoachId?: string): boolean {
  if (!coach) return false;
  
  const role = getUserRole(coach);
  
  // Superadmin and Admin can manage all teams
  if (role === 'superadmin' || role === 'admin') return true;
  
  // Coach can manage teams they own
  return teamCoachId === coach.id;
}

/**
 * Check if user can view all data (admin or superadmin)
 */
export function canViewAllData(coach: Coach | null): boolean {
  return isAdminOrHigher(coach);
}

/**
 * Get the appropriate data filter based on user role
 */
export function getDataFilter(coach: Coach | null) {
  if (!coach) return { org_id: null };
  
  const role = getUserRole(coach);
  
  // Superadmin sees all data (no filter)
  if (role === 'superadmin') return {};
  
  // Admin and Coach are filtered by organization
  return { org_id: coach.org_id };
}

/**
 * Get the appropriate team filter based on user role
 */
export function getTeamFilter(coach: Coach | null) {
  if (!coach) return { org_id: null };
  
  const role = getUserRole(coach);
  
  // Superadmin sees all teams
  if (role === 'superadmin') return {};
  
  // Admin sees all teams in their org
  if (role === 'admin') return { org_id: coach.org_id };
  
  // Coach sees teams they're assigned to or own
  return { org_id: coach.org_id };
} 