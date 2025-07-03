# Development Plan and Observations Archive Functionality

This document explains how to use the comprehensive archive functionality for development plans (PDPs) and their corresponding observations according to the provided database schema.

## Overview

The archive system allows you to:
- Archive development plans and all their linked observations
- Maintain data integrity with proper foreign key relationships
- Track archive activities in the activity_log table
- View archived plans with their observations
- Use timestamps instead of boolean flags for better data tracking

## Database Schema

The archive functionality works with the following tables:

| Table | Key Fields | Archive Fields |
|-------|------------|----------------|
| `pdp` | `id`, `player_id`, `org_id` | `archived_at`, `archived_by` |
| `observations` | `id`, `pdp_id`, `player_id`, `org_id` | `archived_at`, `archived_by` |
| `activity_log` | `activity_log_id`, `performed_by`, `pdp_id`, `org_id` | N/A (tracks archive actions) |

## Core Functions

### 1. `archiveDevelopmentPlanAndObservations`

The main function for archiving a PDP and its observations:

```typescript
import { archiveDevelopmentPlanAndObservations } from "@/lib/archivePDPAndObservations";

const result = await archiveDevelopmentPlanAndObservations({
  pdpId: "pdp-uuid",
  playerId: "player-uuid", 
  userId: "user-uuid",
  orgId: "org-uuid",
  onSuccess: () => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});
```

**What it does:**
1. Archives the PDP by setting `archived_at` timestamp
2. Archives all observations linked to the PDP
3. Logs the archive activity in `activity_log` table
4. Maintains referential integrity

### 2. `getArchivedPDPsWithObservations`

Retrieves archived PDPs with their observations:

```typescript
import { getArchivedPDPsWithObservations } from "@/lib/archivePDPAndObservations";

const archivedPDPs = await getArchivedPDPsWithObservations(playerId, orgId);
```

## Components

### 1. `ArchivePDPButton`

A reusable button component for archiving PDPs:

```tsx
import ArchivePDPButton from "@/components/ArchivePDPButton";

<ArchivePDPButton
  pdpId={currentPDP.id}
  playerId={player.id}
  playerName={player.name}
  onSuccess={() => {
    // Refresh data or navigate
  }}
  variant="outline"
  size="sm"
/>
```

**Props:**
- `pdpId`: The ID of the PDP to archive
- `playerId`: The player's ID
- `playerName`: The player's name (for success messages)
- `onSuccess`: Callback after successful archive
- `variant`: Button style ("default", "outline", "ghost")
- `size`: Button size ("sm", "md", "lg")

### 2. `ArchivedPDPsList`

Displays archived PDPs with their observations:

```tsx
import ArchivedPDPsList from "@/components/ArchivedPDPsList";

<ArchivedPDPsList
  playerId={player.id}
  orgId={orgId}
  className="w-full"
/>
```

**Features:**
- Expandable PDP cards
- Shows observation count
- Displays coach information
- Shows archive and creation dates
- Handles loading and error states

### 3. `ArchiveCreateNewModal`

Modal for archiving current PDP and creating a new one:

```tsx
import ArchiveCreateNewModal from "@/components/ArchiveCreateNewModal";

<ArchiveCreateNewModal
  playerId={player.id}
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSuccess={() => {
    // Handle success
  }}
/>
```

## Usage Examples

### Basic Archive Button

```tsx
import ArchivePDPButton from "@/components/ArchivePDPButton";

function PlayerDetailPage({ player, currentPDP }) {
  return (
    <div>
      <h2>Current Development Plan</h2>
      {currentPDP && (
        <ArchivePDPButton
          pdpId={currentPDP.id}
          playerId={player.id}
          playerName={player.name}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
```

### Archive with Modal Confirmation

