import { Member, MembershipTier, AccountStatus } from '../types/frequentFlyer';
import { sanitizeInput } from './sanitizer';

/**
 * Converts member records to a standardized CSV string.
 */
export function exportMembersToCSV(members: Member[]): string {
  const headers = [
    'ID',
    'FirstName',
    'LastName',
    'Email',
    'PhoneNumber',
    'Tier',
    'MilesBalance',
    'LifetimeMiles',
    'Status',
    'JoinDate',
    'PassportNumber',
    'HomeAirport',
    'Notes',
  ];

  const rows = members.map((m) => [
    m.id,
    `"${m.firstName.replace(/"/g, '""')}"`,
    `"${m.lastName.replace(/"/g, '""')}"`,
    `"${m.email}"`,
    `"${m.phoneNumber}"`,
    m.tier,
    m.milesBalance,
    m.lifetimeMiles,
    m.status,
    m.joinDate,
    `"${m.passportNumber}"`,
    m.homeAirport,
    `"${(m.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export interface ParseResult {
  members: Member[];
  errors: string[];
}

/**
 * Parses raw CSV lines, sanitizes all text inputs against XSS injection,
 * and converts them into structured Member records.
 */
export function parseMembersFromCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const errors: string[] = [];
  const members: Member[] = [];

  if (lines.length <= 1) {
    return { members: [], errors: ['CSV file is empty or missing headers'] };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

  const getColIndex = (col: string) => headers.findIndex((h) => h === col.toLowerCase());
  const firstNameIdx = getColIndex('firstname');
  const lastNameIdx = getColIndex('lastname');
  const emailIdx = getColIndex('email');
  const phoneIdx = getColIndex('phonenumber');
  const tierIdx = getColIndex('tier');
  const milesIdx = getColIndex('milesbalance');
  const homeAirportIdx = getColIndex('homeairport');
  const passportIdx = getColIndex('passportnumber');

  if (firstNameIdx === -1 || lastNameIdx === -1 || emailIdx === -1) {
    return {
      members: [],
      errors: ['CSV missing required columns: FirstName, LastName, Email'],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV parser supporting quotes
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    // Sanitize each cell value
    const getCleanValue = (idx: number): string => {
      if (idx === -1 || idx >= cells.length) return '';
      const rawVal = cells[idx].replace(/^"|"$/g, '');
      return sanitizeInput(rawVal);
    };

    const firstName = getCleanValue(firstNameIdx);
    const lastName = getCleanValue(lastNameIdx);
    const email = getCleanValue(emailIdx);
    const phone = phoneIdx !== -1 ? getCleanValue(phoneIdx) : '+1-000-000-0000';
    const tierRaw = tierIdx !== -1 ? getCleanValue(tierIdx) : 'Silver';
    const milesRaw = milesIdx !== -1 ? parseInt(getCleanValue(milesIdx), 10) : 0;
    const passport = passportIdx !== -1 ? getCleanValue(passportIdx) : 'A0000000';
    const airport = homeAirportIdx !== -1 ? getCleanValue(homeAirportIdx).toUpperCase() : 'JFK';

    const validTiers: MembershipTier[] = ['Silver', 'Gold', 'Platinum', 'Diamond'];
    const tier: MembershipTier = validTiers.includes(tierRaw as MembershipTier)
      ? (tierRaw as MembershipTier)
      : 'Silver';

    if (!firstName || !lastName || !email) {
      errors.push(`Row ${i + 1}: Skipped due to missing name or email.`);
      continue;
    }

    const newMember: Member = {
      id: `FF-${Math.floor(100000 + Math.random() * 900000)}`,
      firstName,
      lastName,
      email,
      phoneNumber: phone,
      tier,
      milesBalance: isNaN(milesRaw) ? 0 : Math.max(0, milesRaw),
      lifetimeMiles: isNaN(milesRaw) ? 0 : Math.max(0, milesRaw),
      status: 'Active' as AccountStatus,
      joinDate: new Date().toISOString().split('T')[0],
      passportNumber: passport,
      homeAirport: airport.length === 3 ? airport : 'JFK',
      recentFlights: [],
      transactions: [],
    };

    members.push(newMember);
  }

  return { members, errors };
}
