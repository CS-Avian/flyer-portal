import React, { useState } from 'react';
import { X, Download, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

const SAMPLE_CSV_TEMPLATE = `FirstName,LastName,Email,PhoneNumber,Tier,MilesBalance,PassportNumber,HomeAirport
Sarah,Connor,s.connor@skyline.org,+1-555-0182,Platinum,75000,C9283719,LAX
David,Miller,d.miller@transpolar.com,+44-20-555-0199,Gold,32000,G4829103,LHR`;

export const ImportExportModal: React.FC = () => {
  const {
    isImportExportModalOpen,
    closeImportExportModal,
    members,
    handleExportCSV,
    handleImportCSV,
    isLoading,
  } = usePortal();

  const [csvContent, setCsvContent] = useState<string>('');
  const [importSummary, setImportSummary] = useState<{ count: number; errors: string[] } | null>(null);

  if (!isImportExportModalOpen) return null;

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    const result = await handleImportCSV(csvContent);
    setImportSummary(result);
    if (result.count > 0 && result.errors.length === 0) {
      setCsvContent('');
    }
  };

  const handleLoadSample = () => {
    setCsvContent(SAMPLE_CSV_TEMPLATE);
    setImportSummary(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-950/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-lg border border-mono-300 shadow-2xl max-w-2xl w-full overflow-hidden text-mono-900">
        <div className="bg-mono-900 text-mono-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-mono-300" aria-hidden="true" />
            <h2 id="import-export-title" className="text-base font-bold">
              Legacy Excel / CSV Portal Data Exchange
            </h2>
          </div>
          <button
            type="button"
            onClick={closeImportExportModal}
            className="text-mono-400 hover:text-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-mono-300"
            aria-label="Close legacy migration modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="p-4 bg-mono-50 border border-mono-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-mono-900">Export Portal Records</h3>
              <p className="text-xs text-mono-600 mt-0.5">
                Download current {members.length} member roster records formatted as standard CSV for backup or audits.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 bg-mono-900 text-mono-50 rounded-md text-xs font-bold hover:bg-mono-950 focus:outline-none focus:ring-2 focus:ring-mono-900 shrink-0"
              aria-label="Download frequent flyer records CSV"
            >
              <Download className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Download CSV
            </button>
          </div>

          {/* Import Section */}
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-mono-900">Import Records from Excel / CSV</h3>
                <p className="text-xs text-mono-600">
                  Paste rows directly from your existing Excel spreadsheet. All fields are sanitized against XSS injection before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-mono-700 underline hover:text-mono-950 focus:outline-none"
                aria-label="Load sample CSV data format"
              >
                Insert Sample Rows
              </button>
            </div>

            <div>
              <label htmlFor="csv-textarea" className="sr-only">
                CSV Input Text Area
              </label>
              <textarea
                id="csv-textarea"
                rows={6}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="FirstName,LastName,Email,PhoneNumber,Tier,MilesBalance,PassportNumber,HomeAirport&#10;John,Doe,j.doe@example.com,+1-555-0100,Gold,50000,P8392019,JFK"
                className="w-full p-3 font-mono text-xs rounded-md border border-mono-300 bg-white text-mono-900 focus:outline-none focus:ring-2 focus:ring-mono-900"
                aria-label="CSV spreadsheet data input"
              />
            </div>

            {importSummary && (
              <div
                role="status"
                className={`p-3 rounded-md border text-xs ${
                  importSummary.count > 0 && importSummary.errors.length === 0
                    ? 'bg-mono-100 border-mono-300 text-mono-900'
                    : 'bg-error-light border-error-border text-error-text'
                }`}
              >
                {importSummary.count > 0 && (
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <CheckCircle className="w-4 h-4 text-mono-900" aria-hidden="true" />
                    <span>Successfully ingested {importSummary.count} frequent flyer members into portal.</span>
                  </div>
                )}
                {importSummary.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-1 font-bold">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      <span>Import Warnings:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {importSummary.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={closeImportExportModal}
                className="px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-100 focus:outline-none focus:ring-2 focus:ring-mono-900"
                aria-label="Close modal"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!csvContent.trim() || isLoading}
                className="inline-flex items-center px-5 py-2 bg-mono-900 text-mono-50 rounded-md text-sm font-bold hover:bg-mono-950 focus:outline-none focus:ring-2 focus:ring-mono-900 disabled:opacity-50"
                aria-label="Execute CSV import into database"
              >
                <Upload className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {isLoading ? 'Ingesting...' : 'Ingest & Sanitize CSV'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
