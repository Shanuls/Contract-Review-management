import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import './QueueList.css';

const TABS = ['Open', 'New', 'In review', 'Blocked', 'Approved', 'Rejected'];
const ITEMS_PER_PAGE = 6; // Manageable slice for large data

function CardSkeleton() {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-box" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
        <div className="skeleton-box" style={{ width: '70px', height: '14px', borderRadius: '4px' }} />
      </div>
      <div className="skeleton-box" style={{ width: '110px', height: '11px', borderRadius: '4px' }} />
      <div className="skeleton-box" style={{ width: '190px', height: '13px', margin: '2px 0 4px 0', borderRadius: '4px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="skeleton-box" style={{ width: '48px', height: '16px', borderRadius: '4px' }} />
        <div className="skeleton-box" style={{ width: '56px', height: '16px', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export default function QueueList({
  contracts = [],
  selectedContract,
  onSelectContract,
  activeTab,
  setActiveTab,
  tabCounts,
  isLoading = false,
  hasError = false,
  onRetry,
  searchQuery = '',
  onClearSearch
}) {
  // Pagination State for Large Data
  const [currentPage, setCurrentPage] = useState(1);

  // Filter alladhu search maarina page 1-ku reset aaganum
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalItems = contracts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  // Slice list according to current page
  const paginatedContracts = contracts.slice(startIndex, endIndex);

  return (
    <div
      className="queue-list-container"
      style={{
        width: '400px',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff'
      }}
    >
      {/* 1. TABS: Filter State */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 8px'
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts?.[tab] || 0;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '14px',
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab}</span>
              <span
                style={{
                  backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 700
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Subheader: Counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          fontSize: '11px',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <span>
          Showing <strong>{isLoading || hasError ? '...' : totalItems === 0 ? '0' : `${startIndex + 1}–${endIndex}`}</strong> of <strong>{totalItems}</strong> contracts
        </span>
        <span>
          Use <strong>J / K</strong> to move
        </span>
      </div>

      {/* 3. The Scrollable List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {hasError ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : totalItems === 0 ? (
          <EmptyState
            title="All caught up."
            description={
              searchQuery
                ? `No contracts match "${searchQuery}".`
                : 'No contracts are waiting for review in this queue.'
            }
            actionText={searchQuery ? 'Clear Search' : 'View All Open'}
            onAction={() => {
              if (searchQuery && onClearSearch) {
                onClearSearch();
              } else if (setActiveTab) {
                setActiveTab('Open');
              }
            }}
          />
        ) : (
          paginatedContracts.map((contract) => {
            const isSelected = selectedContract?.id === contract.id;
            return (
              <div
                key={contract.id}
                onClick={() => onSelectContract(contract)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                  backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>
                    {contract.id}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    ₹{(contract.value / 100000).toLocaleString('en-IN')} Lakh
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {contract.supplier}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1e293b',
                    margin: '3px 0 6px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {contract.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: contract.priority === 'HIGH' ? '#fef2f2' : '#f1f5f9',
                      color: contract.priority === 'HIGH' ? '#dc2626' : '#475569'
                    }}
                  >
                    ↑ {contract.priority}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8'
                    }}
                  >
                    {contract.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Large Data Pagination Footer Controls */}
      {!isLoading && !hasError && totalItems > ITEMS_PER_PAGE && (
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
          }}
        >
          <span style={{ color: '#64748b' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
                color: currentPage === 1 ? '#94a3b8' : '#1e293b',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '11px'
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                color: currentPage === totalPages ? '#94a3b8' : '#1e293b',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '11px'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}