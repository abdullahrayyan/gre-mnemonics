'use client';

/**
 * Auth boundary. In normal operation this is a thin pass-through to Clerk. When
 * `NEXT_PUBLIC_DEMO_MODE=1` it swaps in zero-dependency demo implementations so
 * the app runs fully signed-in against the in-memory demo API — no Clerk keys,
 * no network, no console noise. Every component/hook that would otherwise import
 * from `@clerk/nextjs` imports from here instead, so the switch lives in one file.
 */
import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
  UserButton as ClerkUserButton,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from '@clerk/nextjs';
import type { ReactNode } from 'react';

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

// Valid-format fallback so the app builds/runs before Clerk is configured.
const FALLBACK_CLERK_KEY = 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk';

/** Wraps the tree in ClerkProvider — or nothing at all in demo mode. */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (DEMO_MODE) return <>{children}</>;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? FALLBACK_CLERK_KEY;
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}

export function SignedIn({ children }: { children: ReactNode }) {
  if (DEMO_MODE) return <>{children}</>;
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  if (DEMO_MODE) return null;
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

export function SignInButton({
  children,
  mode,
}: {
  children?: ReactNode;
  mode?: 'modal' | 'redirect';
}) {
  if (DEMO_MODE) return <>{children}</>;
  return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
}

export function UserButton() {
  if (DEMO_MODE) {
    return (
      <span
        title="Demo Learner (demo mode)"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white"
      >
        D
      </span>
    );
  }
  return <ClerkUserButton afterSignOutUrl="/" />;
}

const DEMO_AUTH = {
  isLoaded: true,
  isSignedIn: true,
  userId: 'demo_user',
  sessionId: 'demo_session',
  getToken: async () => 'demo',
};

const DEMO_USER = {
  isLoaded: true,
  isSignedIn: true,
  user: {
    id: 'demo_user',
    firstName: 'Demo',
    lastName: 'Learner',
    fullName: 'Demo Learner',
    primaryEmailAddress: { emailAddress: 'demo@mnemonicmaster.ai' },
  },
};

/** Returns Clerk's auth, or a fixed signed-in demo identity whose token is `demo`. */
export function useAuth(): ReturnType<typeof useClerkAuth> {
  if (DEMO_MODE) return DEMO_AUTH as unknown as ReturnType<typeof useClerkAuth>;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- DEMO_MODE is a build-time constant; the branch never changes at runtime.
  return useClerkAuth();
}

/** Returns Clerk's user, or a fixed demo user in demo mode. */
export function useUser(): ReturnType<typeof useClerkUser> {
  if (DEMO_MODE) return DEMO_USER as unknown as ReturnType<typeof useClerkUser>;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- DEMO_MODE is a build-time constant; the branch never changes at runtime.
  return useClerkUser();
}
