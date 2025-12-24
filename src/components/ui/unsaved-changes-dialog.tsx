import { Modal, Button } from '@/components/ui';

export type UnsavedChangesAction = 'save' | 'discard' | 'cancel';

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: UnsavedChangesAction) => void;
  isSaving?: boolean;
  fileName?: string;
}

export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onAction,
  isSaving = false,
  fileName,
}: UnsavedChangesDialogProps) {
  const handleAction = (action: UnsavedChangesAction) => {
    if (action === 'cancel') {
      onClose();
    } else {
      onAction(action);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button variant="ghost" onClick={() => handleAction('cancel')} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={() => handleAction('discard')}
        disabled={isSaving}
      >
        Discard
      </Button>
      <Button
        variant="primary"
        onClick={() => handleAction('save')}
        isLoading={isSaving}
      >
        Save & Switch
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unsaved Changes"
      size="sm"
      footer={footer}
    >
      <div className="text-sm text-slate-600 dark:text-slate-300">
        <p>
          {fileName 
            ? `You have unsaved changes to "${fileName}".`
            : 'You have unsaved changes.'
          }
        </p>
        <p className="mt-2">What would you like to do?</p>
      </div>
    </Modal>
  );
}
