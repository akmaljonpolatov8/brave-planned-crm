import { auth } from "@/auth";

export const middleware = auth((req) => {
  return undefined;
});

export const config = {
  matcher: [
    "/((?!login|api/setup|api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};
