/**
 * Authentication - TianJi Global
 *
 * NextAuth v5 with JWT sessions, optional Resend Magic Link, and optional
 * Google OAuth. Providers are only exposed when their required environment
 * variables are configured so the login UI does not offer broken methods.
 */

import NextAuth from 'next-auth';

import { buildAuthConfig } from '@/lib/auth-options';

export const { handlers, auth, signIn, signOut } = NextAuth(buildAuthConfig());
