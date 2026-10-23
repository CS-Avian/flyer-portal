import { Member, NetworkStatus } from '../types/frequentFlyer';
import { INITIAL_MEMBERS } from './mockData';

const STORAGE_KEY = 'aeromiles_frequent_flyer_members_v1';
const NETWORK_STORAGE_KEY = 'aeromiles_network_simulation_mode';

export function loadStoredMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredMembers(INITIAL_MEMBERS);
      return INITIAL_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MEMBERS;
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveStoredMembers(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function loadStoredNetworkStatus(): NetworkStatus {
  try {
    const status = localStorage.getItem(NETWORK_STORAGE_KEY) as NetworkStatus;
    return status === 'SLOW_3G' || status === 'OFFLINE' ? status : 'ONLINE';
  } catch {
    return 'ONLINE';
  }
}

export function saveStoredNetworkStatus(status: NetworkStatus): void {
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, status);
  } catch (e) {
    console.error('Failed to save network status:', e);
  }
}

/**
 * Simulates network latency matching the user's connection state.
 */
export async function simulateNetworkDelay(status: NetworkStatus): Promise<void> {
  let delay = 50;
  if (status === 'SLOW_3G') {
    delay = 1200; // Slow 3G latency
  } else if (status === 'OFFLINE') {
    delay = 200;
  }
  return new Promise((resolve) => setTimeout(resolve, delay));
}
