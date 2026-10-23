export type MembershipTier = 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type AccountStatus = 'Active' | 'Suspended' | 'Pending';

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export type TransactionType = 'ACCRUAL' | 'REDEMPTION' | 'TIER_BONUS' | 'EXPIRY' | 'ADJUSTMENT';

export interface FlightRecord {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  milesEarned: number;
  cabinClass: CabinClass;
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
  balanceAfter: number;
}

export interface Member {
  id: string; // e.g., "FF-782910"
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tier: MembershipTier;
  milesBalance: number;
  lifetimeMiles: number;
  status: AccountStatus;
  joinDate: string;
  passportNumber: string;
  homeAirport: string;
  notes?: string;
  recentFlights: FlightRecord[];
  transactions: TransactionRecord[];
}

export type NetworkStatus = 'ONLINE' | 'SLOW_3G' | 'OFFLINE';

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tier: MembershipTier;
  initialMiles?: number;
  passportNumber: string;
  homeAirport: string;
  notes?: string;
}

export interface FormValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  tier?: string;
  passportNumber?: string;
  homeAirport?: string;
  initialMiles?: string;
  amount?: string;
  description?: string;
}

export interface FilterState {
  searchQuery: string;
  tier: MembershipTier | 'ALL';
  status: AccountStatus | 'ALL';
  sortBy: 'name' | 'miles' | 'tier' | 'date';
  sortDirection: 'asc' | 'desc';
}
