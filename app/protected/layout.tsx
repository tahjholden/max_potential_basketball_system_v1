import Link from "next/link";
import { ReactNode, cloneElement } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import React from "react";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Auth check (server-side)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch coach's name from coaches table using auth_uid
  let coachName = "";
  let coach;
  if (user?.id) {
    const { data: coachData } = await supabase
      .from("coaches")
      .select("id, first_name, last_name")
      .eq("auth_uid", user.id)
      .single();
    coach = coachData;
    if (coach) {
      coachName = `${coach.first_name || ""} ${coach.last_name || ""}`.trim();
    }
  }

  // Pass coachId to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { coachId: user?.id });
    }
    return child;
  });

  // TODO: Implement mobile sidebar toggle state with useState in a client component if needed

  return (
    <DashboardLayout coachName={coachName}>
      {childrenWithProps}
    </DashboardLayout>
  );
}
