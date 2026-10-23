import React from 'react';
import { Wifi, WifiOff, Activity, RefreshCw } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const NetworkBanner: React.FC = () => {
  const {
    networkStatus,
    setNetworkStatus,
    offlineQueueCount,
    syncOfflineQueue,
    isLoading,
  } = usePortal();

  return (
    <div
      role="complementary"
      aria-label="Network Connection Management"
      className="bg-mono-900 text-mono-100 border-b border-mono-800 text-xs px-4 py-2"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {networkStatus === 'ONLINE' && (
            <span className="flex items-center text-mono-300">
              <Wifi className="w-3.5 h-3.5 mr-1 text-mono-100" aria-hidden="true" />
              Connected (High-Speed LAN)
            </span>
          )}
          {networkStatus === 'SLOW_3G' && (
            <span className="flex items-center text-mono-200 bg-mono-800 px-2 py-0.5 rounded">
              <Activity className="w-3.5 h-3.5 mr-1 text-mono-300 animate-pulse" aria-hidden="true" />
              Simulating Slow 3G (High Latency ~1.2s)
            </span>
          )}
          {networkStatus === 'OFFLINE' && (
            <span className="flex items-center text-mono-100 bg-mono-800 px-2 py-0.5 rounded font-medium">
              <WifiOff className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Offline Mode Active (Local Resilient Storage)
            </span>
          )}

          {offlineQueueCount > 0 && (
            <span className="bg-mono-700 text-mono-100 px-2 py-0.5 rounded text-[11px] font-semibold">
              {offlineQueueCount} unsynced {offlineQueueCount === 1 ? 'change' : 'changes'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {offlineQueueCount > 0 && (
            <button
              type="button"
              onClick={syncOfflineQueue}
              disabled={isLoading}
              className="inline-flex items-center px-2 py-1 bg-mono-100 text-mono-900 rounded text-xs font-semibold hover:bg-white focus:outline-none focus:ring-2 focus:ring-mono-400 disabled:opacity-50"
              aria-label="Synchronize offline changes"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Sync Now
            </button>
          )}

          <label htmlFor="network-mode-select" className="text-mono-400 text-xs font-medium">
            Simulate Connectivity:
          </label>
          <select
            id="network-mode-select"
            value={networkStatus}
            onChange={(e) => setNetworkStatus(e.target.value as any)}
            className="bg-mono-800 text-mono-100 border border-mono-700 text-xs rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-mono-400"
            aria-label="Select simulated network connection speed"
          >
            <option value="ONLINE">Normal Online</option>
            <option value="SLOW_3G">Slow 3G Connection</option>
            <option value="OFFLINE">Offline Disconnected</option>
          </select>
        </div>
      </div>
    </div>
  );
};
