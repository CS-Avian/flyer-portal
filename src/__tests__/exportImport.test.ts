import { exportMembersToCSV, parseMembersFromCSV } from '../utils/exportImport';
import { INITIAL_MEMBERS } from '../utils/mockData';

describe('Legacy Excel & CSV Data Exchange', () => {
  it('exports members to a valid RFC-compliant CSV string', () => {
    const csv = exportMembersToCSV(INITIAL_MEMBERS);
    expect(csv).toContain('FirstName,LastName,Email');
    expect(csv).toContain('Eleanor');
    expect(csv).toContain('Marcus');
  });

  it('parses valid CSV data and extracts member entities with active status', () => {
    const rawCSV = `FirstName,LastName,Email,PhoneNumber,Tier,MilesBalance,PassportNumber,HomeAirport
Sarah,Connor,s.connor@skyline.org,+1-555-0182,Platinum,75000,C9283719,LAX
David,Miller,d.miller@transpolar.com,+44-20-555-0199,Gold,32000,G4829103,LHR`;

    const result = parseMembersFromCSV(rawCSV);
    expect(result.errors.length).toBe(0);
    expect(result.members.length).toBe(2);
    expect(result.members[0].firstName).toBe('Sarah');
    expect(result.members[0].tier).toBe('Platinum');
    expect(result.members[0].milesBalance).toBe(75000);
    expect(result.members[1].firstName).toBe('David');
  });

  it('sanitizes malicious script injections in CSV rows during Excel import', () => {
    const maliciousCSV = `FirstName,LastName,Email,PhoneNumber,Tier,MilesBalance,PassportNumber,HomeAirport
<script>alert(1)</script>Bob,Vance,bob@vance.com,+1-555-1234,Gold,1000,P1234567,JFK`;

    const result = parseMembersFromCSV(maliciousCSV);
    expect(result.members.length).toBe(1);
    expect(result.members[0].firstName).not.toContain('<script>');
    expect(result.members[0].firstName).toBe('Bob');
  });

  it('handles empty or missing CSV headers gracefully', () => {
    const emptyResult = parseMembersFromCSV('');
    expect(emptyResult.errors.length).toBeGreaterThan(0);
    expect(emptyResult.members.length).toBe(0);

    const invalidHeaderResult = parseMembersFromCSV('WrongColA,WrongColB\n1,2');
    expect(invalidHeaderResult.errors[0]).toContain('CSV missing required columns');
  });
});
