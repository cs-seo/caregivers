import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const isProduction = process.env.NODE_ENV === "production";

// Drive cookie security off the actual deployment protocol rather than NODE_ENV
// so production HTTPS gets Secure/`__Secure-` cookies while a local `npm start`
// over HTTP still works. NextAuth defaults to this behaviour; we pin it
// explicitly so it cannot silently regress.
const publicUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
const useSecureCookies = publicUrl.startsWith("https://");

function resolveAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) return secret;
  // Fail closed in production: never sign sessions with a shipped default.
  if (isProduction) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and set it in the environment.",
    );
  }
  return "careproof-preview-secret-change-in-production";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: resolveAuthSecret(),
  // Trust the deployment host header (behind Vercel/our reverse proxy). Also
  // controlled by AUTH_TRUST_HOST in the environment.
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  useSecureCookies,
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "");
      }
      return session;
    },
  },
});
