import React, { useState } from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { TransactionType, FormValidationErrors } from '../../types/frequentFlyer';
import { validateTransaction } from '../../utils/validators';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    selectedMember,
    processTransaction,
    isLoading,
  } = usePortal();

  const [type, setType] = useState<TransactionType>('REDEMPTION');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  if (!isTransactionModalOpen || !selectedMember) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const numericAmount = Number(amount);
    const validation = validateTransaction(
      numericAmount,
      description,
      selectedMember.milesBalance,
      type === 'REDEMPTION' ? 'REDEMPTION' : 'ACCRUAL'
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const success = await processTransaction(
      selectedMember.id,
      type,
      numericAmount,
      description
    );

    if (success) {
      setAmount('');
      setDescription('');
      setErrors({});
      setHasAttemptedSubmit(false);
    }
  };

  const isFieldInvalid = (field: keyof FormValidationErrors) => Boolean(errors[field]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-950/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-lg border border-mono-300 shadow-2xl max-w-lg w-full overflow-hidden text-mono-900">
        <div className="bg-mono-900 text-mono-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-mono-300" aria-hidden="true" />
            <h2 id="tx-modal-title" className="text-base font-bold">
              Miles Ledger Transaction
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTransactionModal}
            className="text-mono-400 hover:text-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-mono-300"
            aria-label="Close transaction modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="p-3 bg-mono-50 rounded border border-mono-200 text-xs">
            <span className="text-mono-500 block">Member Account</span>
            <span className="font-bold text-mono-900">
              {selectedMember.firstName} {selectedMember.lastName} ({selectedMember.id})
            </span>
            <span className="text-mono-700 block mt-1">
              Current Available Balance: <strong className="font-mono">{selectedMember.milesBalance.toLocaleString()} miles</strong>
            </span>
          </div>

          {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="p-3 bg-error-light border border-error-border rounded-md text-error-text text-xs flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="font-semibold block">Transaction Rejected:</strong>
                <p>Please fix the highlighted fields in red below.</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="tx-type" className="block text-xs font-semibold text-mono-700 mb-1">
              Transaction Action Type
            </label>
            <select
              id="tx-type"
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-3 py-2 text-sm rounded-md border border-mono-300 bg-white text-mono-900 focus:outline-none focus:ring-2 focus:ring-mono-900"
              aria-label="Transaction action type selection"
            >
              <option value="REDEMPTION">Redemption (Award Flight / Upgrade / Lounge Pass)</option>
              <option value="ACCRUAL">Accrual (Flight Credit / Loyalty Partner)</option>
              <option value="TIER_BONUS">Tier / Promotional Bonus</option>
              <option value="ADJUSTMENT">Administrative Floor Adjustment</option>
            </select>
          </div>

          <div>
            <label htmlFor="tx-amount" className="block text-xs font-semibold text-mono-700 mb-1">
              Miles Amount <span className="text-error-border" aria-hidden="true">*</span>
            </label>
            <input
              id="tx-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              aria-invalid={isFieldInvalid('amount')}
              aria-describedby={isFieldInvalid('amount') ? 'tx-amount-error' : undefined}
              className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none ${
                isFieldInvalid('amount')
                  ? 'border-error-border bg-error-light text-error-text focus:ring-2 focus:ring-error-border'
                  : 'border-mono-300 bg-white text-mono-900 focus:ring-2 focus:ring-mono-900'
              }`}
              required
            />
            {errors.amount && (
              <p id="tx-amount-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                {errors.amount}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tx-desc" className="block text-xs font-semibold text-mono-700 mb-1">
              Audit Reason & Description <span className="text-error-border" aria-hidden="true">*</span>
            </label>
            <input
              id="tx-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Upgrade to First Class JFK-LHR"
              aria-invalid={isFieldInvalid('description')}
              aria-describedby={isFieldInvalid('description') ? 'tx-desc-error' : undefined}
              className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none ${
                isFieldInvalid('description')
                  ? 'border-error-border bg-error-light text-error-text focus:ring-2 focus:ring-error-border'
                  : 'border-mono-300 bg-white text-mono-900 focus:ring-2 focus:ring-mono-900'
              }`}
              required
            />
            {errors.description && (
              <p id="tx-desc-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-mono-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeTransactionModal}
              disabled={isLoading}
              className="px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-100 focus:outline-none focus:ring-2 focus:ring-mono-900 disabled:opacity-50"
              aria-label="Cancel transaction"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 border border-transparent text-sm font-bold rounded-md text-mono-50 bg-mono-900 hover:bg-mono-950 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:ring-offset-2 disabled:opacity-50"
              aria-label="Confirm and execute miles ledger transaction"
            >
              {isLoading ? 'Processing...' : 'Confirm Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
