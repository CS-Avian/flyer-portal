import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../components/common/EmptyState';

describe('EmptyState Component (Unhappy Path Requirement)', () => {
  it('renders the friendly "No data found" title and description without blank screens', () => {
    render(
      <EmptyState
        title="No data found"
        message="No frequent flyer members matched your current filter criteria."
      />
    );

    expect(screen.getByRole('heading', { level: 3, name: /no data found/i })).toBeInTheDocument();
    expect(screen.getByText(/no frequent flyer members matched/i)).toBeInTheDocument();
  });

  it('renders an interactive action button that triggers the provided callback', async () => {
    const handleAction = jest.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No data found"
        message="Search query yielded zero results."
        actionType="reset-filter"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: /reset search filters/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
