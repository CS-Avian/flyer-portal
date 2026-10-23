import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { MemberFormData, FormValidationErrors, MembershipTier } from '../../types/frequentFlyer';
import { validateMemberForm } from '../../utils/validators';

export const MemberFormModal: React.FC = () => {
  const {
    isMemberModalOpen,
    closeMemberModal,
    editingMember,
    registerMember,
    updateMember,
    isLoading,
  } = usePortal();

  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    tier: 'Silver',
    initialMiles: 0,
    passportNumber: '',
    homeAirport: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMemberModalOpen) {
      if (editingMember) {
        setFormData({
          firstName: editingMember.firstName,
          lastName: editingMember.lastName,
          email: editingMember.email,
          phoneNumber: editingMember.phoneNumber,
          tier: editingMember.tier,
          initialMiles: editingMember.milesBalance,
          passportNumber: editingMember.passportNumber,
          homeAirport: editingMember.homeAirport,
          notes: editingMember.notes || '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          tier: 'Silver',
          initialMiles: 0,
          passportNumber: '',
          homeAirport: '',
          notes: '',
        });
      }
      setErrors({});
      setHasAttemptedSubmit(false);

      // Focus first input for keyboard a11y
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isMemberModalOpen, editingMember]);

  if (!isMemberModalOpen) return null;

  const handleChange = (
    field: keyof MemberFormData,
    value: string | number
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (hasAttemptedSubmit) {
      const validation = validateMemberForm(updated);
      setErrors(validation.errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validation = validateMemberForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (editingMember) {
      await updateMember(editingMember.id, formData);
    } else {
      await registerMember(formData);
    }
  };

  const isFieldInvalid = (field: keyof FormValidationErrors) => Boolean(errors[field]);

  const getInputClass = (field: keyof FormValidationErrors) => {
    const invalid = isFieldInvalid(field);
    return `w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none ${
      invalid
        ? 'border-error-border bg-error-light text-error-text focus:ring-2 focus:ring-error-border'
        : 'border-mono-300 bg-white text-mono-900 focus:border-mono-900 focus:ring-2 focus:ring-mono-900'
    }`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-950/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-lg border border-mono-300 shadow-2xl max-w-2xl w-full my-8 overflow-hidden text-mono-900">
        {/* Modal Header */}
        <div className="bg-mono-900 text-mono-50 px-6 py-4 flex items-center justify-between">
          <h2 id="member-modal-title" className="text-base font-bold tracking-tight">
            {editingMember ? 'Edit Frequent Flyer Profile' : 'Enroll New Frequent Flyer'}
          </h2>
          <button
            type="button"
            onClick={closeMemberModal}
            className="text-mono-400 hover:text-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-mono-300"
            aria-label="Close enrollment form modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="p-3 bg-error-light border border-error-border rounded-md text-error-text text-xs flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="font-semibold block">Please correct the highlighted form errors:</strong>
                <p>Missing or malformed data must be resolved before submitting.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-xs font-semibold text-mono-700 mb-1">
                First Name <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                aria-invalid={isFieldInvalid('firstName')}
                aria-describedby={isFieldInvalid('firstName') ? 'firstName-error' : undefined}
                className={getInputClass('firstName')}
                placeholder="e.g. John"
                required
              />
              {errors.firstName && (
                <p id="firstName-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-xs font-semibold text-mono-700 mb-1">
                Last Name <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                aria-invalid={isFieldInvalid('lastName')}
                aria-describedby={isFieldInvalid('lastName') ? 'lastName-error' : undefined}
                className={getInputClass('lastName')}
                placeholder="e.g. Smith"
                required
              />
              {errors.lastName && (
                <p id="lastName-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-mono-700 mb-1">
                Email Address <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                aria-invalid={isFieldInvalid('email')}
                aria-describedby={isFieldInvalid('email') ? 'email-error' : undefined}
                className={getInputClass('email')}
                placeholder="passenger@domain.com"
                required
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-xs font-semibold text-mono-700 mb-1">
                Phone Number <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                aria-invalid={isFieldInvalid('phoneNumber')}
                aria-describedby={isFieldInvalid('phoneNumber') ? 'phoneNumber-error' : undefined}
                className={getInputClass('phoneNumber')}
                placeholder="+1-555-0192"
                required
              />
              {errors.phoneNumber && (
                <p id="phoneNumber-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Passport Number */}
            <div>
              <label htmlFor="passportNumber" className="block text-xs font-semibold text-mono-700 mb-1">
                Passport Number <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <input
                id="passportNumber"
                name="passportNumber"
                type="text"
                value={formData.passportNumber}
                onChange={(e) => handleChange('passportNumber', e.target.value)}
                aria-invalid={isFieldInvalid('passportNumber')}
                aria-describedby={isFieldInvalid('passportNumber') ? 'passportNumber-error' : undefined}
                className={getInputClass('passportNumber')}
                placeholder="e.g. N1849204"
                required
              />
              {errors.passportNumber && (
                <p id="passportNumber-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                  {errors.passportNumber}
                </p>
              )}
            </div>

            {/* Home Airport (3-letter IATA) */}
            <div>
              <label htmlFor="homeAirport" className="block text-xs font-semibold text-mono-700 mb-1">
                Home Station (3-letter IATA) <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <input
                id="homeAirport"
                name="homeAirport"
                type="text"
                maxLength={3}
                value={formData.homeAirport}
                onChange={(e) => handleChange('homeAirport', e.target.value.toUpperCase())}
                aria-invalid={isFieldInvalid('homeAirport')}
                aria-describedby={isFieldInvalid('homeAirport') ? 'homeAirport-error' : undefined}
                className={getInputClass('homeAirport')}
                placeholder="JFK, LHR, SFO"
                required
              />
              {errors.homeAirport && (
                <p id="homeAirport-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                  {errors.homeAirport}
                </p>
              )}
            </div>

            {/* Loyalty Tier */}
            <div>
              <label htmlFor="tier" className="block text-xs font-semibold text-mono-700 mb-1">
                Tier Level <span className="text-error-border" aria-hidden="true">*</span>
              </label>
              <select
                id="tier"
                name="tier"
                value={formData.tier}
                onChange={(e) => handleChange('tier', e.target.value as MembershipTier)}
                className="w-full px-3 py-2 text-sm rounded-md border border-mono-300 bg-white text-mono-900 focus:outline-none focus:ring-2 focus:ring-mono-900"
                aria-label="Loyalty tier selection"
              >
                <option value="Silver">Silver (Standard)</option>
                <option value="Gold">Gold (Preferred)</option>
                <option value="Platinum">Platinum (Elite)</option>
                <option value="Diamond">Diamond (Global Concierge)</option>
              </select>
            </div>

            {/* Initial Miles */}
            {!editingMember && (
              <div>
                <label htmlFor="initialMiles" className="block text-xs font-semibold text-mono-700 mb-1">
                  Initial Enrollment Miles
                </label>
                <input
                  id="initialMiles"
                  name="initialMiles"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.initialMiles}
                  onChange={(e) => handleChange('initialMiles', Number(e.target.value))}
                  aria-invalid={isFieldInvalid('initialMiles')}
                  aria-describedby={isFieldInvalid('initialMiles') ? 'initialMiles-error' : undefined}
                  className={getInputClass('initialMiles')}
                  placeholder="0"
                />
                {errors.initialMiles && (
                  <p id="initialMiles-error" role="alert" className="text-error-text text-xs font-semibold mt-1">
                    {errors.initialMiles}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Operational Floor Staff Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-mono-700 mb-1">
              Floor Staff Special Handling Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-mono-300 bg-white text-mono-900 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900"
              placeholder="e.g. VIP handling, dietary requirements, assistance needs..."
              aria-label="Floor staff operational notes"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-mono-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeMemberModal}
              disabled={isLoading}
              className="px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-100 focus:outline-none focus:ring-2 focus:ring-mono-900 disabled:opacity-50"
              aria-label="Cancel enrollment"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 border border-transparent text-sm font-bold rounded-md text-mono-50 bg-mono-900 hover:bg-mono-950 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:ring-offset-2 disabled:opacity-50 inline-flex items-center"
              aria-label={editingMember ? 'Save member profile changes' : 'Submit enrollment'}
            >
              {isLoading ? (
                'Processing...'
              ) : editingMember ? (
                'Save Changes'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Complete Enrollment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
