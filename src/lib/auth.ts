/**
 * Authentication — TianJi Global
 *
 * NextAuth v5 with JWT sessions + Resend Magic Link + Google OAuth.
 *
 * Strategy: JWT (no database required for auth).
 * User records are created in Supabase `users` table on first sign-in via
 * the Supabase Admin client (relationship tables already use Supabase).
 *
 * To upgrade to database sessions: set DATABASE_URL to a PostgreSQL connection
 * string, add @auth/pg-adapter, and switch strategy to 'database'.
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // TODO: Add Resend Magic Link provider once EMAIL_FROM domain is verified in Resend.
  // To re-enable: uncomment the Resend import and provider block below.
  // Requires: (1) verify tianji.global domain in Resend, OR (2) use onboarding@resend.dev
  // Resend({
  //   apiKey: process.env.RESEND_API_KEY,
  //   from: process.env.EMAIL_FROM ?? 'TianJi Global <onboarding@resend.dev>',
  // }),


  // JWT strategy — no DB required for auth
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login?verify=1',
  },

  callbacks: {
    /**
     * Called on every sign-in.
     * Creates a user record in Supabase `users` table on first Google sign-in.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseAdmin();
            await supabase
              .from('users')
              .upsert({
                email: user.email,
                name: user.name ?? null,
                avatar_url: user.image ?? null,
                provider: 'google',
              }, { onConflict: 'email' });
          } catch (err) {
            // Non-fatal — auth continues even if DB write fails
            console.warn('[auth] Failed to upsert user in Supabase:', err);
          }
        }
      }
      return true;
    },

    /**
     * Put user id into JWT for session.user.id access.
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    /**
     * Expose user id in session.
     */
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  trustHost: true,
} satisfies NextAuthConfig);
