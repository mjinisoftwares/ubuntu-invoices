import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedAdminRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const ADMIN_USERS = [
  "user_3El2KuL4K7TenMjbajGRdSsKJY3",
  "user_3EwqUjXWNjhCyxxSGwjMC78T5pY",

];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (!ADMIN_USERS.includes(userId)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};