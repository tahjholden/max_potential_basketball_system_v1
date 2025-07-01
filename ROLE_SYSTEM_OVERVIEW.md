# Three-Tier Role System Overview

## Overview
The application now implements a three-tier role system to provide granular access control across organizations:

1. **Superadmin** - Full system access across all organizations
2. **Admin** - Organization-wide access within their assigned organization
3. **Coach** - Team-based access within their assigned organization

## Role Hierarchy

### Superadmin
- **Access Level**: Full system access
- **Data Visibility**: All data across all organizations
- **Permissions**:
  - View all organizations, teams, players, coaches, observations, and PDPs
  - Create and manage coaches across all organizations
  - Assign superadmin, admin, or coach roles
  - Manage all teams and players
  - Access all activity logs
- **UI Indicators**: Purple color scheme with "SUPERADMIN" badge

### Admin
- **Access Level**: Organization-wide access
- **Data Visibility**: All data within their assigned organization
- **Permissions**:
  - View all teams, players, coaches, observations, and PDPs in their organization
  - Create and manage coaches within their organization
  - Assign admin or coach roles (cannot assign superadmin)
  - Manage all teams and players in their organization
  - Access activity logs for their organization
- **UI Indicators**: Gold color scheme with "ADMIN" badge

### Coach
- **Access Level**: Team-based access
- **Data Visibility**: Data for teams they're assigned to within their organization
- **Permissions**:
  - View players, observations, and PDPs for teams they're assigned to
  - Create observations and PDPs for their team players
  - View coaches in their organization
  - Access activity logs for their team activities
- **UI Indicators**: Bronze/gold color scheme (no special badge)

## Database Schema Changes

### New Columns Added
- `coaches.is_superadmin` (boolean) - Indicates superadmin status
- `coaches.org_id` (uuid) - Links coach to organization
- `players.org_id` (uuid) - Links player to organization
- `teams.org_id` (uuid) - Links team to organization
- `observations.org_id` (uuid) - Links observation to organization
- `pdp.org_id` (uuid) - Links PDP to organization
- `activity_log.performed_by` (uuid) - Links activity to performing coach

### New Tables
- `orgs` - Organizations table with name and creation date

## Row Level Security (RLS) Policies

### Three-Tier Access Control
All RLS policies now implement the three-tier system:

1. **Superadmin Check**: `EXISTS (SELECT 1 FROM coaches c WHERE c.auth_uid = auth.uid() AND c.is_superadmin = true)`
2. **Admin Check**: `EXISTS (SELECT 1 FROM coaches c WHERE c.auth_uid = auth.uid() AND c.is_admin = true AND c.org_id = table.org_id)`
3. **Coach Check**: `EXISTS (SELECT 1 FROM coaches c JOIN team_coaches tc ON tc.coach_id = c.id WHERE c.auth_uid = auth.uid() AND c.org_id = table.org_id AND tc.team_id = players.team_id)`

### Tables with Updated RLS
- `players` - Three-tier access based on team assignments and organization
- `observations` - Three-tier access based on player team assignments
- `pdp` - Three-tier access based on player team assignments
- `teams` - Three-tier access based on team assignments and organization
- `coaches` - Three-tier access based on organization membership
- `activity_log` - Three-tier access based on related data and organization
- `orgs` - Superadmin sees all, others see their own organization

## Frontend Implementation

### Role Detection
```typescript
import { getUserRole, isAdminOrHigher, isSuperadmin } from '@/lib/role-utils';

const role = getUserRole(coach); // 'coach' | 'admin' | 'superadmin'
const canManageCoaches = isAdminOrHigher(coach);
const canAssignSuperadmin = isSuperadmin(coach);
```

### Data Filtering
```typescript
import { getDataFilter, getTeamFilter } from '@/lib/role-utils';

// For queries
const filter = getDataFilter(coach);
const teamFilter = getTeamFilter(coach);
```

### UI Components
- **CoachListPane**: Shows role badges and color coding
- **AddCoachModal**: Role selection with permission validation
- **CoachDetailPane**: Role-specific action buttons
- **Navigation**: Role-based menu items and permissions

## Migration Guide

### Running the Migration
```bash
# Apply the new migration
supabase db push
```

### Data Migration Notes
- Existing coaches will have `is_superadmin = false` and `is_admin = false` by default
- Existing data will need `org_id` values assigned
- Teams and players will need `org_id` values assigned
- Consider creating a default organization for existing data

### Manual Role Assignment
```sql
-- Assign superadmin role to a specific coach
UPDATE coaches 
SET is_superadmin = true 
WHERE email = 'admin@example.com';

-- Assign admin role to a coach
UPDATE coaches 
SET is_admin = true 
WHERE email = 'manager@example.com';

-- Assign organization to existing data
UPDATE coaches SET org_id = 'default-org-id' WHERE org_id IS NULL;
UPDATE teams SET org_id = 'default-org-id' WHERE org_id IS NULL;
UPDATE players SET org_id = 'default-org-id' WHERE org_id IS NULL;
```

## Security Considerations

### Role Assignment
- Only superadmins can assign superadmin roles
- Only admins and superadmins can assign admin roles
- Coaches cannot assign elevated roles

### Data Isolation
- Organization data is completely isolated between organizations
- Team-based access ensures coaches only see relevant data
- RLS policies enforce access control at the database level

### Audit Trail
- Activity logs track all actions with performer information
- Role changes should be logged for audit purposes
- Consider implementing role change approval workflows

## Testing the System

### Test Scenarios
1. **Superadmin Access**: Verify can see all organizations and data
2. **Admin Access**: Verify can see only their organization's data
3. **Coach Access**: Verify can see only their team's data
4. **Role Assignment**: Test role assignment permissions
5. **Data Isolation**: Verify organization data isolation

### Test Users
Create test users with different roles:
```sql
-- Superadmin
INSERT INTO coaches (first_name, last_name, email, is_superadmin, org_id) 
VALUES ('Super', 'Admin', 'super@example.com', true, 'org-1');

-- Admin
INSERT INTO coaches (first_name, last_name, email, is_admin, org_id) 
VALUES ('Org', 'Admin', 'admin@example.com', true, 'org-1');

-- Coach
INSERT INTO coaches (first_name, last_name, email, org_id) 
VALUES ('Team', 'Coach', 'coach@example.com', 'org-1');
```

## Future Enhancements

### Potential Improvements
- Role-based feature flags
- Granular permissions within roles
- Role approval workflows
- Multi-organization coach assignments
- Advanced audit logging
- Role expiration and renewal

### Monitoring
- Track role usage and access patterns
- Monitor for unusual access patterns
- Implement role-based analytics
- Regular security audits of role assignments 