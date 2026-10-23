import { validateMemberForm, validateTransaction } from '../utils/validators';
import { MemberFormData } from '../types/frequentFlyer';

describe('Validation Engine: Agile Unhappy Path Handling', () => {
  const validFormData: MemberFormData = {
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alexander.wright@skyline.org',
    phoneNumber: '+1-555-0192',
    tier: 'Platinum',
    passportNumber: 'N9283719',
    homeAirport: 'JFK',
    initialMiles: 15000,
  };

  describe('validateMemberForm', () => {
    it('passes for complete and well-formed member data', () => {
      const result = validateMemberForm(validFormData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('flags missing first and last names', () => {
      const result = validateMemberForm({
        ...validFormData,
        firstName: '',
        lastName: '   ',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.lastName).toBeDefined();
    });

    it('flags names that are too short', () => {
      const result = validateMemberForm({
        ...validFormData,
        firstName: 'A',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toContain('at least 2 characters');
    });

    it('flags malformed email addresses', () => {
      const invalidEmails = ['plainaddress', 'missingdomain@', 'missinguser.com', '@nodomain.com'];
      for (const email of invalidEmails) {
        const result = validateMemberForm({ ...validFormData, email });
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBeDefined();
      }
    });

    it('flags malformed telephone numbers', () => {
      const result = validateMemberForm({
        ...validFormData,
        phoneNumber: 'abc',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBeDefined();
    });

    it('flags invalid home airport codes (must be 3-letter IATA code)', () => {
      const result = validateMemberForm({
        ...validFormData,
        homeAirport: 'NEWYORK',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.homeAirport).toContain('3-letter IATA');
    });

    it('flags negative initial miles', () => {
      const result = validateMemberForm({
        ...validFormData,
        initialMiles: -500,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.initialMiles).toContain('cannot be negative');
    });

    it('flags invalid passport numbers', () => {
      const result = validateMemberForm({
        ...validFormData,
        passportNumber: '12',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.passportNumber).toBeDefined();
    });
  });

  describe('validateTransaction', () => {
    it('passes for valid accrual transaction', () => {
      const result = validateTransaction(5000, 'Flight credit AV-104', 10000, 'ACCRUAL');
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('flags empty transaction description', () => {
      const result = validateTransaction(1000, '   ', 10000, 'ACCRUAL');
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBeDefined();
    });

    it('flags zero or negative miles amounts', () => {
      const resultZero = validateTransaction(0, 'Bonus', 10000, 'ACCRUAL');
      expect(resultZero.isValid).toBe(false);
      expect(resultZero.errors.amount).toBeDefined();

      const resultNegative = validateTransaction(-2500, 'Bonus', 10000, 'ACCRUAL');
      expect(resultNegative.isValid).toBe(false);
      expect(resultNegative.errors.amount).toBeDefined();
    });

    it('flags redemption amounts exceeding current available miles balance', () => {
      const currentBalance = 15000;
      const requestedRedeem = 25000;
      const result = validateTransaction(
        requestedRedeem,
        'First Class Upgrade',
        currentBalance,
        'REDEMPTION'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toContain('Insufficient miles balance');
    });
  });
});
