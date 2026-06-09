import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Protected routes (require authentication)
 * Add all private SaaS pages here
 */
const isProtectedRoute = createRouteMatcher([
  // '/dashboard(.*)',
  // '/invoices(.*)',
  // '/quotes(.*)',
  // '/clients(.*)',
  // '/settings(.*)',
]);

/**
 * Middleware
 * - Protects private routes
 * - Allows public routes without auth
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

/**
 * Middleware matcher configuration
 * Controls where middleware runs
 */
export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    '/((?!_next|.*\\..*).*)',

    // Clerk auth system routes
    '/__clerk/:path*',

    // API routes (important for security)
    '/(api|trpc)(.*)',
  ],
};