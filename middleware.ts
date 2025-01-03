import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/"],
  ignoredRoutes: ["/api/virtual-tryon"]  // Add this line to ignore virtual try-on route
});
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/virtual-tryon (virtual try-on API endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/virtual-tryon|_next/static|_next/image|favicon.ico).*)",
  ],
};
