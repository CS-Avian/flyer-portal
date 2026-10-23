import React from 'react';
import { Search, X, ChevronRight, ArrowUpDown } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { MembershipTier, AccountStatus } from '../../types/frequentFlyer';

export const MemberList: React.FC = () => {
  const {
    filteredMembers,
    selectedMemberId,
    setSelectedMemberId,
    filter,
    setFilter,
  } = usePortal();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleClearSearch = () => {
    setFilter((prev) => ({ ...prev, searchQuery: '' }));
  };

  const handleTierFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev) => ({ ...prev, tier: e.target.value as MembershipTier | 'ALL' }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev) => ({ ...prev, status: e.target.value as AccountStatus | 'ALL' }));
  };

  const handleSortToggle = (sortBy: 'name' | 'miles' | 'tier' | 'date') => {
    setFilter((prev) => {
      if (prev.sortBy === sortBy) {
        return {
          ...prev,
          sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        ...prev,
        sortBy,
        sortDirection: 'asc',
      };
    });
  };

  return (
    <section aria-labelledby="member-directory-heading" className="bg-white rounded-lg border border-mono-200 shadow-sm overflow-hidden">
      {/* Control Toolbar */}
      <div className="p-4 border-b border-mono-200 bg-mono-50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 id="member-directory-heading" className="text-base font-bold text-mono-900">
              Frequent Flyer Directory
            </h2>
            <p className="text-xs text-mono-500">
              Showing {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} matching search
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tier Filter */}
            <label htmlFor="tier-filter" className="sr-only">Filter by Loyalty Tier</label>
            <select
              id="tier-filter"
              value={filter.tier}
              onChange={handleTierFilter}
              className="bg-white text-mono-900 border border-mono-300 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-mono-900"
              aria-label="Filter member list by tier"
            >
              <option value="ALL">All Tiers</option>
              <option value="Diamond">Diamond</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </select>

            {/* Status Filter */}
            <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
            <select
              id="status-filter"
              value={filter.status}
              onChange={handleStatusFilter}
              className="bg-white text-mono-900 border border-mono-300 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-mono-900"
              aria-label="Filter member list by account status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="member-search-input" className="sr-only">Search frequent flyer records</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mono-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="member-search-input"
            type="text"
            value={filter.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, Frequent Flyer ID (FF-...), email, passport, or home airport..."
            className="w-full pl-9 pr-9 py-2 bg-white text-mono-900 border border-mono-300 rounded-md text-sm placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-mono-900"
            aria-label="Search frequent flyer records by name, ID, or email"
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-mono-400 hover:text-mono-600 focus:outline-none"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Directory Table / Empty State */}
      {filteredMembers.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No data found"
            message={`No frequent flyer member records matched your search query "${filter.searchQuery}". Try adjusting your filters or search terms.`}
            actionType="reset-filter"
            onAction={() => {
              setFilter({
                searchQuery: '',
                tier: 'ALL',
                status: 'ALL',
                sortBy: 'name',
                sortDirection: 'asc',
              });
            }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" role="table" aria-label="Frequent Flyer Members Roster">
            <thead className="bg-mono-100 text-mono-700 text-xs uppercase tracking-wider border-b border-mono-200">
              <tr>
                <th scope="col" className="py-3 px-4 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('name')}
                    className="inline-flex items-center hover:text-mono-950 focus:outline-none"
                    aria-label="Sort table by member name"
                  >
                    Member Name / ID
                    <ArrowUpDown className="w-3 h-3 ml-1" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('tier')}
                    className="inline-flex items-center hover:text-mono-950 focus:outline-none"
                    aria-label="Sort table by loyalty tier"
                  >
                    Tier
                    <ArrowUpDown className="w-3 h-3 ml-1" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('miles')}
                    className="inline-flex items-center ml-auto hover:text-mono-950 focus:outline-none"
                    aria-label="Sort table by miles balance"
                  >
                    Miles Balance
                    <ArrowUpDown className="w-3 h-3 ml-1" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">Home Airport</th>
                <th scope="col" className="py-3 px-4 font-semibold">Status</th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mono-200">
              {filteredMembers.map((member) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <tr
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMemberId(member.id);
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    aria-selected={isSelected}
                    className={`cursor-pointer transition-colors focus:outline-none focus:bg-mono-100 ${
                      isSelected
                        ? 'bg-mono-100/90 font-medium'
                        : 'hover:bg-mono-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-mono-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-xs text-mono-500 font-mono flex items-center space-x-2">
                        <span>{member.id}</span>
                        <span>•</span>
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge type="tier" value={member.tier} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-mono-900">
                      {member.milesBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-mono-700 font-mono text-xs">
                      {member.homeAirport}
                    </td>
                    <td className="py-3 px-4">
                      <Badge type="status" value={member.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemberId(member.id);
                        }}
                        className="p-1 rounded text-mono-500 hover:text-mono-900 focus:outline-none focus:ring-2 focus:ring-mono-900"
                        aria-label={`View detailed profile for ${member.firstName} ${member.lastName}`}
                      >
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
