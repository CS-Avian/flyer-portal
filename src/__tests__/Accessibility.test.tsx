import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { App } from '../App';
import { Header } from '../components/common/Header';
import { EmptyState } from '../components/common/EmptyState';
import { MemberList } from '../components/members/MemberList';
import { PortalProvider } from '../context/PortalContext';

expect.extend(toHaveNoViolations);

describe('Accessibility (a11y) Quality Compliance', () => {
  it('App root has zero axe-core accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Header component adheres to WCAG accessibility criteria', async () => {
    const { container } = render(
      <PortalProvider>
        <Header />
      </PortalProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MemberList component table and filters adhere to accessibility rules', async () => {
    const { container } = render(
      <PortalProvider>
        <MemberList />
      </PortalProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('EmptyState component has proper landmark and accessible elements', async () => {
    const { container } = render(
      <EmptyState
        title="No data found"
        message="Search yielded zero records"
        onAction={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
