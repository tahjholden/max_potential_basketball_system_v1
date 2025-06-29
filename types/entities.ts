export interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations?: number;
  joined?: string;
  team_id?: string;
  team_name?: string;
}

export interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_id: string;
  pdp_id?: string;
  archived?: boolean;
}

export interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  created_at: string;
  player_id: string;
  archived_at: string | null;
}

export interface Team {
  id: string;
  name: string;
  coach_id: string;
  created_at?: string;
  updated_at?: string;
  player_count?: number;
}

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
} 