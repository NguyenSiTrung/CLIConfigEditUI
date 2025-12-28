import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconContainer } from './icon-container';

describe('IconContainer', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <IconContainer>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with default size (md)', () => {
      render(
        <IconContainer>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('w-6', 'h-6', 'rounded-lg');
    });

    it('renders with default background', () => {
      render(
        <IconContainer>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-slate-100', 'dark:bg-slate-800');
    });
  });

  describe('sizes', () => {
    it('renders small size correctly', () => {
      render(
        <IconContainer size="sm">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('w-5', 'h-5', 'rounded-md');
    });

    it('renders medium size correctly', () => {
      render(
        <IconContainer size="md">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('w-6', 'h-6', 'rounded-lg');
    });

    it('renders large size correctly', () => {
      render(
        <IconContainer size="lg">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('w-8', 'h-8', 'rounded-lg');
    });
  });

  describe('active state', () => {
    it('applies default background when not active', () => {
      render(
        <IconContainer active={false}>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-slate-100', 'dark:bg-slate-800');
    });

    it('applies indigo accent background when active (default accent)', () => {
      render(
        <IconContainer active={true}>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-indigo-50', 'dark:bg-indigo-500/10');
      expect(container).not.toHaveClass('bg-slate-100');
    });
  });

  describe('accent colors', () => {
    it('applies violet accent when active', () => {
      render(
        <IconContainer active accent="violet">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-violet-50', 'dark:bg-violet-500/10');
    });

    it('applies emerald accent when active', () => {
      render(
        <IconContainer active accent="emerald">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-emerald-50', 'dark:bg-emerald-500/10');
    });

    it('applies amber accent when active', () => {
      render(
        <IconContainer active accent="amber">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-amber-50', 'dark:bg-amber-500/10');
    });

    it('applies blue accent when active', () => {
      render(
        <IconContainer active accent="blue">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('bg-blue-50', 'dark:bg-blue-500/10');
    });
  });

  describe('hover and transitions', () => {
    it('includes hover scale animation', () => {
      render(
        <IconContainer>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('hover:scale-105');
    });

    it('includes transition styles', () => {
      render(
        <IconContainer>
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('transition-all', 'duration-150');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(
        <IconContainer className="custom-class">
          <span data-testid="icon">★</span>
        </IconContainer>
      );
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });
});
