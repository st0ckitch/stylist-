import { authMiddleware } from "@clerk/nextjs";

// Explicitly set runtime
export const runtime = 'nodejs'

export default authMiddleware({
  publicRoutes: ["/"],
  debug: true
});

// Update matcher to exclude problematic paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/((?!api|trpc))(.*)'],
};
