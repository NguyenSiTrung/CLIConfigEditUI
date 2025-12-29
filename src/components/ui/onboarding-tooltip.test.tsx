import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingTooltip } from './onboarding-tooltip';

vi.mock('@/utils/onboarding-hints', () => ({
  getShownHints: vi.fn(),
  markHintAsShown: vi.fn(),
  requestTooltipDisplay: vi.fn(),
  notifyTooltipDismissed: vi.fn(),
  cancelTooltipRequest: vi.fn(),
}));

import {
  getShownHints,
  markHintAsShown,
  requestTooltipDisplay,
  notifyTooltipDismissed,
  cancelTooltipRequest,
} from '@/utils/onboarding-hints';

const mockedGetShownHints = vi.mocked(getShownHints);
const mockedMarkHintAsShown = vi.mocked(markHintAsShown);
const mockedRequestTooltipDisplay = vi.mocked(requestTooltipDisplay);
const mockedNotifyTooltipDismissed = vi.mocked(notifyTooltipDismissed);
const mockedCancelTooltipRequest = vi.mocked(cancelTooltipRequest);

describe('OnboardingTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedGetShownHints.mockReturnValue(new Set());
    mockedRequestTooltipDisplay.mockImplementation((_id, callback) => {
      callback();
      return true;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders children content', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('does not show tooltip initially (before delay)', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip after delay', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description" delay={1000}>
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('uses default delay of 1500ms', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1499);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="tooltip" when visible', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('dismiss button has proper aria-label', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByRole('button', { name: /dismiss hint/i })).toBeInTheDocument();
    });
  });

  describe('dismissal', () => {
    it('dismiss button calls markHintAsShown and notifyTooltipDismissed', async () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      const dismissButton = screen.getByRole('button', { name: /dismiss hint/i });
      
      vi.useRealTimers();
      const user = userEvent.setup();
      await user.click(dismissButton);
      vi.useFakeTimers();

      expect(mockedMarkHintAsShown).toHaveBeenCalledWith('test-hint');
      expect(mockedNotifyTooltipDismissed).toHaveBeenCalledWith('test-hint');
    });

    it('"Got it!" button also dismisses the tooltip', async () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      const gotItButton = screen.getByRole('button', { name: /got it!/i });
      
      vi.useRealTimers();
      const user = userEvent.setup();
      await user.click(gotItButton);
      vi.useFakeTimers();

      expect(mockedMarkHintAsShown).toHaveBeenCalledWith('test-hint');
      expect(mockedNotifyTooltipDismissed).toHaveBeenCalledWith('test-hint');
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('hides tooltip after dismissal', async () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      const dismissButton = screen.getByRole('button', { name: /dismiss hint/i });
      
      vi.useRealTimers();
      const user = userEvent.setup();
      await user.click(dismissButton);
      vi.useFakeTimers();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('already shown hints', () => {
    it('does not show if hint was already shown', () => {
      mockedGetShownHints.mockReturnValue(new Set(['test-hint']));

      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(mockedRequestTooltipDisplay).not.toHaveBeenCalled();
    });

    it('shows tooltip for hint not in shown set', () => {
      mockedGetShownHints.mockReturnValue(new Set(['other-hint']));

      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('cancels tooltip request on unmount', () => {
      const { unmount } = render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      unmount();

      expect(mockedCancelTooltipRequest).toHaveBeenCalledWith('test-hint');
    });

    it('clears timeout on unmount before delay completes', () => {
      const { unmount } = render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });
      unmount();

      expect(mockedRequestTooltipDisplay).not.toHaveBeenCalled();
    });
  });

  describe('tooltip coordinator', () => {
    it('requests tooltip display via coordinator', () => {
      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(mockedRequestTooltipDisplay).toHaveBeenCalledWith('test-hint', expect.any(Function));
    });

    it('only shows tooltip when coordinator calls callback', () => {
      let storedCallback: (() => void) | null = null;
      mockedRequestTooltipDisplay.mockImplementation((_id, callback) => {
        storedCallback = callback;
        return false;
      });

      render(
        <OnboardingTooltip id="test-hint" title="Test Title" description="Test description">
          <button>Click me</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        storedCallback!();
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});
