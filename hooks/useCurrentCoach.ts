import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  is_superadmin?: boolean;
  auth_uid: string;
  org_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useCurrentCoach() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoach = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }
        const { data, error: coachError } = await supabase
          .from("coaches")
          .select("id, first_name, last_name, email, is_admin, is_superadmin, auth_uid, org_id, created_at, updated_at")
          .eq("auth_uid", user.id)
          .single();
        if (coachError) {
          console.error("Error fetching coach:", coachError);
          setError("Failed to fetch coach data");
          setCoach(null);
        } else if (!data) {
          setError("Coach record not found");
          setCoach(null);
        } else {
          const coachData = data as any;
          setCoach({
            id: coachData.id,
            first_name: coachData.first_name,
            last_name: coachData.last_name,
            email: coachData.email,
            is_admin: coachData.is_admin,
            is_superadmin: coachData.is_superadmin || false,
            auth_uid: coachData.auth_uid,
            org_id: coachData.org_id,
            created_at: coachData.created_at,
            updated_at: coachData.updated_at,
          });
        }
      } catch (err) {
        console.error("Unexpected error in useCurrentCoach:", err);
        setError("Unexpected error occurred");
        setCoach(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCoach();
  }, []);

  return { coach, loading, error };
} 