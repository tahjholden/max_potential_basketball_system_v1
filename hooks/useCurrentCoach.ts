import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  auth_uid: string;
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

        const { data: coachData, error: coachError } = await supabase
          .from("coaches")
          .select("*")
          .eq("auth_uid", user.id)
          .maybeSingle();

        if (coachError) {
          console.error("Error fetching coach:", coachError);
          setError("Failed to fetch coach data");
          setCoach(null);
        } else if (!coachData) {
          setError("Coach record not found");
          setCoach(null);
        } else {
          setCoach(coachData);
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