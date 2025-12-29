import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './modal';

describe('Modal', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <Modal isOpen onClose={() => {}} title="Test Title">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <Modal isOpen onClose={() => {}} title="Title" description="Test description">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(
        <Modal isOpen onClose={() => {}} footer={<button>Submit</button>} showCloseButton={false}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <p>Modal content here</p>
        </Modal>
      );
      expect(screen.getByText('Modal content here')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies correct size class for sm', () => {
      render(
        <Modal isOpen onClose={() => {}} size="sm">
          <p>Small modal</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');
    });

    it('applies correct size class for lg', () => {
      render(
        <Modal isOpen onClose={() => {}} size="lg">
          <p>Large modal</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');
    });

    it('applies correct size class for full', () => {
      render(
        <Modal isOpen onClose={() => {}} size="full">
          <p>Full modal</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
    });
  });

  describe('close button', () => {
    it('renders close button by default', () => {
      render(
        <Modal isOpen onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen onClose={() => {}} title="Title" showCloseButton={false}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen onClose={handleClose} title="Title">
          <p>Content</p>
        </Modal>
      );

      await user.click(screen.getByRole('button', { name: /close modal/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('backdrop', () => {
    it('closes on backdrop click by default', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on backdrop click when closeOnBackdrop is false', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen onClose={handleClose} closeOnBackdrop={false}>
          <p>Content</p>
        </Modal>
      );

      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking modal content (not backdrop)', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen onClose={handleClose}>
          <p>Click this content</p>
        </Modal>
      );

      await user.click(screen.getByText('Click this content'));
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('ESC key', () => {
    it('closes on ESC key by default', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on ESC when closeOnEsc is false', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen onClose={handleClose} closeOnEsc={false}>
          <p>Content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('body scroll lock', () => {
    it('locks body scroll when open', () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen onClose={() => {}} title="My Title">
          <p>Content</p>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByText('My Title')).toHaveAttribute('id', 'modal-title');
    });

    it('has aria-describedby when description is provided', () => {
      render(
        <Modal isOpen onClose={() => {}} title="Title" description="My Description">
          <p>Content</p>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
      expect(screen.getByText('My Description')).toHaveAttribute('id', 'modal-description');
    });

    it('focuses first focusable element when opened', async () => {
      render(
        <Modal isOpen onClose={() => {}} title="Test Title">
          <button>First Button</button>
        </Modal>
      );
      await waitFor(() => {
        // The close button should receive focus as it's the first focusable element
        expect(screen.getByRole('button', { name: /close modal/i })).toHaveFocus();
      });
    });

    it('focuses modal dialog when no focusable elements exist', async () => {
      render(
        <Modal isOpen onClose={() => {}} showCloseButton={false}>
          <p>Content only, no buttons</p>
        </Modal>
      );
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveFocus();
      });
    });
  });

  describe('focus trap', () => {
    it('traps focus within modal - forward cycle', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen onClose={() => {}} title="Title">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );

      // DOM order: Close button → First button → Second button
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      const firstButton = screen.getByRole('button', { name: /first/i });
      const secondButton = screen.getByRole('button', { name: /second/i });

      // Start at close button (first focusable element)
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Tab through all elements
      await user.tab();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();

      // Tab from last element should cycle back to first
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it('traps focus within modal - reverse cycle', async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen onClose={() => {}} title="Title">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      const secondButton = screen.getByRole('button', { name: /second/i });

      // Start at first element
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Shift+Tab from first element should cycle to last
      await user.tab({ shift: true });
      expect(secondButton).toHaveFocus();
    });
  });
});
