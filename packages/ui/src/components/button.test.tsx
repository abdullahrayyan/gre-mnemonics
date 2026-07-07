import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outlined</Button>);
    expect(screen.getByRole('button', { name: 'Outlined' }).className).toContain('border');
  });
});
