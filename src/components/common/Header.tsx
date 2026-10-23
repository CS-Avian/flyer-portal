import React from 'react';
import { Plane, UserPlus, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const Header: React.FC = () => {
  const {
    members,
    openCreateMemberModal,
    openImportExportModal,
    resetAllData,
  } = usePortal();

  return (
    <header className="bg-mono-950 text-mono-50 border-b border-mono-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-mono-50 text-mono-950 flex items-center justify-center font-bold shadow">
              <Plane className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-mono-50">
                  End-to-End Frequent Flyer Portal
                </h1>
                <span className="text-[10px] tracking-wider uppercase font-semibold bg-mono-800 text-mono-300 px-2 py-0.5 rounded border border-mono-700">
                  Floor Staff Terminal
                </span>
              </div>
              <p className="text-xs text-mono-400 mt-0.5">
                Airport Operations & Loyalty Systems | Active Roster: {members.length} members
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreateMemberModal}
              className="inline-flex items-center px-3.5 py-2 border border-mono-50 rounded-md shadow-sm text-xs font-semibold text-mono-950 bg-mono-50 hover:bg-mono-200 focus:outline-none focus:ring-2 focus:ring-mono-300 focus:ring-offset-2 focus:ring-offset-mono-950 transition-colors"
              aria-label="Enroll new frequent flyer member"
            >
              <UserPlus className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Enroll Member
            </button>

            <button
              type="button"
              onClick={openImportExportModal}
              className="inline-flex items-center px-3.5 py-2 border border-mono-700 rounded-md shadow-sm text-xs font-semibold text-mono-200 bg-mono-900 hover:bg-mono-800 focus:outline-none focus:ring-2 focus:ring-mono-400 focus:ring-offset-2 focus:ring-offset-mono-950 transition-colors"
              aria-label="Open CSV and Excel migration tool"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-mono-300" aria-hidden="true" />
              Import / Export CSV
            </button>

            <button
              type="button"
              onClick={resetAllData}
              className="inline-flex items-center px-3 py-2 border border-mono-800 rounded-md text-xs font-medium text-mono-400 hover:text-mono-200 hover:bg-mono-900 focus:outline-none focus:ring-2 focus:ring-mono-400 transition-colors"
              title="Reset portal to default benchmark dataset"
              aria-label="Reset portal data to initial benchmark state"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Reset Seed Data
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
