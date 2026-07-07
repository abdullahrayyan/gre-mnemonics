import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/** Glassmorphism surface: translucent, blurred, rounded. */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5',
        className,
      )}
      {...props}
    />
  );
});

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />;
}