```tsx
import { useState } from "react";
import ArchiveCreateNewModal from "@/components/ArchiveCreateNewModal";

function PlayerManagement({ player }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        Archive & Create New Plan
      </button>
      
      <ArchiveCreateNewModal
        playerId={player.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          // Refresh data
        }}
      />
    </>
  );
}
```

### Display Archived Plans

```tsx
import ArchivedPDPsList from "@/components/ArchivedPDPsList";

function PlayerHistory({ player, orgId }) {
  return (
    <div>
      <h2>Archived Development Plans</h2>
      <ArchivedPDPsList
        playerId={player.id}
        orgId={orgId}
      />
    </div>
  );
}
```

## Database Queries

### Archive a PDP and Observations

```sql
-- Archive the PDP
UPDATE pdp 
SET archived_at = NOW(), archived_by = $1, updated_at = NOW()
WHERE id = $2 AND org_id = $3;

-- Archive linked observations
UPDATE observations 
SET archived_at = NOW(), archived_by = $1, updated_at = NOW()
WHERE pdp_id = $2 AND org_id = $3 AND archived_at IS NULL;

-- Log the activity
INSERT INTO activity_log (
  activity_type, summary, performed_by, pdp_id, org_id, created_at
) VALUES (
  'archive_pdp', 'Archived development plan and observations', $1, $2, $3, NOW()
);
```

### Get Archived PDPs with Observations

```sql
-- Get archived PDPs
SELECT 
  p.id, p.content, p.start_date, p.end_date, p.created_at, p.archived_at,
  p.archived_by, p.created_by,
  c.first_name, c.last_name
FROM pdp p
LEFT JOIN coaches c ON p.created_by = c.id
WHERE p.player_id = $1 
  AND p.org_id = $2 
  AND p.archived_at IS NOT NULL
ORDER BY p.archived_at DESC;

-- Get observations for each PDP
SELECT 
  o.id, o.content, o.observation_date, o.created_at, o.archived_at,
  o.archived_by, o.created_by,
  c.first_name, c.last_name
FROM observations o
LEFT JOIN coaches c ON o.created_by = c.id
WHERE o.pdp_id = $1 
  AND o.org_id = $2 
  AND o.archived_at IS NOT NULL
ORDER BY o.observation_date DESC;
```

## Error Handling

The archive functions include comprehensive error handling:

```typescript
try {
  const result = await archiveDevelopmentPlanAndObservations({
    pdpId,
    playerId,
    userId,
    orgId,
    onError: (error) => {
      console.error('Archive failed:', error);
      toast.error(`Failed to archive: ${error}`);
    }
  });
  
  if (!result.success) {
    // Handle specific error
  }
} catch (error) {
  // Handle unexpected errors
}
```

## Best Practices

1. **Always check user authentication** before archiving
2. **Verify organization access** to ensure data security
3. **Use the activity log** to track archive actions
4. **Handle loading states** in UI components
5. **Provide clear feedback** to users about archive actions
6. **Refresh data** after successful archive operations
7. **Use proper error handling** for failed operations

## Migration Notes

If you're upgrading from a boolean-based archive system:

1. The new system uses `archived_at` timestamps instead of boolean flags
2. Existing boolean `archived` fields are preserved for backward compatibility
3. New archive operations use the timestamp approach
4. Queries should check `archived_at IS NULL` for active records

## Security Considerations

- All archive operations require user authentication
- Organization-level access control is enforced
- Archive actions are logged for audit trails
- Foreign key constraints prevent orphaned data
- RLS (Row Level Security) policies should be in place

## Troubleshooting

### Common Issues

1. **"User not authenticated"** - Ensure user is logged in
2. **"Organization not found"** - Check coach's org_id assignment
3. **"Failed to archive PDP"** - Verify PDP exists and user has access
4. **"Failed to archive observations"** - Check observation permissions

### Debug Steps

1. Check user authentication status
2. Verify coach's organization assignment
3. Confirm PDP and observation ownership
4. Review database constraints and permissions
5. Check activity log for error details 