'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gre-done-groups';

function read(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

/**
 * Which groups the learner has marked done. Stored on the device — no account
 * needed. Starts empty on the server and hydrates on mount to avoid a mismatch.
 */
export function useDoneGroups() {
  const [done, setDone] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDone(read());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: number[]) => {
    setDone(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode); progress is best-effort.
    }
  }, []);

  const markDone = useCallback(
    (group: number) => persist(read().includes(group) ? read() : [...read(), group]),
    [persist],
  );

  const clearDone = useCallback(
    (group: number) => persist(read().filter((n) => n !== group)),
    [persist],
  );

  return { done, loaded, isDone: (group: number) => done.includes(group), markDone, clearDone };
}
