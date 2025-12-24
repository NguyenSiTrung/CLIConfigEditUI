import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children content', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies additional className', () => {
      render(<Card className="custom-class">Content</Card>);
      expect(screen.getByText('Content')).toHaveClass('custom-class');
    });
  });

  describe('variants', () => {
    it('renders with default variant', () => {
      render(<Card>Default</Card>);
      const card = screen.getByText('Default');
      expect(card).toHaveClass('bg-white', 'shadow-sm');
    });

    it('renders with elevated variant', () => {
      render(<Card variant="elevated">Elevated</Card>);
      const card = screen.getByText('Elevated');
      expect(card).toHaveClass('bg-white', 'shadow-lg');
    });

    it('renders with outline variant', () => {
      render(<Card variant="outline">Outline</Card>);
      const card = screen.getByText('Outline');
      expect(card).toHaveClass('bg-transparent', 'border');
    });

    it('renders with ghost variant', () => {
      render(<Card variant="ghost">Ghost</Card>);
      const card = screen.getByText('Ghost');
      expect(card).toHaveClass('bg-slate-50');
    });
  });

  describe('padding', () => {
    it('renders with md padding by default', () => {
      render(<Card>Medium padding</Card>);
      expect(screen.getByText('Medium padding')).toHaveClass('p-4');
    });

    it('renders with no padding', () => {
      render(<Card padding="none">No padding</Card>);
      const card = screen.getByText('No padding');
      expect(card).not.toHaveClass('p-3', 'p-4', 'p-6');
    });

    it('renders with sm padding', () => {
      render(<Card padding="sm">Small padding</Card>);
      expect(screen.getByText('Small padding')).toHaveClass('p-3');
    });

    it('renders with lg padding', () => {
      render(<Card padding="lg">Large padding</Card>);
      expect(screen.getByText('Large padding')).toHaveClass('p-6');
    });
  });

  describe('styling', () => {
    it('has rounded corners', () => {
      render(<Card>Rounded</Card>);
      expect(screen.getByText('Rounded')).toHaveClass('rounded-xl');
    });

    it('has border on default variant', () => {
      render(<Card>Bordered</Card>);
      expect(screen.getByText('Bordered')).toHaveClass('border');
    });
  });

  describe('HTML attributes', () => {
    it('passes through HTML attributes', () => {
      render(<Card data-testid="test-card" role="region">Content</Card>);
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});
