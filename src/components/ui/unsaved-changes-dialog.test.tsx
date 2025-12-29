import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnsavedChangesDialog } from './unsaved-changes-dialog';

describe('UnsavedChangesDialog', () => {
  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <UnsavedChangesDialog
          isOpen={false}
          onClose={() => {}}
          onAction={() => {}}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows "Unsaved Changes" as title', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
        />
      );
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
    });

    it('shows generic message when no fileName', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
        />
      );
      expect(screen.getByText('You have unsaved changes.')).toBeInTheDocument();
    });

    it('shows fileName in message when provided', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
          fileName="config.json"
        />
      );
      expect(screen.getByText('You have unsaved changes to "config.json".')).toBeInTheDocument();
    });

    it('renders three buttons: Cancel, Discard, Save & Switch', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
        />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save & Switch' })).toBeInTheDocument();
    });
  });

  describe('button actions', () => {
    it('calls onClose when Cancel button clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const handleAction = vi.fn();
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={handleClose}
          onAction={handleAction}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleAction).not.toHaveBeenCalled();
    });

    it('calls onAction with "discard" when Discard button clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const handleAction = vi.fn();
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={handleClose}
          onAction={handleAction}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Discard' }));
      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(handleAction).toHaveBeenCalledWith('discard');
    });

    it('calls onAction with "save" when Save & Switch button clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const handleAction = vi.fn();
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={handleClose}
          onAction={handleAction}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Save & Switch' }));
      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(handleAction).toHaveBeenCalledWith('save');
    });
  });

  describe('saving state', () => {
    it('disables Cancel button when isSaving is true', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
          isSaving
        />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    it('disables Discard button when isSaving is true', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
          isSaving
        />
      );
      expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
    });

    it('shows loading state on Save button when isSaving is true', () => {
      render(
        <UnsavedChangesDialog
          isOpen
          onClose={() => {}}
          onAction={() => {}}
          isSaving
        />
      );
      const saveButton = screen.getByRole('button', { name: /Save & Switch/i });
      expect(saveButton.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });
});
