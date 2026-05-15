'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';

import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (searchParams.get('verify')) {
      setIsVerifying(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  }, [searchParams, router]);

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('resend', {
        email: email.trim(),
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError('Failed to send magic link. Please try again.');
      } else {
        setMagicSent(true);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (isVerifying) {
    return (
      <TianjiLoveShell className="tianji-love-login-verify">
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 text-center">
          <TianjiLovePanel className="w-full max-w-md p-8">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]" aria-hidden />
            <h1 className="font-serif text-3xl text-[#ffe3b4]">Verifying your link...</h1>
            <p className="mt-3 text-sm text-[#f4d7a3]/66">Signing you in automatically.</p>
          </TianjiLovePanel>
        </div>
      </TianjiLoveShell>
    );
  }

  return (
    <TianjiLoveShell className="tianji-love-login-page" ariaLabel="Tianji Love login page">
      <TianjiLoveHeader
        homeHref="/"
        navItems={[
          { label: 'Love Reading', href: '/relationship/new' },
          { label: 'Ask', href: '/ask' },
          { label: 'Draw', href: '/draw' },
          { label: 'Pricing', href: '/pricing', mobile: true },
          { label: 'About', href: '/about' },
          { label: 'Login', href: '/login', mobile: true },
        ]}
        cta={{ label: 'Start Relationship Reading', href: '/relationship/new' }}
      />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">Tianji Love / Sign in</p>
          <h1 className="max-w-3xl font-serif text-[2.6rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4rem]">
            Return to your private love readings.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f5d8aa]/78">
            Sign in to access saved readings, compatibility history, profile settings, and checkout returns without changing the existing auth flow.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <TianjiLoveTrustCard icon={ShieldCheck} title="Private account" body="Your history and profiles stay inside protected account surfaces." />
            <TianjiLoveTrustCard icon={Mail} title="Magic link ready" body="Email sign-in remains wired for environments with verified mail settings." />
          </div>
        </div>

        <TianjiLovePanel className="p-7 sm:p-9">
          {magicSent ? (
            <div className="text-center">
              <Mail className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]" aria-hidden />
              <h2 className="font-serif text-3xl text-[#ffe3b4]">Check your inbox</h2>
              <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">
                We sent a magic sign-in link to <span className="text-[#ffe3b4]">{email}</span>.
              </p>
              <p className="mt-3 text-xs text-[#f4d7a3]/42">The link expires in 1 hour. Check spam if you do not see it.</p>
              <button
                type="button"
                onClick={() => {
                  setMagicSent(false);
                  setEmail('');
                }}
                className="mt-5 text-sm text-[#d8b77b] underline-offset-4 hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#b57248]/30 bg-[#070b16]/62 p-4 text-center">
                <p className="text-sm text-[#ffe3b4]">Magic link sign-in is available when email delivery is configured.</p>
                <p className="mt-1 text-xs text-[#f4d7a3]/48">Google sign-in stays available through the existing NextAuth provider.</p>
              </div>

              <form onSubmit={handleMagicLink} className="mt-6 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-[#f4d7a3]/62">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="tianji-love-primary inline-flex min-h-12 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6] disabled:opacity-60"
                >
                  {isLoading ? 'Sending...' : 'Send magic link'}
                </button>
              </form>

              <div className="my-6 h-px bg-[#b57248]/24" />

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#b57248]/36 bg-[#070b16]/72 px-5 text-sm font-semibold text-[#ffe3b4] transition hover:border-[#ffe3b4]/50"
              >
                Continue with Google
              </button>
              {error ? <p className="mt-4 text-center text-sm text-[#ffb4a3]">{error}</p> : null}
            </>
          )}
        </TianjiLovePanel>
      </section>

      <TianjiLoveFooter
        homeHref="/"
        disclaimer="Sign-in protects private reading history and profile data. Readings remain for reflection and relationship communication."
        links={[
          { label: 'Love Reading', href: '/relationship/new' },
          { label: 'Ask', href: '/ask' },
          { label: 'Draw', href: '/draw' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'About', href: '/about' },
          { label: 'Login', href: '/login' },
          { label: 'Privacy', href: '/legal/privacy' },
        ]}
      />
    </TianjiLoveShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <TianjiLoveShell>
          <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">Loading...</div>
        </TianjiLoveShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
