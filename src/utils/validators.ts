import { MemberFormData, FormValidationErrors } from '../types/frequentFlyer';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
const IATA_REGEX = /^[A-Z]{3}$/;
const PASSPORT_REGEX = /^[A-Z0-9]{6,9}$/i;

export function validateMemberForm(data: MemberFormData): { isValid: boolean; errors: FormValidationErrors } {
  const errors: FormValidationErrors = {};

  // First Name
  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  // Last Name
  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  // Email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address (e.g., name@airline.com)';
  }

  // Phone Number
  if (!data.phoneNumber || !data.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!PHONE_REGEX.test(data.phoneNumber.trim())) {
    errors.phoneNumber = 'Please enter a valid phone number with area code';
  }

  // Passport Number
  if (!data.passportNumber || !data.passportNumber.trim()) {
    errors.passportNumber = 'Passport number is required for floor staff verification';
  } else if (!PASSPORT_REGEX.test(data.passportNumber.trim())) {
    errors.passportNumber = 'Passport number must be 6-9 alphanumeric characters';
  }

  // Home Airport (3-letter IATA)
  if (!data.homeAirport || !data.homeAirport.trim()) {
    errors.homeAirport = 'Home airport is required';
  } else if (!IATA_REGEX.test(data.homeAirport.trim().toUpperCase())) {
    errors.homeAirport = 'Home airport must be a valid 3-letter IATA code (e.g. JFK, LHR)';
  }

  // Initial Miles
  if (data.initialMiles !== undefined && data.initialMiles !== null) {
    const milesNum = Number(data.initialMiles);
    if (isNaN(milesNum) || milesNum < 0) {
      errors.initialMiles = 'Initial miles cannot be negative';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTransaction(amount: number, description: string, currentBalance: number, type: 'ACCRUAL' | 'REDEMPTION'): {
  isValid: boolean;
  errors: FormValidationErrors;
} {
  const errors: FormValidationErrors = {};

  if (!description || !description.trim()) {
    errors.description = 'Transaction description is required';
  }

  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Miles amount must be greater than zero';
  } else if (type === 'REDEMPTION' && amount > currentBalance) {
    errors.amount = `Insufficient miles balance. Member currently has ${currentBalance.toLocaleString()} miles.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
