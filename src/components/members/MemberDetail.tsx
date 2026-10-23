import React from 'react';
import {
  User,
  Plane,
  Phone,
  Mail,
  Shield,
  PlusCircle,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Badge } from '../common/Badge';
import { MembershipTier } from '../../types/frequentFlyer';

export const MemberDetail: React.FC = () => {
  const {
    selectedMember,
    setSelectedMemberId,
    openEditMemberModal,
    openTransactionModal,
    updateMemberTier,
    deleteMember,
  } = usePortal();

  if (!selectedMember) {
    return (
      <div
        role="region"
        aria-label="Member Detail Pane Placeholder"
        className="bg-white rounded-lg border border-mono-200 p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]"
      >
        <div className="w-16 h-16 rounded-full bg-mono-100 flex items-center justify-center mb-4 text-mono-400">
          <User className="w-8 h-8" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-mono-800">No Member Selected</h3>
        <p className="text-xs text-mono-500 max-w-xs mt-1">
          Select any frequent flyer from the roster list on the left to inspect tier status, flight ledger, and balance.
        </p>
      </div>
    );
  }

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMemberTier(selectedMember.id, e.target.value as MembershipTier);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently remove member ${selectedMember.firstName} ${selectedMember.lastName} (${selectedMember.id})?`
      )
    ) {
      deleteMember(selectedMember.id);
    }
  };

  return (
    <article
      role="region"
      aria-labelledby="member-detail-title"
      className="bg-white rounded-lg border border-mono-200 shadow-sm overflow-hidden"
    >
      {/* Header Profile Banner */}
      <div className="bg-mono-900 text-mono-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-mono-800 border-2 border-mono-600 flex items-center justify-center text-xl font-bold text-mono-100 shadow-inner">
              {selectedMember.firstName[0]}
              {selectedMember.lastName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="member-detail-title" className="text-xl font-bold tracking-tight">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <Badge type="tier" value={selectedMember.tier} />
                <Badge type="status" value={selectedMember.status} />
              </div>
              <p className="text-xs font-mono text-mono-400 mt-1">
                ID: {selectedMember.id} • Enrolled {selectedMember.joinDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMemberId(null)}
            className="text-mono-400 hover:text-mono-100 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-400"
            aria-label="Close member detail pane"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="mt-6 pt-4 border-t border-mono-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={openTransactionModal}
              className="inline-flex items-center px-3 py-1.5 bg-mono-50 text-mono-950 rounded text-xs font-bold hover:bg-mono-200 focus:outline-none focus:ring-2 focus:ring-mono-300"
              aria-label="Add transaction or redeem miles"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-mono-900" aria-hidden="true" />
              Miles Transaction
            </button>

            <button
              type="button"
              onClick={() => openEditMemberModal(selectedMember)}
              className="inline-flex items-center px-3 py-1.5 bg-mono-800 border border-mono-700 text-mono-200 rounded text-xs font-semibold hover:bg-mono-700 focus:outline-none focus:ring-2 focus:ring-mono-400"
              aria-label="Edit member profile details"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Edit Profile
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <label htmlFor="tier-select" className="text-xs text-mono-400 font-medium">
                Tier:
              </label>
              <select
                id="tier-select"
                value={selectedMember.tier}
                onChange={handleTierChange}
                className="bg-mono-800 text-mono-100 border border-mono-700 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-mono-300"
                aria-label="Change member membership tier"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-mono-400 hover:text-error-border rounded hover:bg-mono-800 focus:outline-none focus:ring-1 focus:ring-error-border"
              title="Delete member record"
              aria-label={`Delete record for ${selectedMember.firstName} ${selectedMember.lastName}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-mono-200 bg-mono-50">
        <div className="p-4 border-r border-mono-200">
          <span className="text-[11px] uppercase tracking-wider text-mono-500 font-semibold block">
            Available Miles
          </span>
          <span className="text-2xl font-bold font-mono text-mono-900 block mt-1">
            {selectedMember.milesBalance.toLocaleString()}
          </span>
        </div>
        <div className="p-4 border-r border-mono-200">
          <span className="text-[11px] uppercase tracking-wider text-mono-500 font-semibold block">
            Lifetime Miles
          </span>
          <span className="text-2xl font-bold font-mono text-mono-700 block mt-1">
            {selectedMember.lifetimeMiles.toLocaleString()}
          </span>
        </div>
        <div className="p-4 border-r border-mono-200">
          <span className="text-[11px] uppercase tracking-wider text-mono-500 font-semibold block">
            Home Station
          </span>
          <span className="text-2xl font-bold font-mono text-mono-900 block mt-1">
            {selectedMember.homeAirport}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] uppercase tracking-wider text-mono-500 font-semibold block">
            Flights Logged
          </span>
          <span className="text-2xl font-bold font-mono text-mono-900 block mt-1">
            {selectedMember.recentFlights.length}
          </span>
        </div>
      </div>

      {/* Profile & Security Information */}
      <div className="p-6 border-b border-mono-200">
        <h3 className="text-xs uppercase tracking-wider font-bold text-mono-500 mb-4">
          Identity & Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2 text-mono-700">
            <Mail className="w-4 h-4 text-mono-400 shrink-0" aria-hidden="true" />
            <span className="font-mono">{selectedMember.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-mono-700">
            <Phone className="w-4 h-4 text-mono-400 shrink-0" aria-hidden="true" />
            <span className="font-mono">{selectedMember.phoneNumber}</span>
          </div>
          <div className="flex items-center space-x-2 text-mono-700">
            <Shield className="w-4 h-4 text-mono-400 shrink-0" aria-hidden="true" />
            <span>Passport: <strong className="font-mono">{selectedMember.passportNumber}</strong></span>
          </div>
        </div>

        {selectedMember.notes && (
          <div className="mt-4 p-3 bg-mono-100 rounded border border-mono-200 text-xs text-mono-800">
            <strong className="font-semibold block text-mono-900 mb-0.5">Floor Staff Notes:</strong>
            {selectedMember.notes}
          </div>
        )}
      </div>

      {/* Ledger & Transactions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-mono-500">
            Miles Ledger & Activity History
          </h3>
          <span className="text-xs text-mono-500 font-mono">
            {selectedMember.transactions.length} records
          </span>
        </div>

        {selectedMember.transactions.length === 0 ? (
          <p className="text-xs text-mono-500 italic p-4 bg-mono-50 rounded border border-mono-200 text-center">
            No transaction records currently registered for this member.
          </p>
        ) : (
          <div className="overflow-x-auto border border-mono-200 rounded">
            <table className="w-full text-left text-xs" role="table" aria-label="Member Ledger Transactions">
              <thead className="bg-mono-100 text-mono-700 uppercase font-semibold">
                <tr>
                  <th scope="col" className="py-2.5 px-3">Date</th>
                  <th scope="col" className="py-2.5 px-3">Type</th>
                  <th scope="col" className="py-2.5 px-3">Description</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Miles</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200">
                {selectedMember.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-mono-50">
                    <td className="py-2 px-3 font-mono text-mono-600">{tx.date}</td>
                    <td className="py-2 px-3">
                      <span className="font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-mono-100 text-mono-800 border border-mono-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-mono-900 font-medium">{tx.description}</td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${
                      tx.amount > 0 ? 'text-mono-900' : 'text-mono-600'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-mono-700">
                      {tx.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Flight Logs */}
        {selectedMember.recentFlights.length > 0 && (
          <div className="mt-6 pt-6 border-t border-mono-200">
            <h3 className="text-xs uppercase tracking-wider font-bold text-mono-500 mb-3">
              Recent Flight Boarding Logs
            </h3>
            <div className="space-y-2">
              {selectedMember.recentFlights.map((fl) => (
                <div
                  key={fl.id}
                  className="p-3 bg-mono-50 rounded border border-mono-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <Plane className="w-4 h-4 text-mono-600" aria-hidden="true" />
                    <div>
                      <span className="font-bold text-mono-900 font-mono">{fl.flightNumber}</span>
                      <span className="text-mono-500 mx-2">•</span>
                      <span className="font-semibold text-mono-800 font-mono">
                        {fl.origin} → {fl.destination}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-mono-600">
                    <span>{fl.cabinClass}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-mono-900">
                      +{fl.milesEarned.toLocaleString()} pts
                    </span>
                    <span>•</span>
                    <span>{fl.departureDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
