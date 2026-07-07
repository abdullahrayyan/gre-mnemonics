import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('resolves conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('drops falsy values', () => {
    const hidden: boolean = false;
    expect(cn('text-white', hidden && 'hidden', undefined, 'font-bold')).toBe(
      'text-white font-bold',
    );
  });
});
