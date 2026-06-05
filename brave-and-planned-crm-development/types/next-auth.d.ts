import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      teacherId: string | null;
      username: string;
      name?: string;
    };
  }
}
