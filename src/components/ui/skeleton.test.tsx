import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  McpServerSkeleton,
  McpServerListSkeleton,
  McpToolStatusSkeleton,
  McpToolStatusListSkeleton,
} from './skeleton';

describe('Skeleton', () => {
  describe('rendering', () => {
    it('renders a div element', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('applies default animation classes', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="w-10 h-10" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('w-10');
      expect(skeleton).toHaveClass('h-10');
    });
  });

  describe('accessibility', () => {
    it('has aria-hidden="true"', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('SkeletonText', () => {
  describe('rendering', () => {
    it('renders a single line by default', () => {
      const { container } = render(<SkeletonText />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(1);
    });

    it('renders multiple lines when specified', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('applies custom className to container', () => {
      const { container } = render(<SkeletonText className="my-custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('my-custom-class');
    });

    it('makes last line shorter when multiple lines', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons[0]).toHaveClass('w-full');
      expect(skeletons[1]).toHaveClass('w-full');
      expect(skeletons[2]).toHaveClass('w-3/4');
    });

    it('single line is full width', () => {
      const { container } = render(<SkeletonText lines={1} />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('w-full');
    });
  });

  describe('accessibility', () => {
    it('has aria-hidden="true" on container', () => {
      const { container } = render(<SkeletonText />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('McpServerSkeleton', () => {
  describe('rendering', () => {
    it('renders skeleton elements', () => {
      const { container } = render(<McpServerSkeleton />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders with card styling', () => {
      const { container } = render(<McpServerSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
    });
  });

  describe('accessibility', () => {
    it('has aria-label for loading state', () => {
      render(<McpServerSkeleton />);
      expect(screen.getByLabelText('Loading server...')).toBeInTheDocument();
    });
  });
});

describe('McpServerListSkeleton', () => {
  describe('rendering', () => {
    it('renders 3 server skeletons by default', () => {
      render(<McpServerListSkeleton />);
      const items = screen.getAllByLabelText('Loading server...');
      expect(items).toHaveLength(3);
    });

    it('renders custom count of server skeletons', () => {
      render(<McpServerListSkeleton count={5} />);
      const items = screen.getAllByLabelText('Loading server...');
      expect(items).toHaveLength(5);
    });

    it('renders zero items when count is 0', () => {
      render(<McpServerListSkeleton count={0} />);
      expect(screen.queryByLabelText('Loading server...')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<McpServerListSkeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label for loading state', () => {
      render(<McpServerListSkeleton />);
      expect(screen.getByLabelText('Loading MCP servers...')).toBeInTheDocument();
    });
  });
});

describe('McpToolStatusSkeleton', () => {
  describe('rendering', () => {
    it('renders skeleton elements', () => {
      const { container } = render(<McpToolStatusSkeleton />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders with card styling', () => {
      const { container } = render(<McpToolStatusSkeleton />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
    });
  });

  describe('accessibility', () => {
    it('has aria-label for loading state', () => {
      render(<McpToolStatusSkeleton />);
      expect(screen.getByLabelText('Loading tool status...')).toBeInTheDocument();
    });
  });
});

describe('McpToolStatusListSkeleton', () => {
  describe('rendering', () => {
    it('renders 4 tool status skeletons by default', () => {
      render(<McpToolStatusListSkeleton />);
      const items = screen.getAllByLabelText('Loading tool status...');
      expect(items).toHaveLength(4);
    });

    it('renders custom count of tool status skeletons', () => {
      render(<McpToolStatusListSkeleton count={2} />);
      const items = screen.getAllByLabelText('Loading tool status...');
      expect(items).toHaveLength(2);
    });

    it('renders zero items when count is 0', () => {
      render(<McpToolStatusListSkeleton count={0} />);
      expect(screen.queryByLabelText('Loading tool status...')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<McpToolStatusListSkeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label for loading state', () => {
      render(<McpToolStatusListSkeleton />);
      expect(screen.getByLabelText('Loading tool statuses...')).toBeInTheDocument();
    });
  });
});
