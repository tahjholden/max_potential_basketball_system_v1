export interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations?: number;
  joined?: string;
  team_id?: string;
  team_name?: string;
  org_id?: string;
  is_demo?: boolean;
}

export interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_id: string;
  pdp_id?: string;
  archived?: boolean;
  archived_by?: string;
  created_by?: string;
  org_id?: string;
}

export interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  created_at: string;
  player_id: string;
  archived_at: string | null;
  org_id?: string;
}

export interface Team {
  id: string;
  name: string;
  coach_id: string;
  created_at?: string;
  updated_at?: string;
  player_count?: number;
  org_id?: string;
  is_demo?: boolean;
}

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  is_superadmin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
  org_id?: string;
  auth_uid?: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface ActivityLog {
  activity_log_id: string;
  activity_type: string;
  summary: string;
  created_at: string;
  performed_by?: string;
  observation_id?: string;
  pdp_id?: string;
}

export interface TeamCoach {
  team_id: string;
  coach_id: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
} 