'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if redirected back from magic link (verify step)
  useEffect(() => {
    if (searchParams.get('verify')) {
      setIsVerifying(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  }, [searchParams, router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Verification in progress
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🔮</div>
          <h2 className="text-xl font-serif font-bold text-white mb-2">Verifying your link...</h2>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>Signing you in automatically</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>

      {/* Background stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              background: 'rgba(255,255,255,0.4)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            天机全球 TianJi
          </h1>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
            Sign in to access your astrological readings
          </p>
        </div>

        <div className="p-8 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>

          {/* Magic Link success state */}
          {magicSent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-lg font-serif font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(226,232,240,0.65)' }}>
                We sent a magic sign-in link to<br />
                <strong style={{ color: '#A78BFA' }}>{email}</strong>
              </p>
              <p className="text-xs" style={{ color: 'rgba(226,232,240,0.35)' }}>
                The link expires in 1 hour. Check your spam folder if you do not see it.
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(''); }}
                className="mt-4 text-xs underline"
                style={{ color: 'rgba(226,232,240,0.4)' }}
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Magic Link coming soon — requires EMAIL_FROM domain verification in Resend */}
              <div className="mb-6 p-4 rounded-xl text-center" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                <p className="text-sm" style={{ color: 'rgba(226,232,240,0.6)' }}>
                  🔮 Magic Link sign-in coming soon
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.35)' }}>
                  Sign in with Google below for now
                </p>
              </div>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-3"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E2E8F0',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        {/* Sign up note */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(226,232,240,0.25)' }}>
          No password needed — just enter your email and click the link we send you.
          <br />New accounts are created automatically on first sign-in.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
