import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Only run for protected routes (not /get-started itself)
  if (req.nextUrl.pathname.startsWith("/protected/get-started")) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {}, // No-op for middleware
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in, let other auth middleware handle
    return NextResponse.next();
  }

  // Fetch coach record
  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("auth_uid", user.id)
    .maybeSingle();

  if (!coach) {
    // No coach record, let through (or handle as error elsewhere)
    return NextResponse.next();
  }

  // Check for teams in org
  const { data: teams } = await supabase
    .from("teams")
    .select("id")
    .eq("org_id", coach.org_id);

  // If no teams, redirect to onboarding
  if (!teams || teams.length === 0) {
    const url = req.nextUrl.clone();
    url.pathname = "/protected/get-started";
    return NextResponse.redirect(url);
  }

  // Otherwise, continue
  return NextResponse.next();
}

export const config = {
  matcher: "/protected/:path*",
}; 