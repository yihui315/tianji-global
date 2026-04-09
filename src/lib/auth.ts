/**
 * Authentication Configuration — TianJi Global
 *
 * NextAuth v5 with PostgreSQL database sessions.
 * Supports email magic link + Google OAuth.
 *
 * Session data is stored in the PostgreSQL `sessions` table.
 * User records are created/updated in the `users` table on first sign-in.
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import PgAdapter from '@auth/pg-adapter';
import Google from 'next-auth/providers/google';
import Email from 'next-auth/providers/email';
import type { NodemailerConfig } from '@auth/core/providers/nodemailer';
import type { Theme } from '@auth/core/types.js';
import { pool } from '@/lib/db';
import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Database adapter
// ---------------------------------------------------------------------------

const adapter = PgAdapter(pool);

// ---------------------------------------------------------------------------
// Email transport (magic link)
// ---------------------------------------------------------------------------

const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT ?? 587),
  secure: Number(process.env.EMAIL_SMTP_PORT ?? 587) === 465,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

async function sendVerificationRequest(params: {
  identifier: string;
  url: string;
  expires: Date;
  provider: NodemailerConfig;
  token: string;
  theme: string;
  request: Request;
}) {
  const { identifier, url, provider } = params;
  const host = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  await emailTransporter.sendMail({
    to: identifier,
    from: process.env.EMAIL_FROM ?? provider.from ?? 'noreply@tianji.global',
    subject: `Sign in to ${host}`,
    html: `
      <p>Hi,</p>
      <p>Click the link below to sign in to your ${host} account:</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    text: `Hi,\n\nClick the link below to sign in to your ${host} account:\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
  });
}

// ---------------------------------------------------------------------------
// NextAuth v5 handlers
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    Email({
      server: {
        host: process.env.EMAIL_SMTP_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SMTP_USER,
          pass: process.env.EMAIL_SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM ?? 'noreply@tianji.global',
      sendVerificationRequest,
    }),
  ],

  // Store sessions in PostgreSQL instead of JWT
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login?verify=1',
  },

  callbacks: {
    /**
     * Called on every sign-in. The adapter's createUser hook
     * creates the user record in the `users` table on first sign-in.
     */
    async signIn({ user, account }) {
      return true;
    },

    /**
     * Merge adapter user data (e.g. id) into the session.
     */
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id as string;
      }
      return session;
    },
  },

  trustHost: true,
} satisfies NextAuthConfig);
