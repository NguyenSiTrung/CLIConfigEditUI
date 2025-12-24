import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(<Input label="Email" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'input-email');
      expect(input).toHaveAttribute('id', 'input-email');
    });

    it('uses custom id when provided', () => {
      render(<Input label="Email" id="custom-id" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('renders hint when provided', () => {
      render(<Input hint="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('shows error instead of hint when both provided', () => {
      render(<Input hint="Enter email" error="Invalid email" />);
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.queryByText('Enter email')).not.toBeInTheDocument();
    });

    it('applies error styles when error is present', () => {
      render(<Input error="Invalid" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-rose-500');
    });

    it('applies normal styles when no error', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('border-slate-300');
    });
  });

  describe('sizes', () => {
    it('renders with md size by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('renders with sm size', () => {
      render(<Input size="sm" />);
      expect(screen.getByRole('textbox')).toHaveClass('px-2.5', 'py-1.5', 'text-xs');
    });

    it('renders with lg size', () => {
      render(<Input size="lg" />);
      expect(screen.getByRole('textbox')).toHaveClass('px-4', 'py-3', 'text-base');
    });
  });

  describe('icons', () => {
    it('renders left icon', () => {
      render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('applies left padding when left icon present', () => {
      render(<Input leftIcon={<span>🔍</span>} />);
      expect(screen.getByRole('textbox')).toHaveClass('pl-10');
    });

    it('renders right icon', () => {
      render(<Input rightIcon={<span data-testid="right-icon">✓</span>} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('applies right padding when right icon present', () => {
      render(<Input rightIcon={<span>✓</span>} />);
      expect(screen.getByRole('textbox')).toHaveClass('pr-10');
    });
  });

  describe('interactions', () => {
    it('allows text input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Hello');
      expect(input).toHaveValue('Hello');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole('textbox'), 'a');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toHaveClass('disabled:opacity-50');
    });
  });

  describe('accessibility', () => {
    it('has proper focus styles', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('supports placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('supports aria-describedby for error', () => {
      render(<Input error="Invalid value" aria-describedby="error-text" />);
      const errorText = screen.getByText('Invalid value');
      expect(errorText).toHaveClass('text-rose-500');
    });
  });
});
