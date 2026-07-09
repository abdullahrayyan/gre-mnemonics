'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker — but only in production. In development a
 * service worker breaks Next's HMR and can serve stale routes, so we instead
 * unregister any existing worker and clear its caches (self-healing the demo).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failures are non-fatal.
      });
      return;
    }

    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()));
    if ('caches' in window) {
      void caches.keys().then((keys) => keys.forEach((key) => void caches.delete(key)));
    }
  }, []);
  return null;
}
