import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        if (!username || !password) return null;
        const user = await prisma.user.findUnique({
          where: { username },
          include: { teacher: true },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.teacher?.fullName ?? user.username,
          username: user.username,
          role: user.role,
          teacherId: user.teacher?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.teacherId = (user as any).teacherId;
        token.username = (user as any).username;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.teacherId = token.teacherId as string | null;
      session.user.username = token.username as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
