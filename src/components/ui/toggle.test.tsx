import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './toggle';

describe('Toggle', () => {
  describe('rendering', () => {
    it('renders switch button', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      render(<Toggle label="Enable feature" checked={false} onChange={() => {}} />);
      expect(screen.getByText('Enable feature')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <Toggle
          label="Enable feature"
          description="This enables the feature"
          checked={false}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('This enables the feature')).toBeInTheDocument();
    });
  });

  describe('checked state', () => {
    it('shows unchecked state visually', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-checked', 'false');
      expect(switchEl).toHaveClass('bg-slate-300');
    });

    it('shows checked state visually', () => {
      render(<Toggle checked={true} onChange={() => {}} />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-checked', 'true');
      expect(switchEl).toHaveClass('bg-indigo-600');
    });
  });

  describe('sizes', () => {
    it('renders with md size by default', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveClass('h-6', 'w-11');
    });

    it('renders with sm size', () => {
      render(<Toggle size="sm" checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveClass('h-5', 'w-9');
    });
  });

  describe('interactions', () => {
    it('calls onChange with true when unchecked toggle is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={false} onChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when checked toggle is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={true} onChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={false} onChange={handleChange} disabled />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute', () => {
      render(<Toggle checked={false} onChange={() => {}} disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Toggle checked={false} onChange={() => {}} disabled />);
      expect(screen.getByRole('switch')).toHaveClass('disabled:opacity-50');
    });
  });

  describe('accessibility', () => {
    it('has role="switch"', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('has aria-checked matching checked prop', () => {
      const { rerender } = render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

      rerender(<Toggle checked={true} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('has aria-label from label prop', () => {
      render(<Toggle label="My Toggle" checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'My Toggle');
    });

    it('has proper focus styles', () => {
      render(<Toggle checked={false} onChange={() => {}} />);
      expect(screen.getByRole('switch')).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('can be focused and activated with keyboard', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Toggle checked={false} onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      expect(toggle).toHaveFocus();

      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
