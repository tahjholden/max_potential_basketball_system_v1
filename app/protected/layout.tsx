import Link from "next/link";
import { ReactNode, cloneElement } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import CoachProviderWrapper from "@/components/CoachProviderWrapper";
import React from "react";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Auth check (server-side)
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Auth error:", userError);
  }
  
  if (!user) {
    redirect("/auth/login");
  }

  console.log("🔍 ProtectedLayout Debug:", {
    userEmail: user.email,
    userId: user.id,
    userMetadata: user.user_metadata
  });

  // Pass coachId to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { coachId: user?.id });
    }
    return child;
  });

  return (
    <CoachProviderWrapper>
      <DashboardLayout>
        {childrenWithProps}
      </DashboardLayout>
    </CoachProviderWrapper>
  );
}
