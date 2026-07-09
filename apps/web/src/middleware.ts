import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// In demo mode there are no Clerk keys, so skip Clerk entirely and pass through.
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

export default demoMode ? () => NextResponse.next() : clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
