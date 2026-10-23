import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import { NetworkBanner } from '../components/common/NetworkBanner';
import { PortalProvider } from '../context/PortalContext';

describe('Bad Connectivity & Loading States (TRD Requirement)', () => {
  it('renders visual loading indicator with accessible status role during async operations', () => {
    render(<LoadingIndicator label="Synchronizing over Slow 3G network..." />);

    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText(/synchronizing over slow 3g network/i)).toBeInTheDocument();
  });

  it('renders network banner allowing floor staff to switch connectivity simulation', () => {
    render(
      <PortalProvider>
        <NetworkBanner />
      </PortalProvider>
    );

    const banner = screen.getByRole('complementary', { name: /network connection management/i });
    expect(banner).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: /select simulated network connection speed/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Normal Online')).toBeInTheDocument();
    expect(screen.getByText('Slow 3G Connection')).toBeInTheDocument();
    expect(screen.getByText('Offline Disconnected')).toBeInTheDocument();
  });
});
