'use client';

import { motion } from 'framer-motion';

/** Circular progress ring for the daily goal. */
export function GoalRing({ completed, goal }: { completed: number; goal: number }) {
  const fraction = goal > 0 ? Math.min(1, completed / goal) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none stroke-slate-200 dark:stroke-white/10"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none stroke-indigo-500"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{completed}</span>
        <span className="text-xs text-slate-400">of {goal}</span>
      </div>
    </div>
  );
}
