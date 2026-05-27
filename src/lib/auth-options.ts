import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import PostgresAdapter from '@auth/pg-adapter';

import { getPool } from '@/lib/db';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';

type AuthEnv = NodeJS.ProcessEnv;

function configured(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function isTrueFlag(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

export function getAuthProviderStatus(env: AuthEnv = process.env) {
  const googleReady = configured(env.GOOGLE_CLIENT_ID) && configured(env.GOOGLE_CLIENT_SECRET);
  const emailSendDisabled = isTrueFlag(env.EMAIL_SEND_DISABLED);
  const databaseReady = configured(env.DATABASE_URL);
  const resendReady =
    !emailSendDisabled &&
    databaseReady &&
    configured(env.RESEND_API_KEY) &&
    configured(env.EMAIL_FROM);

  return {
    googleReady,
    resendReady,
    databaseReady,
    emailSendDisabled,
  };
}

export function buildAuthConfig(env: AuthEnv = process.env): NextAuthConfig {
  const status = getAuthProviderStatus(env);
  const providers: NextAuthConfig['providers'] = [];

  if (status.googleReady) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (status.resendReady) {
    providers.push(
      Resend({
        apiKey: env.RESEND_API_KEY!,
        from: env.EMAIL_FROM!,
      })
    );
  }

  return {
    providers,
    adapter: status.resendReady ? PostgresAdapter(getPool()) : undefined,
    secret: env.AUTH_SECRET || env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

    pages: {
      signIn: '/login',
      error: '/login',
      verifyRequest: '/login?verify=1',
    },

    callbacks: {
      async signIn({ user, account }) {
        if ((account?.provider === 'google' || account?.provider === 'resend') && user.email) {
          if (isSupabaseConfigured()) {
            try {
              const supabase = getSupabaseAdmin();
              await supabase
                .from('users')
                .upsert(
                  {
                    email: user.email,
                    name: user.name ?? null,
                    avatar_url: user.image ?? null,
                    image: user.image ?? null,
                    provider: account.provider === 'google' ? 'google' : 'email',
                  },
                  { onConflict: 'email' }
                );
            } catch (err) {
              console.warn('[auth] Failed to upsert user in Supabase:', err);
            }
          }
        }
        return true;
      },

      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },

      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },

    trustHost: true,
  } satisfies NextAuthConfig;
}
