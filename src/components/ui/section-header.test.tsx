import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  describe('rendering', () => {
    it('renders title correctly', () => {
      render(<SectionHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(<SectionHeader title="Title" description="Test description" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('hides description when not provided', () => {
      render(<SectionHeader title="Title" />);
      const container = screen.getByText('Title').parentElement;
      expect(container?.querySelector('p')).not.toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      render(
        <SectionHeader
          title="Title"
          icon={<span data-testid="test-icon">🔧</span>}
        />
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders action slot when provided', () => {
      render(
        <SectionHeader
          title="Title"
          action={<button data-testid="action-button">Action</button>}
        />
      );
      expect(screen.getByTestId('action-button')).toBeInTheDocument();
    });
  });

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SectionHeader title="Title" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('preserves default classes when custom className is added', () => {
      const { container } = render(
        <SectionHeader title="Title" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-between');
    });
  });

  describe('HTML attributes', () => {
    it('forwards additional HTML attributes', () => {
      render(
        <SectionHeader
          title="Title"
          data-testid="section-header"
          id="my-section"
        />
      );
      const element = screen.getByTestId('section-header');
      expect(element).toHaveAttribute('id', 'my-section');
    });

    it('forwards aria attributes', () => {
      render(
        <SectionHeader
          title="Title"
          aria-label="Section header"
          data-testid="section-header"
        />
      );
      expect(screen.getByTestId('section-header')).toHaveAttribute('aria-label', 'Section header');
    });
  });
});
