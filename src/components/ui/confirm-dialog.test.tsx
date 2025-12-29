import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Title',
    message: 'Test message',
  };

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows title and message', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('button labels', () => {
    it('uses default button labels', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('uses custom button labels when provided', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmLabel="Delete"
          cancelLabel="Keep"
        />
      );
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onConfirm then onClose when confirm button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onConfirm = vi.fn();
      render(
        <ConfirmDialog
          {...defaultProps}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onConfirm = vi.fn();
      render(
        <ConfirmDialog
          {...defaultProps}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('applies danger button for danger variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-rose-600');
    });

    it('applies primary button for warning variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-indigo-600');
    });

    it('applies primary button for info variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="info" />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-indigo-600');
    });
  });

  describe('loading state', () => {
    it('shows loading state when isLoading is true', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton.querySelector('svg')).toBeInTheDocument();
    });

    it('disables buttons when isLoading is true', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    it('does not call onClose after confirm when isLoading is true', async () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();
      
      const { rerender } = render(
        <ConfirmDialog
          {...defaultProps}
          onClose={onClose}
          onConfirm={onConfirm}
          isLoading={false}
        />
      );

      const user = userEvent.setup();
      
      rerender(
        <ConfirmDialog
          {...defaultProps}
          onClose={onClose}
          onConfirm={onConfirm}
          isLoading={true}
        />
      );

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
