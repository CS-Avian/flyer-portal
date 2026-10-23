import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberList } from '../components/members/MemberList';
import { PortalProvider } from '../context/PortalContext';

describe('MemberList Component (Agile User Stories & Edge Cases)', () => {
  it('renders frequent flyer roster table with consistent structured data for floor staff', () => {
    render(
      <PortalProvider>
        <MemberList />
      </PortalProvider>
    );

    expect(screen.getByRole('heading', { level: 2, name: /frequent flyer directory/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /frequent flyer members roster/i })).toBeInTheDocument();

    // Verify initial mock members are rendered
    expect(screen.getByText(/Eleanor Vance/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcus Chen/i)).toBeInTheDocument();
  });

  it('filters member roster dynamically when user types in search input', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <MemberList />
      </PortalProvider>
    );

    const searchInput = screen.getByRole('textbox', {
      name: /search frequent flyer records by name, id, or email/i,
    });

    await user.type(searchInput, 'Marcus');

    expect(screen.getByText(/Marcus Chen/i)).toBeInTheDocument();
    expect(screen.queryByText(/Eleanor Vance/i)).not.toBeInTheDocument();
  });

  it('displays the user-friendly "No data found" empty state when search returns no results', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <MemberList />
      </PortalProvider>
    );

    const searchInput = screen.getByRole('textbox', {
      name: /search frequent flyer records by name, id, or email/i,
    });

    await user.type(searchInput, 'NonExistentPassengerXYZ');

    expect(screen.getByRole('heading', { level: 3, name: /no data found/i })).toBeInTheDocument();
    expect(screen.getByText(/no frequent flyer member records matched your search query/i)).toBeInTheDocument();

    // Clicking reset button clears search
    const resetButton = screen.getByRole('button', { name: /reset search filters/i });
    await user.click(resetButton);

    expect(screen.getByText(/Eleanor Vance/i)).toBeInTheDocument();
  });

  it('allows keyboard navigation: selecting a row with the Enter key', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <MemberList />
      </PortalProvider>
    );

    const firstRow = screen.getByText(/Eleanor Vance/i).closest('tr');
    expect(firstRow).toBeInTheDocument();

    if (firstRow) {
      firstRow.focus();
      await user.keyboard('{Enter}');
      expect(firstRow).toHaveAttribute('aria-selected', 'true');
    }
  });
});
