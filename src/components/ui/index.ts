/**
 * UI Component Library
 *
 * Reusable, accessible components following the app's design system.
 * All components support dark/light themes and keyboard navigation.
 *
 * Usage:
 *   import { Button, Modal, Input } from '@/components/ui';
 *
 * Components:
 * - Button: Primary action buttons with variants (primary, secondary, ghost, danger, outline)
 * - Modal: Accessible dialog with focus trap, ESC close, backdrop click
 * - Card: Container panels with variants (default, elevated, outline, ghost)
 * - Input: Form input with label, error, and icon support
 * - Toggle: Accessible switch component
 * - SectionHeader: Consistent section headers with optional actions
 * - ConfirmDialog: Confirmation modal for destructive actions
 * - UnsavedChangesDialog: Save/Discard/Cancel dialog for navigation
 * - OnboardingTooltip: First-visit hints stored in localStorage
 */

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './button';
export { Modal, type ModalProps } from './modal';
export { Card, type CardProps } from './card';
export { Input, type InputProps } from './input';
export { Toggle, type ToggleProps } from './toggle';
export { SectionHeader, type SectionHeaderProps } from './section-header';
export { ConfirmDialog, type ConfirmDialogProps } from './confirm-dialog';
export { UnsavedChangesDialog, type UnsavedChangesDialogProps, type UnsavedChangesAction } from './unsaved-changes-dialog';
export { OnboardingTooltip } from './onboarding-tooltip';
export { resetOnboardingHints } from '@/utils/onboarding-hints';
export { 
  Skeleton, 
  SkeletonText, 
  McpServerSkeleton, 
  McpServerListSkeleton, 
  McpToolStatusSkeleton, 
  McpToolStatusListSkeleton 
} from './skeleton';
