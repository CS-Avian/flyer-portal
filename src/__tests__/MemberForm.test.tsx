import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberFormModal } from '../components/members/MemberFormModal';
import { PortalProvider, usePortal } from '../context/PortalContext';

// Helper component to trigger modal opening
const TestWrapper: React.FC = () => {
  const { openCreateMemberModal } = usePortal();
  return (
    <div>
      <button onClick={openCreateMemberModal}>Open Enrollment Form</button>
      <MemberFormModal />
    </div>
  );
};

describe('MemberFormModal: Validation & Unhappy Path Handling', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prevents submission on empty or malformed data and highlights offending fields in red', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <TestWrapper />
      </PortalProvider>
    );

    // Open modal
    await user.click(screen.getByText('Open Enrollment Form'));

    expect(screen.getByRole('dialog', { name: /enroll new frequent flyer/i })).toBeInTheDocument();

    // Click submit without entering required inputs
    const submitBtn = screen.getByRole('button', { name: /submit enrollment/i });
    await user.click(submitBtn);

    // Alert banner and error messages should appear
    expect(screen.getByText(/please correct the highlighted form errors/i)).toBeInTheDocument();
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();

    // Check offending fields: firstName, lastName, email, phoneNumber, passportNumber, homeAirport
    const firstNameInput = screen.getByLabelText(/first name/i);
    expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(firstNameInput.className).toContain('border-error-border');

    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput.className).toContain('border-error-border');

    const passportInput = screen.getByLabelText(/passport number/i);
    expect(passportInput).toHaveAttribute('aria-invalid', 'true');

    const airportInput = screen.getByLabelText(/home station/i);
    expect(airportInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('submits successfully when fields are valid, sanitizes input, and triggers telemetry', async () => {
    const user = userEvent.setup();

    render(
      <PortalProvider>
        <TestWrapper />
      </PortalProvider>
    );

    await user.click(screen.getByText('Open Enrollment Form'));

    // Fill valid data with an XSS attempt in the name and notes
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const passportInput = screen.getByLabelText(/passport number/i);
    const airportInput = screen.getByLabelText(/home station/i);

    await user.type(firstNameInput, 'Gabriel<script>evil()</script>');
    await user.type(lastNameInput, 'Mendez');
    await user.type(emailInput, 'gabriel.m@skyteam.com');
    await user.type(phoneInput, '+1-555-0149');
    await user.type(passportInput, 'X9827361');
    await user.type(airportInput, 'MIA');

    const submitBtn = screen.getByRole('button', { name: /submit enrollment/i });
    await user.click(submitBtn);

    // Wait for async processing and modal close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Check telemetry log was fired with exact string
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Analytics] User interacted with End-to-End Frequent Flyer Portal: Register Frequent Flyer Member')
    );
  });
});
