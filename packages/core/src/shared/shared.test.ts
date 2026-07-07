import { describe, expect, it } from 'vitest';
import { ValidationError } from './errors.js';
import { Guard } from './guard.js';
import { buildPage, normalizePageRequest, pageOffset } from './pagination.js';
import { slugify } from './slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Memory Palace Mode')).toBe('memory-palace-mode');
  });

  it('strips diacritics and punctuation', () => {
    expect(slugify('Café — Déjà Vu!')).toBe('cafe-deja-vu');
  });

  it('collapses repeated separators and trims edges', () => {
    expect(slugify('  --Hello___World--  ')).toBe('hello-world');
  });
});

describe('Guard', () => {
  it('accumulates all issues and throws once', () => {
    const guard = new Guard()
      .requireNonEmpty('', 'a')
      .requireOneOf('x', ['y', 'z'] as const, 'b')
      .requireNonNegativeIntOrNull(-1, 'c');

    expect(guard.hasErrors()).toBe(true);
    try {
      guard.throwIfInvalid();
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toHaveLength(3);
    }
  });

  it('passes when all invariants hold', () => {
    expect(() =>
      new Guard()
        .requireNonEmpty('ok', 'a')
        .requireNonNegativeIntOrNull(null, 'b')
        .throwIfInvalid(),
    ).not.toThrow();
  });
});

describe('pagination', () => {
  it('clamps page and pageSize into safe bounds', () => {
    expect(normalizePageRequest({ page: -3, pageSize: 5000 })).toEqual({ page: 1, pageSize: 100 });
    expect(normalizePageRequest({ page: 2, pageSize: 25 })).toEqual({ page: 2, pageSize: 25 });
    expect(normalizePageRequest()).toEqual({ page: 1, pageSize: 20 });
  });

  it('computes offsets', () => {
    expect(pageOffset({ page: 3, pageSize: 20 })).toBe(40);
  });

  it('builds page metadata', () => {
    const page = buildPage([1, 2], 42, { page: 1, pageSize: 20 });
    expect(page).toMatchObject({ total: 42, totalPages: 3, hasNext: true, hasPrevious: false });
  });
});
