import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionModal } from '../components/members/TransactionModal';
import { MemberDetail } from '../components/members/MemberDetail';
import { PortalProvider, usePortal } from '../context/PortalContext';

const TestTransactionApp: React.FC = () => {
  const { setSelectedMemberId } = usePortal();

  React.useEffect(() => {
    // Select the first member (Eleanor Vance)
    setSelectedMemberId('FF-109284');
  }, [setSelectedMemberId]);

  return (
    <div>
      <MemberDetail />
      <TransactionModal />
    </div>
  );
};

describe('Miles Transaction Engine (Ledger, Redemption & Accrual)', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('rejects redemptions exceeding the available balance and highlights the offending field in red', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <TestTransactionApp />
      </PortalProvider>
    );

    // Open transaction modal
    const openTxBtn = await screen.findByRole('button', { name: /add transaction or redeem miles/i });
    await user.click(openTxBtn);

    expect(screen.getByRole('dialog', { name: /miles ledger transaction/i })).toBeInTheDocument();

    // Try to redeem 999,999 miles (exceeding Eleanor's 184,500 balance)
    const amountInput = screen.getByLabelText(/miles amount/i);
    const descInput = screen.getByLabelText(/audit reason & description/i);

    await user.type(amountInput, '999999');
    await user.type(descInput, 'Concorde Charter Reward');

    const submitBtn = screen.getByRole('button', { name: /confirm and execute miles ledger transaction/i });
    await user.click(submitBtn);

    // Check offending field is flagged
    expect(amountInput).toHaveAttribute('aria-invalid', 'true');
    expect(amountInput.className).toContain('border-error-border');
    expect(screen.getByText(/insufficient miles balance/i)).toBeInTheDocument();
  });

  it('successfully processes valid accrual and logs telemetry', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <TestTransactionApp />
      </PortalProvider>
    );

    const openTxBtn = await screen.findByRole('button', { name: /add transaction or redeem miles/i });
    await user.click(openTxBtn);

    // Change type to Accrual
    const typeSelect = screen.getByLabelText(/transaction action type selection/i);
    await user.selectOptions(typeSelect, 'ACCRUAL');

    const amountInput = screen.getByLabelText(/miles amount/i);
    const descInput = screen.getByLabelText(/audit reason & description/i);

    await user.type(amountInput, '1200');
    await user.type(descInput, 'Retroactive flight credit');

    const submitBtn = screen.getByRole('button', { name: /confirm and execute miles ledger transaction/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Analytics] User interacted with End-to-End Frequent Flyer Portal: Process Miles Transaction')
    );
  });
});
