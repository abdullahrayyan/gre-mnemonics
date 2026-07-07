'use client';

import { Button, Card } from '@mnemonic/ui';
import { motion } from 'framer-motion';
import { BrainCircuit, MessageSquareText, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Hinglish mnemonics',
    body: 'Bolster → "Bol Sir!" — memory hooks a funny friend would give you.',
  },
  {
    icon: Timer,
    title: 'Spaced repetition',
    body: 'A complete SM-2 scheduler brings words back right before you forget.',
  },
  {
    icon: BrainCircuit,
    title: 'Quizzes & retention',
    body: 'Nine quiz types track accuracy, speed, and your weak words.',
  },
  {
    icon: MessageSquareText,
    title: 'AI tutor',
    body: 'Ask for another mnemonic, a Hindi explanation, or a GRE example.',
  },
];

export function LandingHero() {
  return (
    <div className="space-y-16">
      <section className="relative mx-auto max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Remember every word <span className="text-gradient">forever</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300"
        >
          AI-generated Hinglish mnemonics, funny stories, spaced repetition, and quizzes — built for
          GRE and beyond.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link href="/dashboard">
            <Button size="lg">Start learning</Button>
          </Link>
          <Link href="/words">
            <Button size="lg" variant="outline">
              Browse words
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card className="h-full">
              <feature.icon className="h-6 w-6 text-indigo-500" />
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.body}</p>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
