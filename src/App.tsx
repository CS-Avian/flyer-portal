import React, { useState } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { SkipLink } from './components/common/SkipLink';
import { Header } from './components/common/Header';
import { NetworkBanner } from './components/common/NetworkBanner';
import { MemberList } from './components/members/MemberList';
import { MemberDetail } from './components/members/MemberDetail';
import { MemberFormModal } from './components/members/MemberFormModal';
import { TransactionModal } from './components/members/TransactionModal';
import { ImportExportModal } from './components/members/ImportExportModal';
import { LoadingIndicator } from './components/common/LoadingIndicator';
import { telemetryLogBuffer } from './utils/telemetry';
import { AlertCircle, CheckCircle, Terminal, X } from 'lucide-react';

const PortalApp: React.FC = () => {
  const {
    isLoading,
    errorMessage,
    successMessage,
    clearMessages,
    networkStatus,
  } = usePortal();

  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-mono-100 text-mono-900 font-sans selection:bg-mono-900 selection:text-mono-50">
      <SkipLink />
      <NetworkBanner />
      <Header />

      {/* Global Alert Banners */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-error-light border border-error-border rounded-lg text-error-text text-sm flex items-start justify-between shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearMessages}
              className="text-error-text hover:opacity-80 p-1 focus:outline-none focus:ring-1 focus:ring-error-border rounded"
              aria-label="Dismiss error notification"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-4 bg-mono-50 border border-mono-300 rounded-lg text-mono-900 text-sm flex items-start justify-between shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-mono-900 shrink-0" aria-hidden="true" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearMessages}
              className="text-mono-600 hover:text-mono-900 p-1 focus:outline-none focus:ring-1 focus:ring-mono-900 rounded"
              aria-label="Dismiss success notification"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 outline-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 xl:col-span-7">
            <MemberList />
          </div>
          <div className="lg:col-span-6 xl:col-span-5 sticky top-6">
            <MemberDetail />
          </div>
        </div>
      </main>

      {/* Asynchronous Operation Visual Loading Indicator (Slow 3G handling) */}
      {isLoading && (
        <LoadingIndicator
          label={
            networkStatus === 'SLOW_3G'
              ? 'Synchronizing over Slow 3G network...'
              : 'Executing operations request...'
          }
          fullScreen
        />
      )}

      {/* Modals */}
      <MemberFormModal />
      <TransactionModal />
      <ImportExportModal />

      {/* Telemetry Simulation Drawer */}
      {showTelemetryDrawer && (
        <aside
          role="complementary"
          aria-labelledby="telemetry-drawer-heading"
          className="fixed bottom-0 right-0 z-40 max-w-md w-full bg-mono-950 text-mono-100 border-l border-t border-mono-800 shadow-2xl p-4 max-h-96 overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-3 border-b border-mono-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-mono-400" aria-hidden="true" />
              <h2 id="telemetry-drawer-heading" className="text-xs font-bold uppercase tracking-wider">
                Simulated Telemetry Feed
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowTelemetryDrawer(false)}
              className="text-mono-400 hover:text-white p-1 rounded focus:outline-none focus:ring-1 focus:ring-mono-400"
              aria-label="Close telemetry logs drawer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 space-y-2 font-mono text-[11px]">
            {telemetryLogBuffer.length === 0 ? (
              <p className="text-mono-500 italic">No telemetry events logged yet in current session.</p>
            ) : (
              telemetryLogBuffer.map((evt, idx) => (
                <div key={idx} className="p-2 bg-mono-900 rounded border border-mono-800">
                  <div className="flex items-center justify-between text-mono-400 text-[10px]">
                    <span className="font-semibold text-mono-200">{evt.action}</span>
                    <span>{evt.timestamp.split('T')[1].replace('Z', '')}</span>
                  </div>
                  <p className="text-mono-300 mt-1 break-all">
                    [Analytics] User interacted with End-to-End Frequent Flyer Portal: {evt.action}
                  </p>
                  {evt.details && (
                    <pre className="mt-1 text-[10px] text-mono-400 overflow-x-auto">
                      {JSON.stringify(evt.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Corporate Monochromatic Footer */}
      <footer className="bg-mono-900 text-mono-400 text-xs py-4 px-4 sm:px-6 lg:px-8 border-t border-mono-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span>AeroMiles Operations Terminal</span>
            <span>•</span>
            <span>Strict Monochromatic Corporate Design (WCAG AAA Compliant)</span>
            <span>•</span>
            <span className="font-mono text-mono-300">v1.0.0 [Code Freeze]</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
              className="inline-flex items-center text-mono-300 hover:text-mono-100 font-mono text-xs focus:outline-none focus:underline"
              aria-label="Toggle telemetry audit stream"
            >
              <Terminal className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Audit Telemetry ({telemetryLogBuffer.length})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PortalProvider>
      <PortalApp />
    </PortalProvider>
  );
};

export default App;
