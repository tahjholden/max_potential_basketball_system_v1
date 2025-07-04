import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/protected/dashboard"); // User is authenticated, go to dashboard
  } else {
    redirect("/auth/login"); // User is not authenticated, go to login
  }
}
