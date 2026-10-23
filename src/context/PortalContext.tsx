import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Member,
  MemberFormData,
  MembershipTier,
  NetworkStatus,
  FilterState,
  TransactionType,
  TransactionRecord,
} from '../types/frequentFlyer';
import {
  loadStoredMembers,
  saveStoredMembers,
  loadStoredNetworkStatus,
  saveStoredNetworkStatus,
  simulateNetworkDelay,
} from '../utils/storage';
import { sanitizeInput, sanitizeObject } from '../utils/sanitizer';
import { logTelemetry } from '../utils/telemetry';
import { INITIAL_MEMBERS } from '../utils/mockData';
import { exportMembersToCSV, parseMembersFromCSV } from '../utils/exportImport';

interface PortalContextType {
  members: Member[];
  filteredMembers: Member[];
  selectedMember: Member | null;
  selectedMemberId: string | null;
  filter: FilterState;
  isLoading: boolean;
  networkStatus: NetworkStatus;
  errorMessage: string | null;
  successMessage: string | null;
  offlineQueueCount: number;

  // Modals
  isMemberModalOpen: boolean;
  isTransactionModalOpen: boolean;
  isImportExportModalOpen: boolean;
  editingMember: Member | null;

  // Actions
  setSelectedMemberId: (id: string | null) => void;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  setNetworkStatus: (status: NetworkStatus) => void;
  openCreateMemberModal: () => void;
  openEditMemberModal: (member: Member) => void;
  closeMemberModal: () => void;
  openTransactionModal: () => void;
  closeTransactionModal: () => void;
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
  clearMessages: () => void;

