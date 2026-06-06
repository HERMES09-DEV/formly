import { NextResponse } from "next/server";
import { middlewareAuth } from "@/lib/auth";

export const middleware = middlewareAuth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (
    session &&
    !session.user?.orgId &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (pathname.startsWith("/onboarding")) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/api/((?!auth(?:/|$)|submit(?:/|$)).*)",
  ],
};
