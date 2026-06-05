export { auth as default } from "@/auth";
export const config = {
  matcher: ["/((?!api/auth|api/health|api/setup|_next|login).*)"],
};