  // Core Operations
  registerMember: (formData: MemberFormData) => Promise<boolean>;
  updateMember: (id: string, formData: Partial<MemberFormData>) => Promise<boolean>;
  updateMemberTier: (memberId: string, newTier: MembershipTier) => Promise<boolean>;
  processTransaction: (
    memberId: string,
    type: TransactionType,
    amount: number,
    description: string
  ) => Promise<boolean>;
  deleteMember: (memberId: string) => Promise<boolean>;
  handleImportCSV: (csvText: string) => Promise<{ count: number; errors: string[] }>;
  handleExportCSV: () => void;
  resetAllData: () => void;
  syncOfflineQueue: () => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => loadStoredMembers());
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkStatus, setNetworkStatusState] = useState<NetworkStatus>(() =>
    loadStoredNetworkStatus()
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState<boolean>(false);

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    tier: 'ALL',
    status: 'ALL',
    sortBy: 'name',
    sortDirection: 'asc',
  });

  // Sync state to localStorage on member changes
  useEffect(() => {
    saveStoredMembers(members);
  }, [members]);

  const setNetworkStatus = useCallback((status: NetworkStatus) => {
    setNetworkStatusState(status);
    saveStoredNetworkStatus(status);
    logTelemetry('Change Network Simulation Mode', { status });
  }, []);

  const clearMessages = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    const query = filter.searchQuery.trim().toLowerCase();

    return members
      .filter((m) => {
        // Query search
        if (query) {
          const matchId = m.id.toLowerCase().includes(query);
          const matchName = `${m.firstName} ${m.lastName}`.toLowerCase().includes(query);
          const matchEmail = m.email.toLowerCase().includes(query);
          const matchPassport = m.passportNumber.toLowerCase().includes(query);
          const matchAirport = m.homeAirport.toLowerCase().includes(query);
          if (!matchId && !matchName && !matchEmail && !matchPassport && !matchAirport) {
            return false;
          }
        }

        // Tier filter
        if (filter.tier !== 'ALL' && m.tier !== filter.tier) {
          return false;
        }

        // Status filter
        if (filter.status !== 'ALL' && m.status !== filter.status) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filter.sortBy === 'name') {
          comp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        } else if (filter.sortBy === 'miles') {
          comp = a.milesBalance - b.milesBalance;
        } else if (filter.sortBy === 'date') {
          comp = a.joinDate.localeCompare(b.joinDate);
        } else if (filter.sortBy === 'tier') {
          const tierWeight: Record<MembershipTier, number> = {
            Silver: 1,
            Gold: 2,
            Platinum: 3,
            Diamond: 4,
          };
          comp = tierWeight[a.tier] - tierWeight[b.tier];
        }

        return filter.sortDirection === 'asc' ? comp : -comp;
      });
  }, [members, filter]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Modal openers
  const openCreateMemberModal = useCallback(() => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
    clearMessages();
  }, [clearMessages]);

  const openEditMemberModal = useCallback((member: Member) => {
    setEditingMember(member);
    setIsMemberModalOpen(true);
    clearMessages();
  }, [clearMessages]);

  const closeMemberModal = useCallback(() => {
    setIsMemberModalOpen(false);
    setEditingMember(null);
  }, []);

  const openTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(true);
    clearMessages();
  }, [clearMessages]);

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
  }, []);

  const openImportExportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    clearMessages();
  }, [clearMessages]);

  const closeImportExportModal = useCallback(() => {
    setIsImportExportModalOpen(false);
  }, []);

  // Register a new member with XSS sanitization and telemetry
  const registerMember = useCallback(
    async (formData: MemberFormData): Promise<boolean> => {
      setIsLoading(true);
      clearMessages();
      try {
        await simulateNetworkDelay(networkStatus);

        // Security requirement: Sanitize all inputs before saving to state
        const sanitized = sanitizeObject(formData);

        const newId = `FF-${Math.floor(100000 + Math.random() * 900000)}`;
        const initialMiles = Number(sanitized.initialMiles) || 0;

        const initialTransactions: TransactionRecord[] =
          initialMiles > 0
            ? [
                {
                  id: `TX-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'ACCRUAL',
                  description: 'Initial Enrollment Bonus Miles',
                  amount: initialMiles,
                  balanceAfter: initialMiles,
                },
              ]
            : [];

        const newMember: Member = {
          id: newId,
          firstName: sanitized.firstName,
          lastName: sanitized.lastName,
          email: sanitized.email,
          phoneNumber: sanitized.phoneNumber,
          tier: sanitized.tier,
          milesBalance: initialMiles,
          lifetimeMiles: initialMiles,
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          passportNumber: sanitized.passportNumber.toUpperCase(),
          homeAirport: sanitized.homeAirport.toUpperCase(),
          notes: sanitized.notes || '',
          recentFlights: [],
          transactions: initialTransactions,
        };

        setMembers((prev) => [newMember, ...prev]);
        setSelectedMemberId(newMember.id);
        setIsMemberModalOpen(false);

        if (networkStatus === 'OFFLINE') {
          setOfflineQueueCount((c) => c + 1);
          setSuccessMessage(`Member ${newMember.firstName} ${newMember.lastName} saved locally (Offline mode).`);
        } else {
          setSuccessMessage(`Member ${newMember.firstName} ${newMember.lastName} successfully enrolled (${newId}).`);
        }

        // Telemetry requirement
        logTelemetry('Register Frequent Flyer Member', {
          memberId: newId,
          tier: newMember.tier,
          homeAirport: newMember.homeAirport,
        });

        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error during enrollment';
        setErrorMessage(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [networkStatus, clearMessages]
  );

  // Update existing member
  const updateMember = useCallback(
    async (id: string, formData: Partial<MemberFormData>): Promise<boolean> => {
      setIsLoading(true);
      clearMessages();
      try {
        await simulateNetworkDelay(networkStatus);
        const sanitized = sanitizeObject(formData);

        setMembers((prev) =>
          prev.map((m) => {
            if (m.id !== id) return m;
            return {
              ...m,
              firstName: sanitized.firstName !== undefined ? sanitized.firstName : m.firstName,
              lastName: sanitized.lastName !== undefined ? sanitized.lastName : m.lastName,
              email: sanitized.email !== undefined ? sanitized.email : m.email,
              phoneNumber: sanitized.phoneNumber !== undefined ? sanitized.phoneNumber : m.phoneNumber,
              tier: sanitized.tier !== undefined ? sanitized.tier : m.tier,
              passportNumber:
                sanitized.passportNumber !== undefined
                  ? sanitized.passportNumber.toUpperCase()
                  : m.passportNumber,
              homeAirport:
                sanitized.homeAirport !== undefined
                  ? sanitized.homeAirport.toUpperCase()
                  : m.homeAirport,
              notes: sanitized.notes !== undefined ? sanitized.notes : m.notes,
            };
          })
        );

        setIsMemberModalOpen(false);
        setEditingMember(null);
        setSuccessMessage('Member profile updated successfully.');

        logTelemetry('Update Member Profile', { memberId: id });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update member';
        setErrorMessage(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [networkStatus, clearMessages]
  );

  // Update member tier
  const updateMemberTier = useCallback(
    async (memberId: string, newTier: MembershipTier): Promise<boolean> => {
      setIsLoading(true);
      clearMessages();
      try {
        await simulateNetworkDelay(networkStatus);
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, tier: newTier } : m))
        );

        logTelemetry('Update Member Tier Status', { memberId, newTier });
        setSuccessMessage(`Tier updated to ${newTier}.`);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update tier';
        setErrorMessage(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [networkStatus, clearMessages]
  );

  // Process Miles Transaction (Accrual or Redemption)
  const processTransaction = useCallback(
    async (
      memberId: string,
      type: TransactionType,
      amount: number,
      description: string
    ): Promise<boolean> => {
      setIsLoading(true);
      clearMessages();
      try {
        await simulateNetworkDelay(networkStatus);
        const cleanDesc = sanitizeInput(description);
        const numericAmount = Math.abs(amount);
        const signedDelta = type === 'REDEMPTION' ? -numericAmount : numericAmount;

        let ok = false;
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id !== memberId) return m;

            if (type === 'REDEMPTION' && m.milesBalance < numericAmount) {
              throw new Error(`Insufficient miles: member only has ${m.milesBalance.toLocaleString()} miles.`);
            }

            const newBalance = m.milesBalance + signedDelta;
            const newLifetime = signedDelta > 0 ? m.lifetimeMiles + signedDelta : m.lifetimeMiles;

            const newTx: TransactionRecord = {
              id: `TX-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type,
              description: cleanDesc,
              amount: signedDelta,
              balanceAfter: newBalance,
            };

            ok = true;
            return {
              ...m,
              milesBalance: newBalance,
              lifetimeMiles: newLifetime,
              transactions: [newTx, ...m.transactions],
            };
          })
        );

        setIsTransactionModalOpen(false);
        setSuccessMessage(
          type === 'REDEMPTION'
            ? `Redeemed ${numericAmount.toLocaleString()} miles successfully.`
            : `Accrued ${numericAmount.toLocaleString()} miles successfully.`
        );

        logTelemetry('Process Miles Transaction', {
          memberId,
          type,
          amount: signedDelta,
        });

        return ok;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Transaction failed';
        setErrorMessage(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [networkStatus, clearMessages]
  );

  // Delete Member
  const deleteMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      setIsLoading(true);
      clearMessages();
      try {
        await simulateNetworkDelay(networkStatus);
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        if (selectedMemberId === memberId) {
          setSelectedMemberId(null);
        }
        setSuccessMessage('Member removed from portal.');
        logTelemetry('Delete Frequent Flyer Member', { memberId });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete member';
        setErrorMessage(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [networkStatus, selectedMemberId, clearMessages]
  );

  // Import CSV
  const handleImportCSV = useCallback(
    async (csvText: string): Promise<{ count: number; errors: string[] }> => {
      setIsLoading(true);
      clearMessages();
      try {
        await simulateNetworkDelay(networkStatus);
        const parsed = parseMembersFromCSV(csvText);

        if (parsed.members.length > 0) {
          setMembers((prev) => [...parsed.members, ...prev]);
          setSuccessMessage(`Successfully imported ${parsed.members.length} members from CSV.`);
          logTelemetry('Import Members from CSV', { count: parsed.members.length });
        }

        if (parsed.errors.length > 0) {
          setErrorMessage(parsed.errors.join(' '));
        }

        return { count: parsed.members.length, errors: parsed.errors };
      } finally {
        setIsLoading(false);
      }
    },
    [networkStatus, clearMessages]
  );

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const csvContent = exportMembersToCSV(members);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aeromiles_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logTelemetry('Export Members to CSV', { count: members.length });
    setSuccessMessage(`Exported ${members.length} members to CSV.`);
  }, [members]);

  // Reset to default seed data
  const resetAllData = useCallback(() => {
    setMembers(INITIAL_MEMBERS);
    setSelectedMemberId(null);
    setOfflineQueueCount(0);
    saveStoredMembers(INITIAL_MEMBERS);
    logTelemetry('Reset Portal Seed Data');
    setSuccessMessage('Reset portal data to initial benchmark state.');
  }, []);

  // Offline queue sync
  const syncOfflineQueue = useCallback(async () => {
    setIsLoading(true);
    await simulateNetworkDelay('ONLINE');
    setOfflineQueueCount(0);
    setIsLoading(false);
    setSuccessMessage('All offline records synchronized successfully with main portal.');
    logTelemetry('Synchronize Offline Queue', { syncedRecords: offlineQueueCount });
  }, [offlineQueueCount]);

  const value = {
    members,
    filteredMembers,
    selectedMember,
    selectedMemberId,
    filter,
    isLoading,
    networkStatus,
    errorMessage,
    successMessage,
    offlineQueueCount,
    isMemberModalOpen,
    isTransactionModalOpen,
    isImportExportModalOpen,
    editingMember,
    setSelectedMemberId,
    setFilter,
    setNetworkStatus,
    openCreateMemberModal,
    openEditMemberModal,
    closeMemberModal,
    openTransactionModal,
    closeTransactionModal,
    openImportExportModal,
    closeImportExportModal,
    clearMessages,
    registerMember,
    updateMember,
    updateMemberTier,
    processTransaction,
    deleteMember,
    handleImportCSV,
    handleExportCSV,
    resetAllData,
    syncOfflineQueue,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
