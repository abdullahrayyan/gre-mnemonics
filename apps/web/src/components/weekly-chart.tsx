'use client';

import type { WeeklyActivityPoint } from '@mnemonic/types';
import { motion } from 'framer-motion';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Simple animated bar chart of the last 7 days of reviews (no chart library). */
export function WeeklyChart({ data }: { data: WeeklyActivityPoint[] }) {
  const max = Math.max(1, ...data.map((point) => point.reviews));

  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((point) => {
        const day = DAY_LABELS[new Date(`${point.date}T00:00:00Z`).getUTCDay()] ?? '';
        return (
          <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <motion.div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400"
                initial={{ height: 0 }}
                animate={{ height: `${(point.reviews / max) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                title={`${point.reviews} reviews`}
              />
            </div>
            <span className="text-xs text-slate-400">{day}</span>
          </div>
        );
      })}
    </div>
  );
}
